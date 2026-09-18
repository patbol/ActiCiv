import {
  telemetry,
  commandContext,
  localeSaved,
} from "@acticiv/backend/observability";
import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localeCookie } from "@acticiv/shared/locale";
export async function POST(request: NextRequest) {
  const context = commandContext();
  const rejected = (status: number, error?: unknown) => {
    telemetry.logger.warn("LOCALE_SAVE_FAILED", context, { status, error });
    return new NextResponse(null, {
      status,
      headers: { "X-Correlation-ID": context.correlationId },
    });
  };
  const origin = process.env.CITIZEN_APP_ORIGIN ?? "http://127.0.0.1:3000";
  if (request.headers.get("origin") !== origin) return rejected(403);
  try {
    const value: unknown = await request.json();
    if (
      !value ||
      typeof value !== "object" ||
      !("locale" in value) ||
      Object.keys(value).length !== 1 ||
      !isLocale(value.locale)
    )
      return rejected(400);
    const response = new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Correlation-ID": context.correlationId,
      },
    });
    response.cookies.set(localeCookie, value.locale, {
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https:"),
      path: "/",
      maxAge: 31536000,
    });
    localeSaved(telemetry, context, "citizen", value.locale, "cookie");
    return response;
  } catch (error) {
    return rejected(400, error);
  }
}
