import { observeAuth, type AuthObserver } from "./observation";
export interface ProfessionalSession {
  identity(): Promise<string | null>;
  signIn(email: string, password: string): Promise<void>;
  recover(email: string): Promise<void>;
  changePassword(password: string): Promise<void>;
  activeProfessional(): Promise<boolean>;
  pendingInvitations(): Promise<
    readonly { id: string; correlation_id: string }[]
  >;
  acceptInvitation(id: string, name: string): Promise<void>;
  signOut(): Promise<void>;
}
function emailAddress(email: string) {
  const value = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    throw new Error("Email invalide");
  return value;
}
export async function signInProfessional(
  email: string,
  password: string,
  session: ProfessionalSession,
  observer?: AuthObserver,
) {
  return observeAuth("login", observer, async () => {
    if (!password) throw new Error("Mot de passe requis");
    await session.signIn(emailAddress(email), password);
  });
}
export async function recoverProfessional(
  email: string,
  session: ProfessionalSession,
  observer?: AuthObserver,
) {
  return observeAuth("recovery", observer, async () => {
    await session.recover(emailAddress(email));
  });
}
export async function defineProfessionalPassword(
  password: string,
  session: ProfessionalSession,
  observer?: AuthObserver,
): Promise<"/espace" | "/auth/accept"> {
  return observeAuth("password", observer, async () => {
    if (!(await session.identity())) throw new Error("Identité requise");
    if (password.length < 12) throw new Error("Mot de passe trop court");
    await session.changePassword(password);
    return (await session.activeProfessional()) ? "/espace" : "/auth/accept";
  });
}
export async function acceptProfessionalInvitation(
  name: string,
  session: ProfessionalSession,
  observer?: AuthObserver,
) {
  let correlation: string | undefined;
  return observeAuth(
    "accept",
    observer,
    async () => {
      if (!(await session.identity())) throw new Error("Identité requise");
      const displayName = name.trim();
      if (!displayName || displayName.length > 200)
        throw new Error("Nom invalide");
      const invitations = await session.pendingInvitations();
      if (invitations.length !== 1) throw new Error("Invitation indisponible");
      correlation = invitations[0]!.correlation_id;
      await session.acceptInvitation(invitations[0]!.id, displayName);
    },
    () => correlation,
  );
}
export async function signOutProfessional(
  session: ProfessionalSession,
  observer?: AuthObserver,
) {
  return observeAuth("logout", observer, async () => {
    await session.signOut();
  });
}
