export type Role = "agent" | "supervisor" | "client_admin";
export type Capability =
  | "context.read"
  | "service.read"
  | "members.read"
  | "configuration.write"
  | "members.write"
  | "contracts.read"
  | "audit.read";
export type Context = {
  userId: string;
  profileActive: boolean;
  organizationId: string;
  organizationActive: boolean;
  membershipActive: boolean;
  role: Role;
  services: readonly string[];
};
export type Resource = {
  organizationId: string;
  serviceId?: string;
  userId?: string;
};
export function permits(
  context: Context | null,
  capability: string,
  resource: Resource,
): boolean {
  if (
    !context ||
    !context.profileActive ||
    !context.membershipActive ||
    !context.organizationActive ||
    context.organizationId !== resource.organizationId
  )
    return false;
  if (capability === "context.read") return resource.userId === context.userId;
  if (context.role === "client_admin")
    return [
      "service.read",
      "members.read",
      "configuration.write",
      "members.write",
      "contracts.read",
      "audit.read",
    ].includes(capability);
  const service =
    resource.serviceId !== undefined &&
    context.services.includes(resource.serviceId);
  if (capability === "service.read") return service;
  if (capability === "members.read")
    return context.role === "supervisor" && service;
  return false;
}
export function requirePermission(
  context: Context | null,
  capability: Capability,
  resource: Resource,
): asserts context is Context {
  if (!permits(context, capability, resource)) throw new Error("Accès refusé");
}
