import "server-only";
import { createClient } from "@supabase/supabase-js";
import { parseServerEnv } from "../config/env";
/** Public-key client. No service_role fallback and no invented user identity. */
export function createServerDataClient(
  env: Record<string, string | undefined>,
) {
  const config = parseServerEnv(env);
  return createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
