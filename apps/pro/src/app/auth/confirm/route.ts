import { telemetry, commandContext } from "@acticiv/backend/observability";
import { NextResponse, type NextRequest } from "next/server";
import { createProfessionalClient } from "@acticiv/backend";
import { professionalOrigin } from "../../../lib/auth";
export async function GET(request: NextRequest) {
  const context = commandContext();
  const token = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (token && (type === "invite" || type === "recovery")) {
    const response = NextResponse.redirect(
      new URL("/auth/password", professionalOrigin()),
    );
    const client = createProfessionalClient(
      process.env,
      {
        getAll: () => request.cookies.getAll(),
        setAll: (values) => {
          for (const { name, value, options } of values)
            response.cookies.set(name, value, options);
        },
      },
      context.correlationId,
    );
    const { error } = await client.auth.verifyOtp({ token_hash: token, type });
    if (!error) return response;
  }
  telemetry.logger.warn("AUTH_CONFIRM_FAILED", context, { status: 400 });
  return NextResponse.redirect(
    new URL("/auth/login?error=1", professionalOrigin()),
  );
}
