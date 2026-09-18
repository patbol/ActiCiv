import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { assemble, evaluate, candidate } from "../../tooling/quality/snapshot";
import { flakinessEvidence } from "../../packages/quality/src/flakiness";
import { check } from "../../tooling/quality/model";
import { finalize } from "../../tooling/quality/storage";
import { importRun } from "../../packages/backend/src/modules/quality/infrastructure/files";
export async function qualitySource() {
  const root = mkdtempSync(join(tmpdir(), "acticiv-quality-e2e-")),
    store = join(root, "store");
  for (const state of ["PASS", "FAIL", "DEFERRED"] as const) {
    const identity = {
      schema_version: 1,
      project: "ActiCiv",
      commit_sha: "0".repeat(40),
      source_digest: "1".repeat(64),
      branch: "synthetic-e2e",
      environment: "local",
      created_at: "2026-09-18T00:00:00Z",
      producer: "synthetic-e2e",
      run_id: "synthetic-" + state.toLowerCase(),
      dirty: true,
      versions: { node: "24" },
    };
    const policy = {
      version: "synthetic-H.v1",
      mode: "advisory",
      rules: [
        { id: "unit", source: "unit", required: true },
        { id: "dast", source: "dast", required: false },
        {
          id: "pentest",
          source: "pentest",
          required: false,
          applicable: false,
          reason: "Not commissioned",
        },
      ],
    };
    const snapshot = assemble(identity, [], policy);
    const report = "{}\n",
      ref = {
        path: "reports/safe.json",
        sha256: createHash("sha256").update(report).digest("hex"),
      };
    snapshot.checks.unit = check({
      status: state,
      passed: state === "PASS" ? 1 : 0,
      failed: state === "FAIL" ? 1 : 0,
      tests: [
        {
          id: "Synthetic canonical test",
          final_status: state === "FAIL" ? "failed" : "passed",
          retry_count: 0,
          flaky: false,
          duration_ms: 2,
          tags: ["@critical", "@route:quality", "@component:quality-center"],
        },
      ],
    });
    snapshot.provenance.unit = ref;
    snapshot.checks.flakiness = flakinessEvidence(
      state === "DEFERRED"
        ? null
        : {
            schema_version: 1,
            run_id: "synthetic-repetition",
            commit_sha: identity.commit_sha,
            source_digest: identity.source_digest,
            environment: identity.environment,
            source_unchanged: true,
            first_observed: identity.created_at,
            last_observed: identity.created_at,
            repetitions: 2,
            outcomes: [
              { exit_code: 0, status: "PASS" },
              {
                exit_code: state === "FAIL" ? 1 : 0,
                status: state === "FAIL" ? "FAIL" : "PASS",
              },
            ],
            tests: [
              {
                id: "Synthetic repetition",
                tags: ["@route:quality"],
                attempts: 2,
                passes: state === "FAIL" ? 1 : 2,
                failures: state === "FAIL" ? 1 : 0,
                flaky: state === "FAIL",
                failure_rate: state === "FAIL" ? 0.5 : 0,
              },
            ],
          },
      identity,
    );
    snapshot.provenance.flakiness = ref;
    snapshot.checks.axe = check({
      metrics: {
        analyses: 1,
        violations: 0,
        incomplete: 1,
        review_status: "REVIEW_REQUIRED",
        reviews: [{ test_id: "Synthetic a11y", rule: "color-contrast" }],
      },
    });
    snapshot.provenance.axe = ref;
    snapshot.checks.dast = check({
      metrics: {
        findings: [
          {
            tool: "zap",
            category: "missing-csp",
            severity: "medium",
            status: "open",
            retest_status: "pending",
            accepted_risk: null,
          },
        ],
      },
    });
    snapshot.provenance.dast = ref;
    snapshot.gate_evaluation = evaluate(snapshot, policy);
    snapshot.manual_evidence = [
      {
        tool: "VoiceOver",
        status: "PASS",
        reference: "docs/historical.md",
        scope: "Historical only",
      },
      {
        tool: "TalkBack",
        status: "DEFERRED",
        reference: "docs/historical.md",
        scope: "No Android evidence",
      },
    ];
    const metric = { total: 10, covered: 0, pct: 0 };
    snapshot.coverage = {
      global: {
        statements: metric,
        branches: metric,
        functions: metric,
        lines: metric,
      },
      modules: {
        critical: {
          statements: metric,
          branches: metric,
          functions: metric,
          lines: metric,
        },
      },
    };
    const path = finalize(join(root, "sources"), snapshot),
      dir = join(path, "..");
    mkdirSync(join(dir, "reports"));
    writeFileSync(join(dir, ref.path), report);
    if (state === "PASS")
      writeFileSync(
        join(dir, "baseline-candidate.json"),
        JSON.stringify(candidate(snapshot)),
      );
    await importRun(dir, store, {
      url: "https://github.com/patbol/ActiCiv/actions/runs/1",
      expires_at: "2020-01-01T00:00:00Z",
    });
  }
  mkdirSync(join(store, "synthetic-partial"));
  return store;
}
