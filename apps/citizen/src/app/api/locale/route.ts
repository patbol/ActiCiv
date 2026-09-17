import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localeCookie } from "@acticiv/shared/locale";
export async function POST(request: NextRequest) {
  const origin = process.env.CITIZEN_APP_ORIGIN ?? "http://127.0.0.1:3000";
  if (request.headers.get("origin") !== origin)
    return new NextResponse(null, { status: 403 });
  try {
    const value: unknown = await request.json();
    if (
      !value ||
      typeof value !== "object" ||
      !("locale" in value) ||
      Object.keys(value).length !== 1 ||
      !isLocale(value.locale)
    )
      return new NextResponse(null, { status: 400 });
    const response = new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "private, no-store" },
    });
    response.cookies.set(localeCookie, value.locale, {
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https:"),
      path: "/",
      maxAge: 31536000,
    });
    return response;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}
