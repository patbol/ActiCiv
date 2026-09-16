import { NextResponse, type NextRequest } from "next/server";
import { professionalClient, professionalOrigin } from "../../../lib/auth";
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (token && (type === "invite" || type === "recovery")) {
    const client = await professionalClient();
    const { error } = await client.auth.verifyOtp({ token_hash: token, type });
    if (!error)
      return NextResponse.redirect(
        new URL("/auth/password", professionalOrigin()),
      );
  }
  return NextResponse.redirect(
    new URL("/auth/login?error=1", professionalOrigin()),
  );
}
