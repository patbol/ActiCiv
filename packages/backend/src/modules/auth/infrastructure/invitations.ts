import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Invitations, IdentityInviter } from "../application/invite";
export function invitationAdapters(
  user: SupabaseClient,
  env: Record<string, string | undefined>,
  origin: string,
): { repository: Invitations; provider: IdentityInviter } {
  const url = env.SUPABASE_URL,
    key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Configuration invitation indisponible");
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return {
    repository: {
      async reserve(org, email, role, services, key) {
        const { data, error } = await user.rpc("reserve_invitation", {
          p_org: org,
          p_email: email,
          p_role: role,
          p_services: services,
          p_key: key,
        });
        if (error) throw new Error("Invitation refusée");
        return data;
      },
      async bind(id, uid) {
        const { error } = await admin.rpc("mark_invitation_sent", {
          p_invitation: id,
          p_user: uid,
        });
        if (error) throw new Error("Invitation à reprendre");
      },
    },
    provider: {
      async invite(email) {
        const { data, error } = await admin.auth.admin.inviteUserByEmail(
          email,
          { redirectTo: origin + "/auth/callback?next=/auth/password" },
        );
        if (!error && data.user) return data.user.id;
        // Recover only the exact email after an ambiguous external failure; membership remains absent.
        for (let page = 1; page <= 100; page++) {
          const result = await admin.auth.admin.listUsers({
            page,
            perPage: 100,
          });
          if (result.error) break;
          const existing = result.data.users.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase(),
          );
          if (existing) {
            const reset = await user.auth.resetPasswordForEmail(email, {
              redirectTo: origin + "/auth/callback?next=/auth/password",
            });
            if (reset.error) throw new Error("Envoi invitation indisponible");
            return existing.id;
          }
          if (result.data.users.length < 100) break;
        }
        throw new Error("Envoi invitation indisponible");
      },
    },
  };
}
