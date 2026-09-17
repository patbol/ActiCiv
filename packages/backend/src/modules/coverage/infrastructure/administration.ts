import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CoverageAdministration } from "../application/administration";
import { rpc } from "../../../platform/commands";
export function coverageAdministration(
  client: SupabaseClient,
): CoverageAdministration {
  return {
    saveTerritory: (v) =>
      rpc(client, "save_territory", {
        p_code: v.code,
        p_name: v.name,
        p_kind: v.kind,
        p_geometry: v.geometry,
        p_parent: v.parentId,
      }),
    saveContract: (v) =>
      rpc(client, "save_contract", {
        p_org: v.organizationId,
        p_reference: v.reference,
        p_status: v.status,
        p_from: v.from,
        p_until: v.until,
        p_plan: v.plan,
      }),
    setScope: (v) =>
      rpc(client, "set_contract_scope", {
        p_contract: v.contractId,
        p_territory: v.territoryId,
        p_categories: v.categories,
        p_services: v.services,
      }),
  };
}
