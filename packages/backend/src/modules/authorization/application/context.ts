import type { Context } from "../domain/policy";
export interface ContextReader {
  readVerifiedContext(): Promise<Context | null>;
}
export async function getProfessionalContext(reader: ContextReader) {
  const context = await reader.readVerifiedContext();
  return context?.profileActive &&
    context.membershipActive &&
    context.organizationActive
    ? context
    : null;
}
