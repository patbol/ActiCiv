import "server-only";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { parseServerEnv } from "../../../config/env";
export function createProfessionalClient(
  env: Record<string, string | undefined>,
  cookies: CookieMethodsServer,
) {
  const config = parseServerEnv(env);
  return createServerClient(
    config.SUPABASE_URL,
    config.SUPABASE_PUBLISHABLE_KEY,
    { cookies },
  );
}
