import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrganizationPlatform } from "../application/platform";
import { rpc } from "../../../platform/commands";
export function organizationPlatform(
  client: SupabaseClient,
): OrganizationPlatform {
  return {
    save: (v) =>
      rpc(client, "save_organization", {
        p_code: v.code,
        p_name: v.name,
        p_status: v.status,
      }),
    recover: (v) =>
      rpc(client, "recover_organization", {
        p_org: v.organizationId,
        p_user: v.userId,
        p_name: v.name,
      }),
  };
}
