export function safeDestination(value: string | null): string {
  return value && ["/espace", "/auth/password", "/auth/accept"].includes(value)
    ? value
    : "/espace";
}
export function invitationRole(
  value: string,
): "agent" | "supervisor" | "client_admin" {
  if (value === "agent" || value === "supervisor" || value === "client_admin")
    return value;
  throw new Error("Rôle invalide");
}
