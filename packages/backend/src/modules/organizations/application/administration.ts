import { assertAdminTransition, type Membership } from "../domain/membership";
import {
  requirePermission,
  type Context,
  type Role,
} from "../../authorization/domain/policy";
export interface Administration {
  member(id: string): Promise<Membership>;
  activeAdmins(org: string): Promise<number>;
  changeMember(id: string, role: Role, active: boolean): Promise<void>;
  saveService(
    org: string,
    code: string,
    name: string,
    status: string,
  ): Promise<string>;
  setServiceMember(
    org: string,
    member: string,
    service: string,
    active: boolean,
  ): Promise<void>;
}
export async function changeMember(
  context: Context | null,
  org: string,
  id: string,
  role: Role,
  active: boolean,
  port: Administration,
) {
  requirePermission(context, "members.write", { organizationId: org });
  const member = await port.member(id);
  requirePermission(context, "members.write", {
    organizationId: member.organizationId,
  });
  assertAdminTransition(
    member,
    role,
    active,
    await port.activeAdmins(member.organizationId),
  );
  return port.changeMember(id, role, active);
}
export async function saveService(
  context: Context | null,
  org: string,
  code: string,
  name: string,
  status: string,
  port: Administration,
) {
  requirePermission(context, "configuration.write", { organizationId: org });
  if (
    !code.trim() ||
    !name.trim() ||
    !["active", "inactive", "archived"].includes(status)
  )
    throw new Error("Service invalide");
  return port.saveService(org, code, name, status);
}
export async function setServiceMember(
  context: Context | null,
  org: string,
  member: string,
  service: string,
  active: boolean,
  port: Administration,
) {
  requirePermission(context, "members.write", { organizationId: org });
  return port.setServiceMember(org, member, service, active);
}
