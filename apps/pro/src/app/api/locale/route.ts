import { NextResponse, type NextRequest } from "next/server";
import {
  changeLocalePreference,
  readLocalePreferences,
} from "@acticiv/backend";
import { isLocale, localeCookie } from "@acticiv/shared/locale";
import { professionalClient, professionalOrigin } from "../../../lib/auth";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== professionalOrigin())
    return new NextResponse(null, { status: 403 });
  try {
    const value: unknown = await request.json();
    if (
      !value ||
      typeof value !== "object" ||
      !("locale" in value) ||
      Object.keys(value).length !== 1 ||
      (value.locale !== null && !isLocale(value.locale))
    )
      return new NextResponse(null, { status: 400 });
    const client = await professionalClient();
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    const response = new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "private, no-store" },
    });
    const preferences =
      user && !error ? await readLocalePreferences(client) : null;
    // Auth-only invitees may choose UI language; they get no profile write.
    if (preferences) await changeLocalePreference(client, value);
    else {
      if (!isLocale(value.locale))
        return new NextResponse(null, { status: 400 });
      response.cookies.set(localeCookie, value.locale, {
        httpOnly: true,
        sameSite: "lax",
        secure: professionalOrigin().startsWith("https:"),
        path: "/",
        maxAge: 31536000,
      });
    }
    return response;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}
