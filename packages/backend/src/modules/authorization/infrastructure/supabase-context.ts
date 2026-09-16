import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContextReader } from "../application/context";
import type { Role } from "../domain/policy";
export function supabaseContext(client: SupabaseClient): ContextReader {
  return {
    async readVerifiedContext() {
      const {
        data: { user },
        error,
      } = await client.auth.getUser();
      if (error || !user) return null;
      const { data: profile } = await client
        .from("professional_profiles")
        .select("status")
        .eq("id", user.id)
        .maybeSingle();
      const { data: membership } = await client
        .from("organization_memberships")
        .select("id,organization_id,role,status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (
        !profile ||
        !membership ||
        !["agent", "supervisor", "client_admin"].includes(membership.role)
      )
        return null;
      const { data: organization } = await client
        .from("organizations")
        .select("status")
        .eq("id", membership.organization_id)
        .maybeSingle();
      const { data: services, error: servicesError } = await client
        .from("service_memberships")
        .select("service_id,services!inner(status)")
        .eq("membership_id", membership.id)
        .eq("active", true)
        .eq("services.status", "active");
      if (servicesError) throw new Error("Contexte professionnel indisponible");
      return {
        userId: user.id,
        profileActive: profile.status === "active",
        organizationId: membership.organization_id,
        organizationActive: organization?.status === "active",
        membershipActive: membership.status === "active",
        role: membership.role as Role,
        services: (services ?? []).map((row) => String(row.service_id)),
      };
    },
  };
}
