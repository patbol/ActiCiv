import { expect, it } from "vitest";
import {
  createAnalytics,
  analyticsRegistry,
  localAnalytics,
  noAnalytics,
} from "./analytics";
import { createLogger } from "./logger";
import { commandContext, persistedContext } from "./correlation";
const id = "1c29fca6-65fa-4d4b-a80c-8a124cf451ba";
const sensitive = {
  email: "private@example.test",
  password: "private-password",
  token: "private-token",
  latitude: 48.123456,
  text: "private-free-text",
  user_metadata: { role: "client_admin" },
  user_id: id,
  correlation_id: id,
};
it("observability analytics registry permits only current events and exact enum properties", () => {
  const local = localAnalytics(2);
  const analytics = createAnalytics({ enabled: true, provider: local });
  expect(
    analytics.track("pro_auth_login_succeeded", { source: "password" }),
  ).toBe("sent");
  expect(local.events()).toEqual([
    {
      event: "pro_auth_login_succeeded",
      surface: "pro",
      properties: { source: "password" },
      version: 1,
    },
  ]);
  expect(() => analytics.track("unknown" as never, {} as never)).toThrow();
  expect(() =>
    analytics.track("pro_locale_changed", {
      locale: "secret" as never,
      source: "profile",
    }),
  ).toThrow();
  for (const [key, value] of Object.entries(sensitive))
    expect(() =>
      analytics.track("pro_auth_login_succeeded", {
        source: "password",
        [key]: value,
      }),
    ).toThrow();
  for (const [name, definition] of Object.entries(analyticsRegistry)) {
    expect(name).toMatch(
      new RegExp(`^${definition.surface}_${definition.domain}_[a-z_]+$`),
    );
    expect(definition.description.length).toBeGreaterThan(0);
    expect(definition.owner).toBe(definition.domain);
    expect(definition.implementation_status).toBe("instrumented");
    expect(definition.consent_class).toBe("disabled-until-deployment-review");
    const properties = Object.fromEntries(
      Object.entries(definition.properties).map(([key, values]) => [
        key,
        values[0],
      ]),
    );
    expect(
      analytics.track(
        name as keyof typeof analyticsRegistry,
        properties as never,
      ),
    ).toBe("sent");
  }
  expect(
    Object.keys(analyticsRegistry).some((k) =>
      /report|routing|intervention/.test(k),
    ),
  ).toBe(false);
});
it("observability analytics is disabled by default, no-op safe, bounded locally and provider failure isolated", () => {
  const local = localAnalytics(2);
  expect(
    createAnalytics({ provider: local }).track("pro_auth_logout", {
      source: "action",
    }),
  ).toBe("disabled");
  expect(local.events()).toEqual([]);
  expect(
    createAnalytics({ enabled: true, provider: noAnalytics }).track(
      "pro_auth_logout",
      { source: "action" },
    ),
  ).toBe("sent");
  const a = createAnalytics({ enabled: true, provider: local });
  for (let i = 0; i < 3; i++) a.track("pro_auth_logout", { source: "action" });
  expect(local.events()).toHaveLength(2);
  const external = local.events();
  external.length = 0;
  expect(local.events()).toHaveLength(2);
  expect(
    createAnalytics({
      enabled: true,
      provider: {
        emit() {
          throw new Error("private-provider-error");
        },
      },
    }).track("pro_auth_logout", { source: "action" }),
  ).toBe("dropped");
});
it("observability logger keeps safe fields, strips PII and arbitrary errors, and propagates correlation", () => {
  const output: string[] = [];
  const logger = createLogger({
    environment: "test",
    write: (line) => output.push(line),
    now: () => new Date("2026-09-18T00:00:00Z"),
  });
  const context = persistedContext(id);
  logger.error("AUTH_LOGIN_FAILED", context, {
    ...sensitive,
    status: 400,
    duration_ms: 0,
    error: new Error("private-error-message", {
      cause: new TypeError("private-cause"),
    }),
  });
  const r = JSON.parse(output[0]!);
  expect(r).toMatchObject({
    timestamp: "2026-09-18T00:00:00.000Z",
    level: "error",
    environment: "test",
    module: "auth",
    operation: "login",
    correlation_id: id,
    error_code: "AUTH_LOGIN_FAILED",
    status: 400,
    duration_ms: 0,
    error: { kind: "Error", cause: { kind: "TypeError" } },
  });
  expect(output.join(" ")).not.toMatch(
    /private-|@example|latitude|user_metadata|user_id|password|token|stack/,
  );
  expect(r).not.toHaveProperty("request_id");
});
it("observability logger filters debug in PROD and refuses payload smuggling through allowed scalar fields", () => {
  const output: string[] = [];
  const logger = createLogger({
    environment: "prod",
    write: (line) => output.push(line),
  });
  logger.debug("AUTH_LOGIN_SUCCEEDED", persistedContext(id));
  expect(output).toEqual([]);
  logger.info("AUTH_LOGIN_SUCCEEDED", persistedContext(id), {
    status: "private-token" as never,
    duration_ms: NaN,
    error: {
      name: "private-name",
      message: "private-message",
      code: "private-code",
    },
  });
  const r = JSON.parse(output[0]!);
  expect(r).not.toHaveProperty("status");
  expect(r).not.toHaveProperty("duration_ms");
  expect(output.join()).not.toContain("private");
  expect(() =>
    logger.info("private-code" as never, persistedContext(id)),
  ).toThrow();
  expect(() =>
    createLogger({
      environment: "test",
      write() {
        throw new Error("sink failure");
      },
    }).warn("LOCALE_SAVE_FAILED", persistedContext(id)),
  ).not.toThrow();
});
it("observability correlation is generated server-side and only persisted UUIDs can be resumed", () => {
  const a = commandContext(),
    b = commandContext();
  expect(a.correlationId).not.toBe(b.correlationId);
  expect(persistedContext(id).correlationId).toBe(id);
  for (const value of ["private-token", "", "private@example.test"])
    expect(() => persistedContext(value)).toThrow();
});
it("observability production forces analytics off even with local configuration and observers cannot fail Auth", async () => {
  const { createObservability, authObserver } = await import("./telemetry");
  const { signInProfessional } =
    await import("../modules/auth/application/session");
  const { vi } = await import("vitest");
  const prod = createObservability(
    { NODE_ENV: "production", ACTICIV_ANALYTICS_MODE: "local" },
    () => {},
  );
  authObserver(prod, persistedContext(id)).record("login.succeeded");
  expect(prod.local.events()).toEqual([]);
  const explicitProd = createObservability(
    {
      NODE_ENV: "development",
      ACTICIV_BUILD_TARGET: "prod",
      ACTICIV_ANALYTICS_MODE: "local",
    },
    () => {},
  );
  authObserver(explicitProd, persistedContext(id)).record("login.succeeded");
  expect(explicitProd.local.events()).toEqual([]);
  const local = createObservability(
    { NODE_ENV: "test", ACTICIV_ANALYTICS_MODE: "local" },
    () => {
      throw Error("private sink failure");
    },
  );
  const session = {
    signIn: vi.fn(),
    identity: vi.fn(),
    activeProfessional: vi.fn(),
    pendingInvitations: vi.fn(),
    recover: vi.fn(),
    changePassword: vi.fn(),
    acceptInvitation: vi.fn(),
    signOut: vi.fn(),
  };
  await signInProfessional(
    "private@example.test",
    "private-password",
    session,
    authObserver(local, persistedContext(id)),
  );
  expect(local.local.events()).toEqual([
    {
      event: "pro_auth_login_succeeded",
      surface: "pro",
      version: 1,
      properties: { source: "password" },
    },
  ]);
  await expect(
    signInProfessional("invalid", "private-password", session, {
      record() {
        throw Error("private observer failure");
      },
    }),
  ).rejects.toThrow();
  expect(session.signIn).toHaveBeenCalledTimes(1);
});

it("observability invitation completion context follows persisted command across requests", async () => {
  const { createObservability, authObserver } = await import("./telemetry");
  const observer = authObserver(
    createObservability({}, () => {}),
    commandContext(),
  );
  observer.record("invitation.reserved", id);
  expect(observer.context()).toEqual(persistedContext(id));
  observer.record("invitation.sent", id);
  expect(observer.context().correlationId).toBe(id);
});
