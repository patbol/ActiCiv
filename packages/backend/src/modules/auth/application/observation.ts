export type AuthOperation =
  "login" | "recovery" | "password" | "logout" | "accept";
export type AuthSignal =
  | `${AuthOperation}.${"succeeded" | "failed"}`
  | "invitation.reserved"
  | "invitation.provider_failed"
  | "invitation.bind_failed"
  | "invitation.sent"
  | "invitation.reused";
/** Diagnostic port only. It cannot write audit or affect the business transaction. */
export interface AuthObserver {
  record(signal: AuthSignal, correlationId?: string, error?: unknown): void;
}
export function notifyAuth(
  observer: AuthObserver | undefined,
  signal: AuthSignal,
  correlationId?: string,
  error?: unknown,
) {
  try {
    observer?.record(signal, correlationId, error);
  } catch {}
}
export async function observeAuth<T>(
  operation: AuthOperation,
  observer: AuthObserver | undefined,
  work: () => Promise<T>,
  correlation: () => string | undefined = () => undefined,
): Promise<T> {
  try {
    const result = await work();
    notifyAuth(observer, `${operation}.succeeded`, correlation());
    return result;
  } catch (error) {
    notifyAuth(observer, `${operation}.failed`, correlation(), error);
    throw error;
  }
}
