import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Administration } from "../modules/organizations/application/administration";
import { rpc } from "./commands";
export const administration = (client: SupabaseClient): Administration => ({
  async member(id) {
    const { data, error } = await client
      .from("organization_memberships")
      .select(
        "id,organization_id,role,status,professional_profiles!inner(status)",
      )
      .eq("id", id)
      .single();
    if (error || !data) throw new Error("Membre inaccessible");
    const profile = data.professional_profiles as unknown as { status: string };
    return {
      id: data.id,
      organizationId: data.organization_id,
      role: data.role,
      active: data.status === "active",
      profileActive: profile.status === "active",
    };
  },
  async activeAdmins(org) {
    const { count, error } = await client
      .from("organization_memberships")
      .select("id,professional_profiles!inner(status)", {
        count: "exact",
        head: true,
      })
      .eq("organization_id", org)
      .eq("role", "client_admin")
      .eq("status", "active")
      .eq("professional_profiles.status", "active");
    if (error || count === null)
      throw new Error("Contexte administratif indisponible");
    return count;
  },
  changeMember: (id, role, active) =>
    rpc(client, "change_member", {
      p_member: id,
      p_role: role,
      p_active: active,
    }),
  saveService: (org, code, name, status) =>
    rpc(client, "save_service", {
      p_org: org,
      p_code: code,
      p_name: name,
      p_status: status,
    }),
  setServiceMember: (org, member, service, active) =>
    rpc(client, "set_service_member", {
      p_org: org,
      p_member: member,
      p_service: service,
      p_active: active,
    }),
});
