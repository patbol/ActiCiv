import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfessionalSession } from "../application/session";
import { getProfessionalContext } from "../../authorization/application/context";
import { supabaseContext } from "../../authorization/infrastructure/supabase-context";
export function professionalSession(
  client: SupabaseClient,
  origin: string,
): ProfessionalSession {
  function checked(error: unknown) {
    if (error) throw new Error("Opération Auth refusée", { cause: error });
  }
  return {
    async identity() {
      const { data, error } = await client.auth.getUser();
      return error ? null : (data.user?.id ?? null);
    },
    async signIn(email, password) {
      checked(
        (await client.auth.signInWithPassword({ email, password })).error,
      );
    },
    async recover(email) {
      checked(
        (
          await client.auth.resetPasswordForEmail(email, {
            redirectTo: origin + "/auth/callback?next=/auth/password",
          })
        ).error,
      );
    },
    async changePassword(password) {
      checked((await client.auth.updateUser({ password })).error);
    },
    async activeProfessional() {
      return (await getProfessionalContext(supabaseContext(client))) !== null;
    },
    async pendingInvitations() {
      const { data, error } = await client.rpc("pending_invitation_context");
      checked(error);
      return data ?? [];
    },
    async acceptInvitation(id, name) {
      checked(
        (
          await client.rpc("accept_invitation", {
            p_invitation: id,
            p_name: name,
          })
        ).error,
      );
    },
    async signOut() {
      checked((await client.auth.signOut()).error);
    },
  };
}
