import { createAnalytics, localAnalytics, noAnalytics } from "./analytics";
import { createLogger, type Environment, type LogCode } from "./logger";
import { persistedContext, type CommandContext } from "./correlation";
import type {
  AuthObserver,
  AuthSignal,
} from "../modules/auth/application/observation";
/** Local analytics is explicit opt-in and forcibly disabled on the production target. */
export function createObservability(
  env: Record<string, string | undefined>,
  write: (line: string) => void,
) {
  const environment: Environment =
    env.ACTICIV_BUILD_TARGET === "prod"
      ? "prod"
      : env.NODE_ENV === "test"
        ? "test"
        : env.ACTICIV_BUILD_TARGET === "demo"
          ? "demo"
          : env.NODE_ENV === "development"
            ? "dev"
            : "prod";
  const local = localAnalytics();
  const enabled =
    environment !== "prod" && env.ACTICIV_ANALYTICS_MODE === "local";
  return {
    environment,
    analytics: createAnalytics({
      enabled,
      provider: enabled ? local : noAnalytics,
    }),
    logger: createLogger({ environment, write }),
    local,
  };
}
export type Telemetry = ReturnType<typeof createObservability>;
const authCodes: Record<AuthSignal, LogCode> = {
  "login.succeeded": "AUTH_LOGIN_SUCCEEDED",
  "login.failed": "AUTH_LOGIN_FAILED",
  "recovery.succeeded": "AUTH_RECOVERY_REQUESTED",
  "recovery.failed": "AUTH_RECOVERY_FAILED",
  "password.succeeded": "AUTH_PASSWORD_UPDATED",
  "password.failed": "AUTH_PASSWORD_FAILED",
  "logout.succeeded": "AUTH_LOGOUT",
  "logout.failed": "AUTH_LOGOUT_FAILED",
  "accept.succeeded": "INVITATION_ACCEPTED",
  "accept.failed": "INVITATION_ACCEPT_FAILED",
  "invitation.reserved": "INVITATION_RESERVED",
  "invitation.sent": "INVITATION_SENT",
  "invitation.reused": "INVITATION_REUSED",
  "invitation.provider_failed": "INVITATION_PROVIDER_FAILED",
  "invitation.bind_failed": "INVITATION_BIND_FAILED",
};
export function authObserver(
  telemetry: Telemetry,
  context: CommandContext,
): AuthObserver & { context(): CommandContext } {
  let current = context;
  return {
    context: () => current,
    record(signal, correlationId, error) {
      const correlated = correlationId
        ? persistedContext(correlationId)
        : current;
      current = correlated;
      const failed = signal.endsWith("failed");
      telemetry.logger[failed ? "warn" : "info"](
        authCodes[signal],
        correlated,
        { error },
      );
      const analytics = telemetry.analytics;
      switch (signal) {
        case "login.succeeded":
          analytics.track("pro_auth_login_succeeded", { source: "password" });
          break;
        case "login.failed":
          analytics.track("pro_auth_login_failed", { source: "password" });
          break;
        case "recovery.succeeded":
          analytics.track("pro_auth_recovery_requested", {
            source: "recovery-form",
          });
          break;
        case "password.succeeded":
          analytics.track("pro_auth_password_updated", {
            source: "password-form",
          });
          break;
        case "logout.succeeded":
          analytics.track("pro_auth_logout", { source: "action" });
          break;
      }
    },
  };
}
export function localeSaved(
  telemetry: Telemetry,
  context: CommandContext,
  surface: "citizen" | "pro",
  locale: "fr-FR" | "en-GB" | null,
  source: "profile" | "cookie",
) {
  telemetry.logger.info("LOCALE_SAVED", context, { status: 204 });
  if (surface === "pro")
    telemetry.analytics.track("pro_locale_changed", {
      locale: locale ?? "organization-default",
      source,
    });
  else if (locale)
    telemetry.analytics.track("citizen_locale_changed", {
      locale,
      source: "cookie",
    });
}
