import {
  telemetry,
  commandContext,
  localeSaved,
} from "@acticiv/backend/observability";
import { NextResponse, type NextRequest } from "next/server";
import {
  changeLocalePreference,
  readLocalePreferences,
} from "@acticiv/backend";
import { isLocale, localeCookie } from "@acticiv/shared/locale";
import { professionalClient, professionalOrigin } from "../../../lib/auth";
export async function POST(request: NextRequest) {
  const context = commandContext();
  const rejected = (status: number, error?: unknown) => {
    telemetry.logger.warn("LOCALE_SAVE_FAILED", context, { status, error });
    return new NextResponse(null, {
      status,
      headers: { "X-Correlation-ID": context.correlationId },
    });
  };
  if (request.headers.get("origin") !== professionalOrigin())
    return rejected(403);
  try {
    const value: unknown = await request.json();
    if (
      !value ||
      typeof value !== "object" ||
      !("locale" in value) ||
      Object.keys(value).length !== 1 ||
      (value.locale !== null && !isLocale(value.locale))
    )
      return rejected(400);
    const client = await professionalClient(context.correlationId);
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    const response = new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Correlation-ID": context.correlationId,
      },
    });
    const preferences =
      user && !error ? await readLocalePreferences(client) : null;
    // Auth-only invitees may choose UI language; they get no profile write.
    if (preferences)
      await changeLocalePreference(client, value, { telemetry, context });
    else {
      if (!isLocale(value.locale)) return rejected(400);
      response.cookies.set(localeCookie, value.locale, {
        httpOnly: true,
        sameSite: "lax",
        secure: professionalOrigin().startsWith("https:"),
        path: "/",
        maxAge: 31536000,
      });
      localeSaved(telemetry, context, "pro", value.locale, "cookie");
    }
    return response;
  } catch (error) {
    return rejected(400, error);
  }
}
