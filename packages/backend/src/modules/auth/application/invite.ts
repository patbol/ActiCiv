import { notifyAuth, type AuthObserver } from "./observation";
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
  observer?: AuthObserver,
) {
  requirePermission(context, "members.write", { organizationId: org });
  const invitation = await repository.reserve(org, email, role, services, key);
  if (
    invitation.state === "accepted" ||
    invitation.state === "cancelled" ||
    Date.parse(invitation.expires_at) <= now()
  )
    throw new Error("Invitation expirée ou terminée");
  const correlation = invitation.correlation_id;
  if (invitation.state === "sent") {
    notifyAuth(observer, "invitation.reused", correlation);
    return invitation.id;
  }
  notifyAuth(observer, "invitation.reserved", correlation);
  let user: string;
  try {
    user = await provider.invite(invitation.email, correlation);
  } catch (error) {
    notifyAuth(observer, "invitation.provider_failed", correlation, error);
    throw error;
  }
  try {
    await repository.bind(invitation.id, user);
  } catch (error) {
    notifyAuth(observer, "invitation.bind_failed", correlation, error);
    throw error;
  }
  notifyAuth(observer, "invitation.sent", correlation);
  return invitation.id;
}
