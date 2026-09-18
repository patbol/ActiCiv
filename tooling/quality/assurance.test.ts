import { expect, it } from "vitest";
import { inspectFile } from "./artifact.ts";
import { securityGate, normalizeSemgrep, normalizeZap } from "./security.ts";
import { performanceDelta } from "./performance.ts";

it.each([
  ["server/fixtures/users.js", "export const x=1", "test-code"],
  ["server/a.js", "const user='agent1@seed.acticiv.test'", "fake-user"],
  ["server/app/debug/page.js", "export default 1", "debug-route"],
  ["static/a.js", "console.log('trace')", "console"],
  ["static/a.js", "console['debug']('trace')", "console"],
  ["static/a.js", "const x='SUPABASE_SERVICE_ROLE_KEY'", "server-client"],
  [
    "static/a.js",
    "const x='" + ["sk", "live", "123456789012345678901234"].join("_") + "'",
    "secret",
  ],
  ["static/a.js.map", "{}", "public-map"],
  [
    "static/a.js",
    "//# sourceMappingURL=data:application/json;base64,e30=",
    "public-map",
  ],
  ["server/a.js", "const x = 'MOCK_AUTH'", "bypass"],
  ["server/a.js", "const x = 'preview-name'", "demo"],
  ["static/a.js", "import 'vitest'", "test-code"],
])("rejects compiled leakage %s / %s", (path, source, rule) => {
  expect(inspectFile(path, source).some((f) => f.category === rule)).toBe(true);
});
it("accepts clean compiled code without reporting content", () => {
  expect(inspectFile("static/app.js", 'const a="ActiCiv";')).toEqual([]);
  const findings = inspectFile(
    "static/app.js",
    'const a="' + ["sk", "live", "123456789012345678901234"].join("_") + '"',
  );
  expect(JSON.stringify(findings)).not.toContain("sk_live_");
});
const finding = (severity: string) => ({
  id: "a",
  tool: "test",
  category: "xss",
  severity,
  status: "open",
  target: "app.ts",
  summary: "Static rule",
  accepted_risk: null,
  retest_status: "pending",
});
const now = "2026-09-18T00:00:00Z";
it("blocks critical, rejects incomplete and expired high risk acceptance", () => {
  expect(securityGate([finding("critical")], [], now).status).toBe("FAIL");
  expect(securityGate([finding("high")], [], now).status).toBe("FAIL");
  const risk = {
    finding_id: "a",
    owner: "Patrick",
    reason: "Explicit review",
    approved_by: "Patrick",
    accepted_at: "2026-09-17T00:00:00Z",
    expiry: "2026-09-19T00:00:00Z",
    mitigation: "Isolated demo",
    scope: "local-demo",
    retest_required: true,
  };
  expect(
    securityGate([finding("high")], [risk], now, "local-demo").status,
  ).toBe("PASS");
  expect(
    securityGate([finding("high")], [{ ...risk, expiry: now }], now).status,
  ).toBe("FAIL");
  expect(securityGate([finding("critical")], [risk], now).status).toBe("FAIL");
  expect(() =>
    securityGate([finding("high")], [{ ...risk, owner: "" }], now),
  ).toThrow();
});
it("keeps medium findings visible without manufacturing risk acceptance", () => {
  const result = securityGate([finding("medium")], [], now);
  expect(result.status).toBe("PASS");
  expect(result.findings).toHaveLength(1);
});
it("rejects malformed, empty execution and scanner errors", () => {
  expect(() => normalizeSemgrep({})).toThrow();
  expect(() =>
    normalizeSemgrep({
      version: "1",
      results: [],
      errors: [],
      paths: { scanned: [] },
    }),
  ).toThrow();
  expect(() =>
    normalizeSemgrep({
      version: "1",
      results: [],
      errors: [{}],
      paths: { scanned: ["a.ts"] },
    }),
  ).toThrow();
  expect(() => normalizeZap({})).toThrow();
});
it("normalizes SAST without exporting source or metavariables", () => {
  const r = normalizeSemgrep({
    version: "1",
    errors: [],
    paths: { scanned: ["a.ts"] },
    results: [
      {
        check_id: "unsafe-eval",
        path: "a.ts",
        start: { line: 1 },
        extra: {
          severity: "ERROR",
          lines: "secret",
          message: "secret",
          metavars: { raw: "secret" },
        },
      },
    ],
  });
  expect(JSON.stringify(r)).not.toContain("secret");
  expect(r.findings[0]?.severity).toBe("high");
});
it("reports performance deltas without classifying budgetless variations", () => {
  expect(performanceDelta({ js_bytes: 20 }, null).status).toBe("NO_BASELINE");
  const result = performanceDelta(
    { js_bytes: 20, gzip_bytes: 5, added: 1 },
    { js_bytes: 10, gzip_bytes: 8 },
  );
  expect(result.deltas).toEqual({ js_bytes: 10, gzip_bytes: -3, added: null });
  expect(result.mode).toBe("advisory");
  expect(result.budget).toBeNull();
  expect(() => performanceDelta({ js_bytes: NaN }, null)).toThrow();
});
it("supports indexed build maps and never exempts first-party console calls", () => {
  const map = JSON.stringify({
    version: 3,
    sections: [
      {
        offset: { line: 0, column: 0 },
        map: {
          version: 3,
          sources: ["apps/pro/src/page.ts"],
          names: [],
          mappings: "AAAA",
        },
      },
    ],
  });
  expect(
    inspectFile("server/a.js", "console.log('unsafe')", map).some(
      (f) => f.category === "console",
    ),
  ).toBe(true);
});
it("canonical assurance cannot turn missing execution into PASS", async () => {
  const { assuranceCheck } = await import("./security.ts");
  expect(() =>
    assuranceCheck(
      { complete: true, tool: "semgrep", findings: [], evaluated_at: now },
      "sast",
    ),
  ).toThrow();
  expect(() =>
    assuranceCheck(
      { complete: true, tool: "performance", findings: [], evaluated_at: now },
      "sast",
    ),
  ).toThrow();
});
it("ZAP output strips request evidence and preserves medium severity", () => {
  const r = normalizeZap({
    "@version": "2.17.0",
    site: [
      {
        "@name": "http://localhost:3100",
        alerts: [
          {
            pluginid: "10038",
            riskcode: "2",
            instances: [{ evidence: "sensitive-token" }],
          },
        ],
      },
    ],
  });
  expect(r.findings[0]?.severity).toBe("medium");
  expect(JSON.stringify(r)).not.toContain("sensitive-token");
});
it("only permits generated Next server metadata, never browser or unrelated secrets", async () => {
  const { generatedNextFinding } = await import("./artifact-secrets.ts");
  const manifest = {
    node: { ["a".repeat(40)]: {}, ["c".repeat(42)]: {} },
    edge: {},
    encryptionKey: "build-only-key",
  };
  expect(
    generatedNextFinding(
      "chunks/ssr/app_actions_123.js",
      'b.password,"' + "c".repeat(42) + '"',
      manifest,
    ),
  ).toBe(true);
  expect(
    generatedNextFinding(
      "server-reference-manifest.json",
      '  "encryptionKey": "build-only-key"',
      manifest,
    ),
  ).toBe(true);
  expect(
    generatedNextFinding(
      "static/server-reference-manifest.json",
      '  "encryptionKey": "build-only-key"',
      manifest,
    ),
  ).toBe(false);
  expect(
    generatedNextFinding(
      "chunks/ssr/app_actions_123.js",
      'password,"' + "a".repeat(40) + '"',
      manifest,
    ),
  ).toBe(true);
  expect(
    generatedNextFinding(
      "chunks/ssr/app_actions_123.js",
      'password,"' + "b".repeat(40) + '"',
      manifest,
    ),
  ).toBe(false);
  expect(
    generatedNextFinding(
      "other.json",
      '"encryptionKey": "build-only-key"',
      manifest,
    ),
  ).toBe(false);
});
it("a DEMO risk acceptance cannot authorize a PROD finding", () => {
  const risk = {
    finding_id: "a",
    owner: "Patrick",
    reason: "Scoped review",
    approved_by: "Patrick",
    accepted_at: "2026-09-17T00:00:00Z",
    expiry: "2026-09-19T00:00:00Z",
    mitigation: "Isolated target",
    scope: "local-demo",
    retest_required: true,
  };
  expect(securityGate([finding("high")], [risk], now, "prod").status).toBe(
    "FAIL",
  );
});
it("compiled and performance reports require actual build identity", async () => {
  const { assuranceCheck } = await import("./security.ts");
  expect(() =>
    assuranceCheck(
      {
        complete: true,
        tool: "artifact",
        artifacts: [{}, {}],
        findings: [],
        evaluated_at: now,
      },
      "artifact",
    ),
  ).toThrow();
  expect(() =>
    assuranceCheck(
      {
        complete: true,
        tool: "performance",
        apps: { citizen: {}, pro: {} },
        findings: [],
        evaluated_at: now,
      },
      "performance",
    ),
  ).toThrow();
});
