import { NextResponse, type NextRequest } from "next/server";
import { safeDestination } from "@acticiv/backend";
import { professionalClient, professionalOrigin } from "../../../lib/auth";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const client = await professionalClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(
          safeDestination(request.nextUrl.searchParams.get("next")),
          professionalOrigin(),
        ),
      );
  }
  return NextResponse.redirect(
    new URL("/auth/login?error=1", professionalOrigin()),
  );
}
