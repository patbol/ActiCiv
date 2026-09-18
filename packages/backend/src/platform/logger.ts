import { persistedContext, type CommandContext } from "./correlation";
export const logCodes = {
  HEALTH_CHECK: ["platform", "health", "Process health checked"],
  AUTH_LOGIN_SUCCEEDED: ["auth", "login", "Sign-in completed"],
  AUTH_LOGIN_FAILED: ["auth", "login", "Sign-in rejected"],
  AUTH_RECOVERY_REQUESTED: ["auth", "recovery", "Recovery request completed"],
  AUTH_RECOVERY_FAILED: ["auth", "recovery", "Recovery request failed"],
  AUTH_PASSWORD_UPDATED: ["auth", "password", "Password update completed"],
  AUTH_PASSWORD_FAILED: ["auth", "password", "Password update failed"],
  AUTH_LOGOUT: ["auth", "logout", "Sign-out completed"],
  AUTH_LOGOUT_FAILED: ["auth", "logout", "Sign-out failed"],
  AUTH_CALLBACK_FAILED: ["auth", "callback", "Auth callback rejected"],
  AUTH_CONFIRM_FAILED: ["auth", "confirm", "Auth confirmation rejected"],
  INVITATION_RESERVED: ["auth", "invitation", "Invitation reserved"],
  INVITATION_PROVIDER_FAILED: [
    "auth",
    "invitation",
    "Identity delivery failed",
  ],
  INVITATION_BIND_FAILED: [
    "auth",
    "invitation",
    "Invitation binding failed; resume required",
  ],
  INVITATION_REUSED: [
    "auth",
    "invitation",
    "Existing invitation delivery reused",
  ],
  INVITATION_SENT: ["auth", "invitation", "Invitation delivery bound"],
  INVITATION_ACCEPTED: [
    "auth",
    "invitation",
    "Invitation acceptance completed",
  ],
  INVITATION_ACCEPT_FAILED: [
    "auth",
    "invitation",
    "Invitation acceptance failed",
  ],
  LOCALE_SAVED: ["locales", "preference", "Locale preference saved"],
  LOCALE_SAVE_FAILED: ["locales", "preference", "Locale preference rejected"],
  CONFIGURATION_COMPLETED: [
    "configuration",
    "command",
    "Configuration command completed",
  ],
  CONFIGURATION_FAILED: [
    "configuration",
    "command",
    "Configuration command rejected",
  ],
  PLATFORM_COMPLETED: ["platform", "command", "Platform command completed"],
  PLATFORM_FAILED: ["platform", "command", "Platform command rejected"],
} as const;
export type LogCode = keyof typeof logCodes;
export type LogLevel = "debug" | "info" | "warn" | "error";
export type Environment = "dev" | "demo" | "prod" | "test";
export type SafeMetadata = {
  status?: number;
  duration_ms?: number;
  error?: unknown;
};
export type LogRecord = {
  code: LogCode;
  level: LogLevel;
  environment: Environment;
  context: CommandContext;
  timestamp: string;
  metadata?: SafeMetadata;
};
function safeError(value: unknown, depth = 0): Record<string, unknown> {
  if (!value || typeof value !== "object") return { kind: "Unknown" };
  try {
    const error = value as { name?: unknown; code?: unknown; cause?: unknown };
    const kind =
      typeof error.name === "string" &&
      ["Error", "TypeError", "RangeError", "AuthApiError", "ZodError"].includes(
        error.name,
      )
        ? error.name
        : "Unknown";
    const code =
      typeof error.code === "string" &&
      [
        "42501",
        "23505",
        "23514",
        "PGRST301",
        "invalid_credentials",
        "over_request_rate_limit",
        "email_not_confirmed",
      ].includes(error.code)
        ? error.code
        : undefined;
    return {
      kind,
      ...(code ? { upstream_code: code } : {}),
      ...(depth < 2 && error.cause
        ? { cause: safeError(error.cause, depth + 1) }
        : {}),
    };
  } catch {
    return { kind: "Unknown" };
  }
}
/** Only allowlisted enums/numbers/UUID and classified causes; never raw message/stack/payload. */
export function serializeLog(record: LogRecord): string {
  if (
    !Object.hasOwn(logCodes, record.code) ||
    !["dev", "demo", "prod", "test"].includes(record.environment) ||
    !["debug", "info", "warn", "error"].includes(record.level)
  )
    throw new Error("Invalid log contract");
  const [module, operation, message] = logCodes[record.code];
  const m = record.metadata ?? {};
  return JSON.stringify({
    timestamp: new Date(record.timestamp).toISOString(),
    level: record.level,
    environment: record.environment,
    module,
    operation,
    correlation_id: persistedContext(record.context.correlationId)
      .correlationId,
    error_code: record.code,
    message,
    ...(Number.isInteger(m.status) && m.status! >= 100 && m.status! <= 599
      ? { status: m.status }
      : {}),
    ...(typeof m.duration_ms === "number" &&
    Number.isFinite(m.duration_ms) &&
    m.duration_ms >= 0
      ? { duration_ms: Math.round(m.duration_ms * 100) / 100 }
      : {}),
    ...(m.error === undefined ? {} : { error: safeError(m.error) }),
  });
}
export function createLogger(options: {
  environment: Environment;
  write: (line: string) => void;
  now?: () => Date;
}) {
  function emit(
    level: LogLevel,
    code: LogCode,
    context: CommandContext,
    metadata?: SafeMetadata,
  ) {
    if (level === "debug" && options.environment === "prod") return;
    const line = serializeLog({
      code,
      level,
      context,
      ...(metadata === undefined ? {} : { metadata }),
      environment: options.environment,
      timestamp: (options.now ?? (() => new Date()))().toISOString(),
    });
    // Technical diagnostics never roll back or turn a committed business mutation into failure.
    try {
      options.write(line + "\n");
    } catch {}
  }
  return {
    debug: (code: LogCode, c: CommandContext, m?: SafeMetadata) =>
      emit("debug", code, c, m),
    info: (code: LogCode, c: CommandContext, m?: SafeMetadata) =>
      emit("info", code, c, m),
    warn: (code: LogCode, c: CommandContext, m?: SafeMetadata) =>
      emit("warn", code, c, m),
    error: (code: LogCode, c: CommandContext, m?: SafeMetadata) =>
      emit("error", code, c, m),
  };
}
