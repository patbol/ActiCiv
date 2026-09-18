import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlatformReader } from "../application/read";
export function platformIdentity(client: SupabaseClient): PlatformReader {
  return {
    async read() {
      const {
        data: { user },
        error,
      } = await client.auth.getUser();
      if (error || !user) return null;
      const { data, error: failed } = await client
        .from("platform_admins")
        .select("active,capabilities")
        .eq("id", user.id)
        .eq("active", true)
        .maybeSingle();
      if (
        failed ||
        !data ||
        !Array.isArray(data.capabilities) ||
        !data.capabilities.every((v: unknown) => typeof v === "string")
      )
        return null;
      return {
        userId: user.id,
        active: data.active === true,
        capabilities: data.capabilities as string[],
      };
    },
  };
}
