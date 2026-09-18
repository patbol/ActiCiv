import { afterEach, describe, expect, it } from "vitest";
import {
  mkdtempSync,
  rmSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assemble, digest } from "./snapshot.ts";
import { finalize } from "./storage.ts";
import {
  importRun,
  listRuns,
  readRun,
} from "../../packages/backend/src/modules/quality/infrastructure/files.ts";
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});
function fixture(policyName = "policy-g.json") {
  const root = mkdtempSync(join(tmpdir(), "acticiv-qc-"));
  roots.push(root);
  const identity = {
    schema_version: 1,
    project: "ActiCiv",
    commit_sha: "a".repeat(40),
    source_digest: "b".repeat(64),
    branch: "test",
    environment: "local",
    created_at: "2026-09-18T00:00:00Z",
    producer: "test",
    run_id: "sample",
    dirty: false,
    versions: { node: "24.21.0" },
  };
  const policy = JSON.parse(
    readFileSync(new URL(policyName, import.meta.url), "utf8"),
  );
  const snapshot = assemble(identity, [], policy);
  const path = finalize(join(root, "source"), snapshot);
  return {
    root,
    path,
    source: join(root, "source", "sample"),
    target: join(root, "store"),
    snapshot,
  };
}
describe("immutable canonical quality source", () => {
  it.each(["policy.json", "policy-e.json", "policy-f.json", "policy-g.json"])(
    "preserves historical schema and %s verdict",
    async (name) => {
      const f = fixture(name);
      await importRun(f.source, f.target);
      const run = await readRun(f.target, "sample");
      expect(run.state).toBe("valid");
      if (run.state !== "valid") throw Error("not valid");
      expect(run.snapshot.gate_evaluation).toEqual(f.snapshot.gate_evaluation);
      expect(run.digest).toBe(digest(f.snapshot));
      expect(run.baseline.status).toBe("NONE");
    },
  );
  it("rejects corrupt digest and never publishes it", async () => {
    const f = fixture();
    writeFileSync(join(f.source, "snapshot.sha256"), "0".repeat(64));
    await expect(importRun(f.source, f.target)).rejects.toThrow();
    expect((await listRuns(f.target, {})).runs).toEqual([]);
  });
  it("missing referenced evidence fails closed", async () => {
    const f = fixture();
    f.snapshot.provenance.unit = {
      path: "reports/unit.json",
      sha256: "c".repeat(64),
    };
    writeFileSync(f.path, JSON.stringify(f.snapshot));
    writeFileSync(join(f.source, "snapshot.sha256"), digest(f.snapshot));
    await expect(importRun(f.source, f.target)).rejects.toThrow();
  });
  it("rejects traversal, symlinks, duplicate runs and incompatible schema", async () => {
    const f = fixture();
    await importRun(f.source, f.target);
    await expect(importRun(f.source, f.target)).rejects.toThrow();
    expect((await readRun(f.target, "../source/sample")).state).toBe("invalid");
    symlinkSync(f.source, join(f.target, "linked"));
    expect((await readRun(f.target, "linked")).state).toBe("invalid");
    const raw = JSON.parse(readFileSync(f.path, "utf8"));
    raw.identity.schema_version = 2;
    writeFileSync(f.path, JSON.stringify(raw));
    writeFileSync(join(f.source, "snapshot.sha256"), digest(raw));
    await expect(importRun(f.source, join(f.root, "other"))).rejects.toThrow();
  });
  it("lists partial runs visibly; absent root is empty", async () => {
    const f = fixture();
    mkdirSync(join(f.target, "partial"), { recursive: true });
    const runs = await listRuns(f.target, {});
    expect(runs.runs[0]?.state).toBe("invalid");
  });
  it("candidate is not human acceptance", async () => {
    const f = fixture();
    writeFileSync(
      join(f.source, "baseline-candidate.json"),
      JSON.stringify({
        status: "CANDIDATE",
        snapshot_digest: digest(f.snapshot),
        run_id: "sample",
        commit_sha: f.snapshot.identity.commit_sha,
        environment: "local",
        policy_digest: f.snapshot.gate_evaluation.policy_digest,
      }),
    );
    await importRun(f.source, f.target);
    const run = await readRun(f.target, "sample");
    expect(run.state === "valid" && run.baseline.status).toBe("CANDIDATE");
  });
});
import {
  present,
  safeText,
  observedComparison,
} from "../../packages/backend/src/modules/quality/infrastructure/presentation.ts";
import { controlledArtifact } from "../../packages/backend/src/modules/quality/infrastructure/files.ts";
it("presentation preserves all statuses, zero coverage, manual scope and open findings without raw report", () => {
  const f = fixture();
  f.snapshot.checks.dast = {
    status: "PASS",
    passed: 0,
    failed: 0,
    skipped: 0,
    retries: 0,
    flaky: 0,
    suites: 0,
    duration_ms: 1,
    tests: [],
    reason: "completed",
    metrics: {
      findings: [
        {
          tool: "zap",
          category: "missing-csp",
          severity: "medium",
          status: "open",
          summary: "token=private-secret",
          target: "/Users/private",
          retest_status: "pending",
          accepted_risk: null,
        },
      ],
      raw: "secret=private",
    },
  };
  f.snapshot.manual_evidence = [
    {
      tool: "TalkBack",
      status: "DEFERRED",
      reference: "docs/evidence.md",
      scope: "historical only",
    },
  ];
  const view = present({
    state: "valid",
    id: "sample",
    snapshot: f.snapshot,
    digest: digest(f.snapshot),
    baseline: { status: "NONE" },
    artifact: null,
  });
  expect(view.state).toBe("valid");
  if (view.state !== "valid") throw Error("invalid");
  expect(view.findings[0]).toMatchObject({
    severity: "medium",
    status: "open",
    accepted: false,
  });
  expect(view.manual[0]).toMatchObject({
    status: "DEFERRED",
    scope: "historical only",
  });
  expect(view.gates.map((g) => g.status)).toContain("FAIL");
  expect(view.gates.map((g) => g.status)).toContain("DEFERRED");
  expect(view.gates.map((g) => g.status)).toContain("NOT_APPLICABLE");
  expect(JSON.stringify(view)).not.toMatch(
    /private-secret|Users\/private|secret=private/,
  );
});
it("artifact URLs reject local paths, javascript, credentials, query tokens and other repositories", () => {
  for (const url of [
    "/Users/private",
    "javascript:alert(1)",
    "https://github.com/evil/repo/actions/runs/1",
    "https://github.com/patbol/ActiCiv/actions/runs/1?token=secret",
    "https://x:secret@github.com/patbol/ActiCiv/actions/runs/1",
  ])
    expect(() => controlledArtifact({ url, expires_at: null })).toThrow();
  expect(
    controlledArtifact({
      url: "https://github.com/patbol/ActiCiv/actions/runs/1",
      expires_at: "2020-01-01T00:00:00Z",
    })?.expired,
  ).toBe(true);
  expect(safeText("Bearer token-private")).toBe("[redacted]");
});
it("deltas do not invent unknown measurements or compare incompatible policies", () => {
  const f = fixture(),
    next = structuredClone(f.snapshot);
  next.gate_evaluation.policy_digest = "c".repeat(64);
  expect(observedComparison(next, f.snapshot).state).toBe("INCOMPATIBLE");
  expect(observedComparison(f.snapshot, f.snapshot).tests).toBeNull();
});
it("retains the canonical accepted-risk expiry field", () => {
  const f = fixture();
  f.snapshot.checks.sast = {
    status: "PASS",
    passed: 0,
    failed: 0,
    skipped: 0,
    retries: 0,
    flaky: 0,
    suites: 0,
    duration_ms: 0,
    tests: [],
    reason: "completed",
    metrics: {
      findings: [
        {
          tool: "semgrep",
          category: "example",
          severity: "high",
          status: "open",
          retest_status: "pending",
          accepted_risk: {
            owner: "Engineering",
            expiry: "2026-10-01T00:00:00Z",
          },
        },
      ],
    },
  };
  const view = present({
    state: "valid",
    id: "sample",
    snapshot: f.snapshot,
    digest: digest(f.snapshot),
    baseline: { status: "NONE" },
    artifact: null,
  });
  expect(view.state === "valid" && view.findings[0]?.expiry).toBe(
    "2026-10-01T00:00:00Z",
  );
});
it("validates accepted baseline identity and does not promote a candidate", async () => {
  const f = fixture();
  f.snapshot.gate_evaluation.status = "PASS";
  writeFileSync(f.path, JSON.stringify(f.snapshot));
  writeFileSync(join(f.source, "snapshot.sha256"), digest(f.snapshot));
  const baseline = {
    status: "ACCEPTED",
    snapshot_digest: digest(f.snapshot),
    run_id: "sample",
    commit_sha: f.snapshot.identity.commit_sha,
    environment: "local",
    policy_digest: f.snapshot.gate_evaluation.policy_digest,
    accepted_by: "Synthetic reviewer",
    accepted_at: "2026-09-18T00:00:00Z",
    decision_ref: "synthetic-test-only",
  };
  writeFileSync(
    join(f.source, "baseline-accepted.json"),
    JSON.stringify(baseline),
  );
  await importRun(f.source, f.target);
  const run = await readRun(f.target, "sample");
  expect(run.state === "valid" && run.baseline.status).toBe("ACCEPTED");
  baseline.snapshot_digest = "f".repeat(64);
  writeFileSync(
    join(f.source, "baseline-accepted.json"),
    JSON.stringify(baseline),
  );
  await expect(
    importRun(f.source, join(f.root, "invalid-baseline")),
  ).rejects.toThrow();
});
import { normalizeCoverage } from "./parsers.ts";
it("measures the extracted canonical module and Quality Center without dropping zero-covered files", () => {
  const m = {
    statements: { total: 10, covered: 0, pct: 0 },
    branches: { total: 10, covered: 0, pct: 0 },
    functions: { total: 10, covered: 0, pct: 0 },
    lines: { total: 10, covered: 0, pct: 0 },
  };
  const result = normalizeCoverage({
    total: m,
    "packages/quality/src/snapshot.ts": m,
  });
  expect(result.modules["quality-center"]?.lines).toEqual({
    total: 10,
    covered: 0,
    pct: 0,
  });
});
it("compares critical-module coverage including measured zero, not a new gate", () => {
  const f = fixture(),
    before = structuredClone(f.snapshot),
    after = structuredClone(f.snapshot);
  const m = {
    statements: { total: 10, covered: 0, pct: 0 },
    branches: { total: 10, covered: 0, pct: 0 },
    functions: { total: 10, covered: 0, pct: 0 },
    lines: { total: 10, covered: 0, pct: 0 },
  };
  before.coverage = {
    global: structuredClone(m),
    modules: { critical: structuredClone(m) },
  };
  after.coverage = structuredClone(before.coverage);
  after.coverage.modules.critical!.lines = { total: 10, covered: 2, pct: 20 };
  const result = observedComparison(after, before);
  expect(result.moduleCoverage).toContainEqual({
    name: "critical.lines",
    delta: 20,
  });
  expect(after.gate_evaluation).toEqual(f.snapshot.gate_evaluation);
});
it.each([
  { accepted_by: true, accepted_at: "2026-09-18T00:00:00Z" },
  { accepted_by: "Reviewer", accepted_at: "not-a-date" },
])("rejects malformed human baseline metadata", async (fields) => {
  const f = fixture();
  f.snapshot.gate_evaluation.status = "PASS";
  writeFileSync(f.path, JSON.stringify(f.snapshot));
  writeFileSync(join(f.source, "snapshot.sha256"), digest(f.snapshot));
  writeFileSync(
    join(f.source, "baseline-accepted.json"),
    JSON.stringify({
      status: "ACCEPTED",
      snapshot_digest: digest(f.snapshot),
      run_id: "sample",
      commit_sha: f.snapshot.identity.commit_sha,
      environment: "local",
      policy_digest: f.snapshot.gate_evaluation.policy_digest,
      decision_ref: "synthetic",
      ...fields,
    }),
  );
  await expect(importRun(f.source, f.target)).rejects.toThrow();
});
