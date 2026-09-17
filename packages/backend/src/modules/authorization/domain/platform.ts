export type PlatformContext = {
  userId: string;
  capabilities: readonly string[];
} | null;
export function requirePlatform(
  context: PlatformContext,
  capability: string,
): asserts context is NonNullable<PlatformContext> {
  if (!context?.userId || !context.capabilities.includes(capability))
    throw new Error("Accès plateforme refusé");
}
