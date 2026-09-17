import {
  requirePermission,
  type Context,
  type Role,
} from "../../authorization/domain/policy";
export type Invitation = {
  id: string;
  email: string;
  state: "pending" | "sent" | "accepted" | "cancelled";
  expires_at: string;
  correlation_id: string;
};
export interface Invitations {
  reserve(
    org: string,
    email: string,
    role: Role,
    services: string[],
    key: string,
  ): Promise<Invitation>;
  bind(id: string, user: string): Promise<void>;
}
export interface IdentityInviter {
  invite(email: string, correlationId: string): Promise<string>;
}
export async function inviteProfessional(
  context: Context | null,
  org: string,
  email: string,
  role: Role,
  services: string[],
  key: string,
  repository: Invitations,
  provider: IdentityInviter,
  now: () => number = Date.now,
) {
  requirePermission(context, "members.write", { organizationId: org });
  const invitation = await repository.reserve(org, email, role, services, key);
  if (
    invitation.state === "accepted" ||
    invitation.state === "cancelled" ||
    Date.parse(invitation.expires_at) <= now()
  )
    throw new Error("Invitation expirée ou terminée");
  if (invitation.state === "sent") return invitation.id;
  const user = await provider.invite(
    invitation.email,
    invitation.correlation_id,
  );
  await repository.bind(invitation.id, user);
  return invitation.id;
}
