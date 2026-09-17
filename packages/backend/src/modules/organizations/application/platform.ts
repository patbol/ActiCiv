import {
  requirePlatform,
  type PlatformContext,
} from "../../authorization/domain/platform";
export type OrganizationInput = {
  code: string;
  name: string;
  status: "active" | "inactive" | "archived";
};
export type RecoveryInput = {
  organizationId: string;
  userId: string;
  name: string;
};
export interface OrganizationPlatform {
  save(value: OrganizationInput): Promise<string>;
  recover(value: RecoveryInput): Promise<void>;
}
export async function saveOrganization(
  context: PlatformContext,
  value: OrganizationInput,
  port: OrganizationPlatform,
) {
  requirePlatform(context, "organizations.manage");
  if (!value.code.trim() || !value.name.trim())
    throw new Error("Organisation invalide");
  return port.save(value);
}
export async function recoverOrganization(
  context: PlatformContext,
  value: RecoveryInput,
  port: OrganizationPlatform,
) {
  requirePlatform(context, "organizations.recover");
  if (!value.organizationId || !value.userId || !value.name.trim())
    throw new Error("Récupération invalide");
  return port.recover(value);
}
