const event = <const P extends Record<string, readonly string[]>>(
  surface: "pro" | "citizen",
  domain: "auth" | "locale",
  description: string,
  properties: P,
) =>
  ({
    surface,
    domain,
    description,
    properties,
    owner: domain,
    consent_class: "disabled-until-deployment-review",
    implementation_status: "instrumented",
  }) as const;
/** Canonical runtime registry. No identity, free text, correlation or vendor-specific properties. */
export const analyticsRegistry = {
  pro_auth_login_succeeded: event(
    "pro",
    "auth",
    "Auth sign-in succeeded; does not imply professional business access",
    { source: ["password"] },
  ),
  pro_auth_login_failed: event(
    "pro",
    "auth",
    "Sign-in rejected, no account or error details",
    { source: ["password"] },
  ),
  pro_auth_recovery_requested: event(
    "pro",
    "auth",
    "Recovery request accepted; does not assert account existence or delivery",
    { source: ["recovery-form"] },
  ),
  pro_auth_password_updated: event(
    "pro",
    "auth",
    "Password update succeeded on the existing invitation/recovery form",
    { source: ["password-form"] },
  ),
  pro_auth_logout: event("pro", "auth", "Sign-out succeeded", {
    source: ["action"],
  }),
  pro_locale_changed: event(
    "pro",
    "locale",
    "Explicit preference saved successfully",
    {
      locale: ["fr-FR", "en-GB", "organization-default"],
      source: ["profile", "cookie"],
    },
  ),
  citizen_locale_changed: event(
    "citizen",
    "locale",
    "Explicit cookie preference saved successfully",
    { locale: ["fr-FR", "en-GB"], source: ["cookie"] },
  ),
} as const;
export type AnalyticsName = keyof typeof analyticsRegistry;
export type AnalyticsProperties<K extends AnalyticsName> = {
  [
    P in keyof (typeof analyticsRegistry)[K]["properties"]
  ]: (typeof analyticsRegistry)[K]["properties"][P] extends readonly (infer V)[]
    ? V
    : never;
};
export type AnalyticsEvent = {
  event: AnalyticsName;
  surface: "pro" | "citizen";
  version: 1;
  properties: Readonly<Record<string, string>>;
};
export interface AnalyticsProvider {
  emit(event: AnalyticsEvent): void;
}
export const noAnalytics: AnalyticsProvider = { emit() {} };
export function localAnalytics(capacity = 100) {
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1000)
    throw new Error("Invalid analytics capacity");
  const records: AnalyticsEvent[] = [];
  return {
    emit(event: AnalyticsEvent) {
      records.push(structuredClone(event));
      if (records.length > capacity) records.shift();
    },
    events() {
      return structuredClone(records);
    },
    clear() {
      records.length = 0;
    },
  };
}
export function createAnalytics(
  options: { enabled?: boolean; provider?: AnalyticsProvider } = {},
) {
  return {
    track<K extends AnalyticsName>(
      name: K,
      properties: AnalyticsProperties<K>,
    ): "sent" | "disabled" | "dropped" {
      if (!Object.hasOwn(analyticsRegistry, name))
        throw new Error("Unknown analytics event");
      const definition = analyticsRegistry[name];
      const schema: Record<string, readonly string[]> = definition.properties;
      if (
        !properties ||
        typeof properties !== "object" ||
        Array.isArray(properties) ||
        Object.keys(properties).length !== Object.keys(schema).length
      )
        throw new Error("Invalid analytics properties");
      const safe: Record<string, string> = {};
      for (const [key, value] of Object.entries(properties)) {
        if (
          !Object.hasOwn(schema, key) ||
          typeof value !== "string" ||
          !schema[key]!.includes(value)
        )
          throw new Error("Invalid analytics property");
        safe[key] = value;
      }
      if (options.enabled !== true) return "disabled";
      try {
        (options.provider ?? noAnalytics).emit({
          event: name,
          surface: definition.surface,
          version: 1,
          properties: Object.freeze(safe),
        });
        return "sent";
      } catch {
        return "dropped";
      }
    },
  };
}
