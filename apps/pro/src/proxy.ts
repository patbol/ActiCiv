import { NextResponse, type NextRequest } from "next/server";
import { createProfessionalClient } from "@acticiv/backend";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!process.env.SUPABASE_PUBLISHABLE_KEY) return response;
  const client = createProfessionalClient(process.env, {
    getAll: () => request.cookies.getAll(),
    setAll: (values) => {
      for (const { name, value } of values) request.cookies.set(name, value);
      response = NextResponse.next({ request });
      for (const { name, value, options } of values)
        response.cookies.set(name, value, options);
    },
  });
  await client.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/auth/:path*",
    "/espace/:path*",
    "/api/configuration/:path*",
    "/api/platform/:path*",
  ],
};
