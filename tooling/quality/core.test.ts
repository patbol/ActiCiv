import { describe, expect, it } from "vitest";
import {
  normalizeVitest,
  normalizePlaywright,
  parseTap,
  normalizeAudit,
  normalizeCoverage,
} from "./parsers";
import {
  assemble,
  evaluate,
  compare,
  candidate,
  validateSnapshot,
} from "./snapshot";
import { finalize } from "./storage";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const identity = {
  schema_version: 1,
  project: "ActiCiv",
  commit_sha: "a".repeat(40),
  branch: "test",
  environment: "local",
  created_at: "2026-09-18T00:00:00.000Z",
  producer: "acticiv-quality/1",
  run_id: "test-run",
  source_digest: "b".repeat(64),
  dirty: false,
  versions: { node: "24.21.0" },
};
const policy = {
  version: "d-v1",
  mode: "advisory",
  rules: [{ id: "unit", source: "unit", required: true, missing: "FAIL" }],
};
const validUnit = {
  success: true,
  numTotalTests: 1,
  numPassedTests: 1,
  numFailedTests: 0,
  numPendingTests: 0,
  testResults: [
    {
      name: "test.ts",
      status: "passed",
      assertionResults: [{ fullName: "rule", status: "passed", duration: 2 }],
    },
  ],
};
function evidence(data: unknown = validUnit) {
  return {
    identity,
    source: "unit",
    exit_code: 0,
    duration_ms: 4,
    report: data,
    reference: { path: "reports/unit.json", sha256: "c".repeat(64) },
  };
}
describe("quality evidence fails closed", () => {
  it("normalizes a genuine completed unit report", () => {
    expect(normalizeVitest(validUnit).passed).toBe(1);
  });
  it.each([
    null,
    {},
    { ...validUnit, success: false },
    { ...validUnit, numTotalTests: 2 },
  ])("rejects invalid or incomplete unit reports %j", (report) => {
    expect(() => normalizeVitest(report)).toThrow();
  });
  it("retains failed and skipped tests", () => {
    const r = normalizeVitest({
      ...validUnit,
      success: false,
      numTotalTests: 2,
      numPassedTests: 0,
      numFailedTests: 1,
      numPendingTests: 1,
      testResults: [
        {
          name: "test.ts",
          status: "failed",
          assertionResults: [
            { fullName: "bad", status: "failed" },
            { fullName: "skip", status: "pending" },
          ],
        },
      ],
    });
    expect(r).toMatchObject({ status: "FAIL", failed: 1, skipped: 1 });
  });
  it("detects an incomplete or aborted TAP plan", () => {
    for (const text of [
      "ok 1 - a",
      "1..2\nok 1 - a",
      "1..1\nBail out! bad",
      "1..1\nok 2 - wrong",
    ]) {
      expect(() => parseTap(text)).toThrow();
    }
  });
  it("keeps SQL assertions separate and exposes skips/failures", () => {
    expect(
      parseTap("1..3\nok 1 - a\nnot ok 2 - b\nok 3 - c # SKIP unavailable"),
    ).toMatchObject({ passed: 1, failed: 1, skipped: 1, status: "FAIL" });
  });
  it("does not mistake a retried success for a clean release", () => {
    const r = normalizePlaywright({
      errors: [],
      stats: { expected: 0, unexpected: 0, flaky: 1, skipped: 0 },
      suites: [
        {
          specs: [
            {
              id: "id",
              title: "case",
              tags: ["@critical", "@route:auth"],
              tests: [
                {
                  projectName: "desktop",
                  status: "flaky",
                  results: [
                    { status: "failed", retry: 0, duration: 3 },
                    { status: "passed", retry: 1, duration: 2 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(r).toMatchObject({ status: "FAIL", retries: 1, flaky: 1 });
    expect(r.tests[0]).toMatchObject({
      final_status: "passed",
      retry_count: 1,
      tags: ["@critical", "@route:auth"],
    });
  });
  it("rejects empty Playwright reports and unexpected global errors", () => {
    expect(() => normalizePlaywright({ suites: [], errors: [] })).toThrow();
  });
  it("does not interpret audit transport errors as no vulnerabilities", () => {
    expect(() => normalizeAudit({ error: { message: "offline" } })).toThrow();
    expect(
      normalizeAudit({
        metadata: {
          vulnerabilities: {
            info: 0,
            low: 0,
            moderate: 0,
            high: 1,
            critical: 0,
          },
        },
        advisories: {},
      }).status,
    ).toBe("FAIL");
  });
  it("represents empty coverage modules without claiming 100%", () => {
    const c = normalizeCoverage({
      total: {
        lines: { total: 10, covered: 4, pct: 40 },
        statements: { total: 10, covered: 4, pct: 40 },
        branches: { total: 2, covered: 0, pct: 0 },
        functions: { total: 2, covered: 1, pct: 50 },
      },
    });
    expect(c.global.lines.pct).toBe(40);
    expect(c.modules.audit!.lines.pct).toBeNull();
  });
  it("a required missing report never passes", () => {
    const s = assemble(identity, [], policy);
    expect(s.gate_evaluation.results[0]).toMatchObject({
      status: "FAIL",
      reason: "missing evidence",
    });
  });
  it.each([
    {},
    { ...identity, commit_sha: "" },
    { ...identity, environment: "" },
  ])("rejects missing identity %j", (bad) => {
    expect(() => assemble(bad, [], policy)).toThrow();
  });
  it.each(["commit_sha", "environment", "run_id", "source_digest"])(
    "rejects mismatched %s provenance",
    (key) => {
      expect(() =>
        assemble(
          identity,
          [{ ...evidence(), identity: { ...identity, [key]: "different" } }],
          policy,
        ),
      ).toThrow();
    },
  );
  it("rejects duplicate evidence producers", () => {
    expect(() =>
      assemble(identity, [evidence(), evidence()], policy),
    ).toThrow();
  });
  it("evaluates PASS, FAIL, DEFERRED and NOT_APPLICABLE individually", () => {
    const p = {
      ...policy,
      rules: [
        ...policy.rules,
        { id: "manual", source: "manual", required: true, missing: "DEFERRED" },
        {
          id: "future",
          source: "sast",
          required: false,
          applicable: false,
          reason: "checkpoint E",
        },
      ],
    };
    const s = assemble(identity, [evidence()], p);
    expect(s.gate_evaluation.results.map((r) => r.status)).toEqual([
      "PASS",
      "DEFERRED",
      "NOT_APPLICABLE",
    ]);
    expect(s.gate_evaluation.status).toBe("DEFERRED");
    expect(
      evaluate(
        {
          ...s,
          checks: { ...s.checks, unit: { ...s.checks.unit!, status: "FAIL" } },
        },
        p,
      ).status,
    ).toBe("FAIL");
  });
  it("command failure overrides a green native report", () => {
    expect(
      assemble(identity, [{ ...evidence(), exit_code: 1 }], policy).checks.unit
        ?.status,
    ).toBe("FAIL");
  });
  it("rejects malformed canonical snapshot payloads", () => {
    expect(() => validateSnapshot({ identity })).toThrow();
  });
  it("no baseline means no invented acceptance or regression", () => {
    const s = assemble(identity, [evidence()], policy);
    expect(candidate(s).status).toBe("CANDIDATE");
    expect(compare(s, null).status).toBe("NO_BASELINE");
  });
  it("compares accepted baseline metrics without inventing regression verdicts", () => {
    const s = assemble(identity, [evidence()], policy);
    const c = candidate(s);
    const b = {
      ...c,
      status: "ACCEPTED",
      accepted_by: "Patrick",
      accepted_at: identity.created_at,
      decision_ref: "docs/decision.md",
    };
    expect(compare(s, { baseline: b, snapshot: s })).toMatchObject({
      status: "COMPARED",
      deltas: { tests: 0, failures: 0 },
    });
    expect(() => compare(s, { baseline: c, snapshot: s })).toThrow();
  });
  it("finalization never overwrites a previous run", () => {
    const dir = mkdtempSync(join(tmpdir(), "quality-test-"));
    try {
      const s = assemble(identity, [evidence()], policy);
      const p = finalize(dir, s);
      const before = readFileSync(p, "utf8");
      expect(() => finalize(dir, s)).toThrow();
      expect(readFileSync(p, "utf8")).toBe(before);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

it("retains criticality from native Playwright JSON tags without the at-sign", () => {
  const r = normalizePlaywright({
    errors: [],
    stats: { expected: 1, unexpected: 0, flaky: 0, skipped: 0 },
    suites: [
      {
        specs: [
          {
            id: "native",
            tags: ["critical", "route:auth", "component:login"],
            tests: [
              {
                projectName: "desktop",
                status: "expected",
                results: [{ status: "passed", retry: 0, duration: 1 }],
              },
            ],
          },
        ],
      },
    ],
  });
  expect(r.tests[0]?.tags).toContain("@critical");
});
it("accepts a complete long SQL suite without truncating its assertions", () => {
  const tap =
    Array.from(
      { length: 54 },
      (_, i) =>
        `ok ${i + 1} - protected security invariant ${i} with descriptive assertion`,
    ).join("\n") + "\n1..54";
  const input = {
    ...evidence({ suites: [{ file: "foundation.sql", tap }] }),
    source: "sql",
  };
  expect(
    assemble(identity, [input], {
      ...policy,
      rules: [{ id: "sql", source: "sql", required: true }],
    }).checks.sql?.passed,
  ).toBe(54);
});

it("rejects an accepted baseline with dirty sources or failing gates", () => {
  const s = assemble(
    { ...identity, dirty: true },
    [{ ...evidence(), identity: { ...identity, dirty: true } }],
    policy,
  );
  const b = {
    ...candidate(s),
    status: "ACCEPTED",
    accepted_by: "Patrick",
    accepted_at: identity.created_at,
    decision_ref: "docs/decision.md",
  };
  expect(() => compare(s, { baseline: b, snapshot: s })).toThrow();
});
it("rejects a Playwright report whose declared totals disagree with its tests", () => {
  expect(() =>
    normalizePlaywright({
      errors: [],
      stats: { expected: 2, unexpected: 0, flaky: 0, skipped: 0 },
      suites: [
        {
          specs: [
            {
              id: "partial",
              tags: ["critical"],
              tests: [
                {
                  projectName: "desktop",
                  status: "expected",
                  results: [{ status: "passed", retry: 0, duration: 1 }],
                },
              ],
            },
          ],
        },
      ],
    }),
  ).toThrow();
});

it("exposes security, accessibility and bundle deltas without inventing regression rules", () => {
  const before = assemble(identity, [evidence()], policy),
    after = structuredClone(before);
  before.checks.unit!.metrics = {
    vulnerabilities: { high: 0 },
    axe: { violations: 0 },
    bundles: { gzip_bytes: 100 },
  };
  after.checks.unit!.metrics = {
    vulnerabilities: { high: 1 },
    axe: { violations: 2 },
    bundles: { gzip_bytes: 110 },
  };
  const b = {
    ...candidate(before),
    status: "ACCEPTED",
    accepted_by: "Patrick",
    accepted_at: identity.created_at,
    decision_ref: "docs/decision.md",
  };
  const result = compare(after, { baseline: b, snapshot: before });
  expect(result.metric_deltas).toContainEqual({
    path: "checks.unit.vulnerabilities.high",
    before: 0,
    after: 1,
    delta: 1,
  });
  expect(result.metric_deltas).toContainEqual({
    path: "checks.unit.bundles.gzip_bytes",
    before: 100,
    after: 110,
    delta: 10,
  });
});

it("counts production E2E results in canonical comparison totals", () => {
  const before = assemble(identity, [evidence()], policy);
  const after = structuredClone(before);
  after.checks["e2e-prod"] = structuredClone(after.checks.unit!);
  const b = {
    ...candidate(before),
    status: "ACCEPTED",
    accepted_by: "reviewer-fixture",
    accepted_at: identity.created_at,
    decision_ref: "fixture-only",
  };
  expect(
    compare(after, { baseline: b, snapshot: before }).deltas,
  ).toMatchObject({ tests: 1 });
});
it("observability evidence fails closed when either privacy or logger suite is absent", () => {
  const report = (names: string[]) => ({
    success: true,
    numTotalTests: names.length,
    numPassedTests: names.length,
    numFailedTests: 0,
    numPendingTests: 0,
    testResults: names.map((name) => ({
      name,
      status: "passed",
      assertionResults: [{ fullName: name, status: "passed", duration: 1 }],
    })),
  });
  const p = {
    version: "F-test",
    mode: "advisory",
    rules: [{ id: "observability", source: "observability", required: true }],
  };
  const missing = assemble(
    identity,
    [evidence(report(["packages/backend/src/platform/logger.test.ts"]))],
    p,
  );
  expect(missing.gate_evaluation.status).toBe("FAIL");
  const complete = assemble(
    identity,
    [
      evidence(
        report([
          "packages/backend/src/platform/logger.test.ts",
          "packages/backend/src/platform/observability.test.ts",
        ]),
      ),
    ],
    p,
  );
  expect(complete.gate_evaluation.status).toBe("PASS");
  expect(complete.provenance.observability).toEqual(complete.provenance.unit);
});
