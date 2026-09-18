import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  assemble,
  candidate,
  digest,
  evaluate,
  policy,
  validateSnapshot,
} from "./snapshot";
import { check } from "./model";
import { assessPromotion } from "../../packages/quality/src/promotion";
import { flakinessEvidence } from "../../packages/quality/src/flakiness";
import { repetitions } from "./flakiness";
import { securityGate } from "./security";
import { normalizePlaywright } from "./parsers";
import { present } from "../../packages/backend/src/modules/quality/infrastructure/presentation";
const who = {
  schema_version: 2,
  project: "ActiCiv",
  commit_sha: "a".repeat(40),
  branch: "test",
  environment: "local",
  created_at: "2026-09-18T00:00:00Z",
  producer: "test",
  run_id: "i2-test",
  source_digest: "b".repeat(64),
  dirty: false,
  versions: { node: "24" },
};
const base = {
  version: "test.v2",
  schema_version: 2,
  mode: "advisory",
  rules: [{ id: "unit", source: "unit", required: true }],
  budgets: [],
};
const ref = { path: "reports/safe.json", sha256: "c".repeat(64) };
const approval = {
  approved_by: "Patrick",
  approved_at: "2026-09-18T01:00:00Z",
  decision_ref: "test-decision",
};
function snapshot() {
  const s = assemble(who, [], base);
  s.checks.unit = check({ passed: 1 });
  s.provenance.unit = ref;
  s.checks.performance = check({ metrics: { js_bytes: 12 } });
  s.provenance.performance = ref;
  s.gate_evaluation = evaluate(s, base);
  return s;
}
const budget = (mode = "advisory") => ({
  id: "size",
  source: "performance",
  metric: "js_bytes",
  operator: "max",
  value: 10,
  mode,
  ...(mode === "blocking" ? { approval } : {}),
});
describe("I2 configurable budgets", () => {
  it("keeps absent budgets distinct from configured ones", () => {
    expect(evaluate(snapshot(), base).results).toHaveLength(1);
  });
  it("records advisory breach without a blocking verdict", () => {
    const r = evaluate(snapshot(), { ...base, budgets: [budget()] });
    expect(r.status).toBe("PASS");
    expect(r.results.at(-1)).toMatchObject({ status: "FAIL", blocking: false });
  });
  it("blocks an approved breached budget and passes a respected budget", () => {
    expect(
      evaluate(snapshot(), { ...base, budgets: [budget("blocking")] }).status,
    ).toBe("FAIL");
    expect(
      evaluate(snapshot(), {
        ...base,
        budgets: [{ ...budget("blocking"), value: 12 }],
      }).status,
    ).toBe("PASS");
  });
  it("supports coverage, missing measurements and invalid config", () => {
    const s = snapshot();
    s.checks.coverage = check({
      metrics: { coverage: { global: { lines: { pct: 45 } } } },
    });
    s.provenance.coverage = ref;
    expect(
      evaluate(s, {
        ...base,
        budgets: [
          {
            ...budget("blocking"),
            source: "coverage",
            metric: "coverage.global.lines.pct",
            operator: "min",
            value: 40,
          },
        ],
      }).status,
    ).toBe("PASS");
    expect(
      evaluate(s, {
        ...base,
        budgets: [{ ...budget("blocking"), metric: "missing" }],
      }).status,
    ).toBe("FAIL");
    for (const b of [
      { ...budget(), value: NaN },
      { ...budget(), mode: "anything" },
      { ...budget("blocking"), approval: undefined },
    ])
      expect(() => policy({ ...base, budgets: [b] })).toThrow();
    expect(() => policy({ ...base, unknown: true })).toThrow();
    expect(() =>
      policy({ ...base, rules: [{ ...base.rules[0], maximum: 10 }] }),
    ).toThrow();
  });
  it.each(["policy.json", "policy-e.json", "policy-f.json", "policy-g.json"])(
    "preserves historical policy and snapshot %s",
    (file) => {
      const p = JSON.parse(readFileSync(`tooling/quality/${file}`, "utf8"));
      expect(policy(p)).toEqual(p);
      const s = assemble({ ...who, schema_version: 1 }, [], p);
      expect(validateSnapshot(s)).toEqual(s);
    },
  );
});
describe("I2 promotion evidence", () => {
  function input() {
    const s = snapshot();
    s.checks.artifact = check({
      metrics: { artifacts: [{ app: "pro", artifact_digest: "d".repeat(64) }] },
    });
    s.provenance.artifact = ref;
    const acceptance = {
      ...candidate(s),
      status: "ACCEPTED",
      accepted_by: "Patrick",
      accepted_at: approval.approved_at,
      decision_ref: "test-decision",
    };
    return {
      snapshot: s,
      policy: base,
      baseline: acceptance,
      policy_approval: {
        ...approval,
        policy_digest: s.gate_evaluation.policy_digest,
      },
      source_environment: "demo",
      target_environment: "prod",
      artifacts: { pro: "d".repeat(64) },
      at: "2026-09-18T02:00:00Z",
    };
  }
  it("distinguishes candidate, validated and eligible without deploying", () => {
    const i = input();
    expect(
      assessPromotion({
        ...i,
        snapshot: {
          ...i.snapshot,
          identity: { ...i.snapshot.identity, dirty: true },
        },
      }).state,
    ).toBe("candidate");
    expect(assessPromotion({ ...i, baseline: null }).state).toBe("validated");
    expect(assessPromotion(i).state).toBe("eligible");
  });
  it("refuses another artifact, changed policy, missing required evidence and future approvals", () => {
    const i = input();
    expect(
      assessPromotion({ ...i, artifacts: { pro: "e".repeat(64) } }).state,
    ).toBe("validated");
    expect(
      assessPromotion({ ...i, policy: { ...base, version: "changed" } }).state,
    ).toBe("candidate");
    expect(
      assessPromotion({
        ...i,
        policy_approval: {
          ...i.policy_approval,
          approved_at: "2099-01-01T00:00:00Z",
        },
      }).state,
    ).toBe("validated");
    const p = {
      ...base,
      promotion: {
        required_checks: ["backup-readiness"],
        required_manual: ["VoiceOver"],
      },
    };
    const s = { ...i.snapshot, gate_evaluation: evaluate(i.snapshot, p) };
    expect(assessPromotion({ ...i, snapshot: s, policy: p }).state).not.toBe(
      "eligible",
    );
  });
  it("only records promoted with an exact external receipt", () => {
    const i = input();
    const receipt = {
      commit_sha: who.commit_sha,
      artifacts: i.artifacts,
      source_environment: "demo",
      target_environment: "prod",
      actor: "operator",
      at: i.at,
      evidence_ref: "external-deployment-record",
      snapshot_digest: digest(i.snapshot),
      policy_digest: i.snapshot.gate_evaluation.policy_digest,
    };
    expect(assessPromotion({ ...i, receipt }).state).toBe("promoted");
    expect(
      assessPromotion({
        ...i,
        receipt: { ...receipt, commit_sha: "e".repeat(40) },
      }).state,
    ).toBe("eligible");
  });
});
const observation = (passes = 2, failures = 0) => ({
  schema_version: 1,
  run_id: "flakiness-test",
  commit_sha: who.commit_sha,
  source_digest: who.source_digest,
  environment: "local",
  source_unchanged: true,
  first_observed: who.created_at,
  last_observed: who.created_at,
  repetitions: passes + failures,
  outcomes: Array.from({ length: passes + failures }, (_, i) => ({
    exit_code: i < passes ? 0 : 1,
    status: i < passes ? "PASS" : "FAIL",
  })),
  tests: [
    {
      id: "test:desktop",
      tags: ["@route:quality"],
      attempts: passes + failures,
      passes,
      failures,
      flaky: passes > 0 && failures > 0,
      failure_rate: failures / (passes + failures),
    },
  ],
});
describe("I2 measured flakiness", () => {
  it("distinguishes not run, insufficient, stable and observed flaky", () => {
    expect(flakinessEvidence(null, who).metrics.state).toBe("NOT_RUN");
    expect(flakinessEvidence(observation(1), who).metrics.state).toBe(
      "UNKNOWN",
    );
    expect(flakinessEvidence(observation(), who).metrics.state).toBe("STABLE");
    expect(flakinessEvidence(observation(1, 1), who)).toMatchObject({
      status: "FAIL",
      metrics: { state: "OBSERVED_FLAKY" },
    });
  });
  it("rejects mismatched provenance and inconsistent counts", () => {
    expect(() =>
      flakinessEvidence(
        { ...observation(), source_digest: "e".repeat(64) },
        who,
      ),
    ).toThrow();
    expect(() =>
      flakinessEvidence({ ...observation(), repetitions: 3 }, who),
    ).toThrow();
  });
  it("connects producer, snapshot, evaluator and server projection", () => {
    const s = assemble(
      who,
      [
        {
          identity: who,
          source: "flakiness",
          exit_code: 0,
          duration_ms: 1,
          report: observation(1, 1),
          reference: ref,
        },
      ],
      {
        ...base,
        rules: [{ id: "stability", source: "flakiness", required: true }],
      },
    );
    expect(s.gate_evaluation.status).toBe("FAIL");
    const view = present({
      state: "valid",
      id: who.run_id,
      snapshot: s,
      digest: digest(s),
      baseline: { status: "NONE" },
      artifact: null,
    });
    expect(view.state === "valid" && view.flakiness.state).toBe(
      "OBSERVED_FLAKY",
    );
  });
});
const finding = {
  id: "test",
  tool: "zap",
  category: "csp",
  severity: "high",
  status: "OPEN",
  target: "pro",
  summary: "csp",
  accepted_risk: null,
  retest_status: "pending",
  owner: "security-owner",
  first_observed: who.created_at,
  due: "2026-10-01T00:00:00Z",
  reason: "Triage",
  mitigation: "Restricted exposure",
  evidence: [],
};
describe("I2 security finding lifecycle", () => {
  it("keeps open and fixed findings blocking until a evidenced retest", () => {
    expect(securityGate([finding], [], who.created_at).status).toBe("FAIL");
    expect(
      securityGate(
        [
          {
            ...finding,
            status: "FIXED_PENDING_RETEST",
            evidence: ["fix-commit"],
          },
        ],
        [],
        who.created_at,
      ).status,
    ).toBe("FAIL");
    expect(() =>
      securityGate([{ ...finding, status: "CLOSED" }], [], who.created_at),
    ).toThrow();
    expect(
      securityGate(
        [
          {
            ...finding,
            status: "CLOSED",
            retest_status: "passed",
            evidence: ["fix-commit", "retest-run"],
          },
        ],
        [],
        who.created_at,
      ).status,
    ).toBe("PASS");
  });
  it("requires explicit unexpired risk and never accepts critical", () => {
    const risk = {
      finding_id: "test",
      owner: "Patrick",
      reason: "Review",
      approved_by: "Patrick",
      accepted_at: who.created_at,
      expiry: "2026-10-01T00:00:00Z",
      mitigation: "Restricted",
      scope: "prod",
      retest_required: true,
    };
    const f = { ...finding, status: "ACCEPTED_RISK" };
    expect(securityGate([f], [risk], who.created_at).status).toBe("PASS");
    expect(securityGate([f], [risk], "2026-10-02T00:00:00Z").status).toBe(
      "FAIL",
    );
    expect(
      securityGate([{ ...f, severity: "critical" }], [risk], who.created_at)
        .status,
    ).toBe("FAIL");
    expect(securityGate([f], [], who.created_at).status).toBe("FAIL");
  });
});
it("I2 preserves axe incomplete rule/test provenance without claiming manual PASS", () => {
  const raw = {
    errors: [],
    stats: { expected: 1, unexpected: 0, flaky: 0, skipped: 0 },
    suites: [
      {
        specs: [
          {
            id: "quality",
            tags: ["@route:quality"],
            tests: [
              {
                projectName: "desktop",
                status: "expected",
                results: [
                  {
                    status: "passed",
                    retry: 0,
                    duration: 1,
                    attachments: [
                      {
                        name: "acticiv-axe",
                        body: Buffer.from(
                          JSON.stringify({
                            violations: 0,
                            incomplete: 1,
                            rules: [],
                            incomplete_rules: ["color-contrast"],
                          }),
                        ).toString("base64"),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  const a = normalizePlaywright(raw).metrics.axe;
  expect(a).toMatchObject({
    review_status: "REVIEW_REQUIRED",
    incomplete: 1,
    reviews: [{ test_id: "quality:desktop", rule: "color-contrast" }],
  });
});

it("keeps all historical ZAP findings open without invented ownership", () => {
  const debt = JSON.parse(
    readFileSync("tooling/security/security-debt.json", "utf8"),
  );
  const r = securityGate(
    debt.findings,
    debt.accepted_risks,
    "2026-09-19T00:00:00Z",
  );
  expect(r.findings).toHaveLength(17);
  expect(
    r.findings.every(
      (f) =>
        f.status === "OPEN" &&
        f.accepted_risk === null &&
        f.retest_status === "pending",
    ),
  ).toBe(true);
});

it("requires missing promotion checks even after matching baseline/policy approval", () => {
  const p = {
    ...base,
    promotion: {
      required_checks: ["backup-readiness"],
      required_manual: ["VoiceOver-current"],
    },
  };
  const s = snapshot();
  s.checks.artifact = check({
    metrics: { artifacts: [{ app: "pro", artifact_digest: "d".repeat(64) }] },
  });
  s.provenance.artifact = ref;
  s.gate_evaluation = evaluate(s, p);
  const i = {
    snapshot: s,
    policy: p,
    baseline: {
      ...candidate(s),
      status: "ACCEPTED",
      accepted_by: "Patrick",
      accepted_at: approval.approved_at,
      decision_ref: "test",
    },
    policy_approval: {
      ...approval,
      policy_digest: s.gate_evaluation.policy_digest,
    },
    source_environment: "demo",
    target_environment: "prod",
    artifacts: { pro: "d".repeat(64) },
    at: "2026-09-18T02:00:00Z",
  };
  expect(assessPromotion(i)).toMatchObject({
    state: "validated",
    reasons: [
      "Required readiness check: backup-readiness",
      "Required manual evidence: VoiceOver-current",
    ],
  });
});
it("does not turn retried passes into stable repetition evidence", () => {
  const retry = {
    id: "test",
    tags: [],
    final_status: "passed",
    retry_count: 1,
    flaky: true,
    duration_ms: 1,
  };
  const measure = repetitions([[retry], [retry]]);
  const r = flakinessEvidence(
    {
      ...observation(),
      ...measure,
      outcomes: [
        { exit_code: 0, status: "FAIL" },
        { exit_code: 0, status: "FAIL" },
      ],
    },
    who,
  );
  expect(r.status).toBe("FAIL");
  expect(r.metrics.state).not.toBe("STABLE");
});
