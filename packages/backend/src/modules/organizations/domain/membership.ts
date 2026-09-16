import type { Role } from "../../authorization/domain/policy";
export type Membership = {
  id: string;
  organizationId: string;
  role: Role;
  active: boolean;
  profileActive: boolean;
};
export function assertAdminTransition(
  member: Membership,
  role: Role,
  active: boolean,
  activeAdmins: number,
) {
  if (
    member.role === "client_admin" &&
    member.active &&
    member.profileActive &&
    (role !== "client_admin" || !active) &&
    activeAdmins <= 1
  )
    throw new Error("Le dernier administrateur actif doit être conservé");
}
