import "server-only";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { parseServerEnv } from "../../../config/env";
export function createProfessionalClient(
  env: Record<string, string | undefined>,
  cookies: CookieMethodsServer,
  correlationId: string = crypto.randomUUID(),
) {
  const config = parseServerEnv(env);
  return createServerClient(
    config.SUPABASE_URL,
    config.SUPABASE_PUBLISHABLE_KEY,
    { cookies, global: { headers: { "x-acticiv-command-id": correlationId } } },
  );
}
