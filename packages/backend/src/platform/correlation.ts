export type CommandContext = Readonly<{ correlationId: string }>;
/** Only call with server-owned persisted context, never an incoming browser header. */
export function persistedContext(value: string): CommandContext {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new Error("Invalid correlation context");
  return Object.freeze({ correlationId: value.toLowerCase() });
}
export function commandContext(): CommandContext {
  return persistedContext(crypto.randomUUID());
}
