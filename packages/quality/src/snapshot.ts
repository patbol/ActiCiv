import { createHash } from "node:crypto";
import {
  object,
  array,
  string,
  integer,
  count,
  check,
  summarize,
} from "./model.ts";
import type {
  Identity,
  Policy,
  Snapshot,
  Check,
  Status,
  Reference,
} from "./model.ts";
import {
  normalizeVitest,
  normalizePlaywright,
  normalizeAudit,
  normalizeCoverage,
  parseTap,
} from "./parsers.ts";
import { assuranceCheck, securityGate } from "./security.ts";
import { budgets, evaluateBudget, exactKeys } from "./budgets.ts";
import { flakinessEvidence } from "./flakiness.ts";
export function digest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export function identity(raw: unknown): Identity {
  const r = object(raw);
  if (
    (r.schema_version !== 1 && r.schema_version !== 2) ||
    r.project !== "ActiCiv" ||
    !/^\w[\w.-]{0,120}$/.test(string(r.run_id)) ||
    !/^[a-f0-9]{40}$/.test(string(r.commit_sha)) ||
    !/^[a-f0-9]{64}$/.test(string(r.source_digest)) ||
    typeof r.dirty !== "boolean" ||
    !Number.isFinite(Date.parse(string(r.created_at))) ||
    !["local", "ci-local"].includes(string(r.environment))
  )
    throw Error("Invalid quality identity");
  return {
    schema_version: r.schema_version as 1 | 2,
    project: "ActiCiv",
    commit_sha: r.commit_sha as string,
    branch: string(r.branch),
    environment: r.environment as string,
    created_at: r.created_at as string,
    producer: string(r.producer),
    run_id: r.run_id as string,
    source_digest: r.source_digest as string,
    dirty: r.dirty,
    versions: Object.fromEntries(
      Object.entries(object(r.versions)).map(([k, v]) => [k, string(v)]),
    ),
  };
}
export function policy(raw: unknown): Policy {
  const r = object(raw);
  exactKeys(r, [
    "version",
    "mode",
    "rules",
    "schema_version",
    "budgets",
    "promotion",
  ]);
  if (
    (r.schema_version !== undefined && r.schema_version !== 2) ||
    ((r.budgets !== undefined || r.promotion !== undefined) &&
      r.schema_version !== 2)
  )
    throw Error("New policy fields require schema v2");
  if (r.mode !== "advisory")
    throw Error(
      "Blocking policy requires explicit approval and implementation review",
    );
  const ids = new Set<string>();
  const rules = array(r.rules).map((value) => {
    const v = object(value),
      id = string(v.id);
    exactKeys(v, [
      "id",
      "source",
      "required",
      "missing",
      "applicable",
      "reason",
    ]);
    if (
      ids.has(id) ||
      typeof v.required !== "boolean" ||
      (v.missing !== undefined &&
        v.missing !== "FAIL" &&
        v.missing !== "DEFERRED") ||
      (v.applicable !== undefined && typeof v.applicable !== "boolean") ||
      (v.applicable === false && !v.reason)
    )
      throw Error("Invalid gate rule");
    ids.add(id);
    return {
      id,
      source: string(v.source),
      required: v.required,
      ...(v.missing ? { missing: v.missing as "FAIL" | "DEFERRED" } : {}),
      ...(typeof v.applicable === "boolean"
        ? { applicable: v.applicable }
        : {}),
      ...(v.reason ? { reason: string(v.reason) } : {}),
    };
  });
  if (!rules.length) throw Error("Empty policy");
  const extensions: Pick<Policy, "schema_version" | "budgets" | "promotion"> =
    {};
  if (r.schema_version === 2) extensions.schema_version = 2;
  if (r.budgets !== undefined) extensions.budgets = budgets(r.budgets, ids);
  if (r.promotion !== undefined) {
    const p = object(r.promotion);
    exactKeys(p, ["required_checks", "required_manual"]);
    extensions.promotion = {
      required_checks: array(p.required_checks).map(string),
      required_manual: array(p.required_manual).map(string),
    };
  }
  return { version: string(r.version), mode: "advisory", rules, ...extensions };
}
export function evaluate(
  snapshot: Pick<Snapshot, "checks" | "provenance">,
  raw: unknown,
): Snapshot["gate_evaluation"] {
  const p = policy(raw);
  const results: import("./model.ts").Gate[] = p.rules.map((rule) => {
    const evidence = snapshot.provenance[rule.source] ?? null,
      c = snapshot.checks[rule.source];
    if (rule.applicable === false)
      return {
        rule_id: rule.id,
        status: "NOT_APPLICABLE" as Status,
        reason: rule.reason!,
        evidence,
      };
    if (!c)
      return {
        rule_id: rule.id,
        status: (rule.missing ??
          (rule.required ? "FAIL" : "DEFERRED")) as Status,
        reason: "missing evidence",
        evidence,
      };
    // Required evidence cannot be bypassed by a producer declaring itself N/A.
    const status =
      rule.required && c.status === "NOT_APPLICABLE" ? "FAIL" : c.status;
    return { rule_id: rule.id, status, reason: c.reason, evidence };
  });
  const required = results.filter(
    (_, i) => p.rules[i]!.required && p.rules[i]!.applicable !== false,
  );
  for (const b of p.budgets ?? []) {
    const gate = evaluateBudget(b, snapshot.checks, snapshot.provenance);
    results.push(gate);
    if (gate.blocking) required.push(gate);
  }
  const status = required.some((r) => r.status === "FAIL")
    ? "FAIL"
    : required.some((r) => r.status === "DEFERRED")
      ? "DEFERRED"
      : "PASS";
  return {
    policy_version: p.version,
    policy_digest: digest(p),
    mode: p.mode,
    status,
    results,
  };
}
function reference(raw: unknown): Reference {
  const r = object(raw),
    path = string(r.path);
  if (
    path.startsWith("/") ||
    path.includes("..") ||
    !/^[-\w./]+$/.test(path) ||
    !/^[a-f0-9]{64}$/.test(string(r.sha256))
  )
    throw Error("Unsafe evidence reference");
  return { path, sha256: r.sha256 as string };
}
function normalized(raw: unknown): Check {
  const r = object(raw);
  if (
    !["PASS", "FAIL", "DEFERRED", "NOT_APPLICABLE"].includes(string(r.status))
  )
    throw Error("Invalid check status");
  const tests = array(r.tests).map((value) => {
    const t = object(value);
    if (typeof t.flaky !== "boolean")
      throw Error("Invalid flaky classification");
    return {
      id: string(t.id),
      final_status: string(t.final_status),
      retry_count: integer(t.retry_count),
      flaky: t.flaky,
      duration_ms: count(t.duration_ms),
      tags: array(t.tags).map(string),
    };
  });
  const c: Check = {
    status: r.status as Status,
    passed: integer(r.passed),
    failed: integer(r.failed),
    skipped: integer(r.skipped),
    retries: integer(r.retries),
    flaky: integer(r.flaky),
    suites: integer(r.suites),
    duration_ms: count(r.duration_ms),
    tests,
    metrics: object(r.metrics),
    reason: string(r.reason),
  };
  if (c.status === "PASS" && (c.failed || c.skipped || c.retries || c.flaky))
    throw Error("False clean PASS");
  return c;
}
export function assemble(
  rawIdentity: unknown,
  inputs: unknown[],
  rawPolicy: unknown,
): Snapshot {
  const who = identity(rawIdentity),
    checks: Record<string, Check> = {},
    provenance: Record<string, Reference> = {};
  let coverage: Snapshot["coverage"] = null;
  const seen = new Set<string>();
  for (const input of inputs) {
    const row = object(input),
      from = identity(row.identity);
    for (const key of [
      "commit_sha",
      "environment",
      "run_id",
      "source_digest",
      "dirty",
    ] as const)
      if (from[key] !== who[key]) throw Error("Mismatched evidence provenance");
    const source = string(row.source);
    if (seen.has(source)) throw Error("Duplicate evidence source");
    seen.add(source);
    provenance[source] = reference(row.reference);
    const exit = integer(row.exit_code),
      duration = count(row.duration_ms);
    let result: Check;
    try {
      if (source === "security-debt") {
        const r = object(row.report);
        const debt = securityGate(
          array(r.findings),
          array(r.accepted_risks),
          who.created_at,
        );
        result = check({
          status: debt.status as Status,
          metrics: {
            ...debt,
            scope: "Tracked debt; not a fresh scan",
            source_snapshot_digest: string(r.source_snapshot_digest),
          },
          reason: "Historical security debt with explicit lifecycle",
        });
      } else if (source === "flakiness")
        result = flakinessEvidence(row.report, who);
      else if (source === "unit" || source === "integration-adapters")
        result = normalizeVitest(row.report);
      else if (["e2e", "e2e-prod"].includes(source))
        result = normalizePlaywright(row.report);
      else if (["sast", "dast", "artifact", "performance"].includes(source))
        result = assuranceCheck(row.report, source);
      else if (source === "dependency-audit")
        result = normalizeAudit(row.report);
      else if (source === "coverage") {
        coverage = normalizeCoverage(row.report);
        result = check({
          metrics: { coverage },
          reason: "Measured only; no approved coverage threshold",
        });
      } else if (source === "sql") {
        const suites = array(object(row.report).suites).map((value) => {
          const s = object(value);
          return {
            file: string(s.file),
            result: parseTap(
              typeof s.tap === "string" && s.tap.length <= 2_000_000
                ? s.tap
                : (() => {
                    throw Error("Invalid TAP payload");
                  })(),
            ),
          };
        });
        if (!suites.length) throw Error("Empty SQL report");
        result = summarize(
          suites.flatMap((s) =>
            s.result.tests.map((t) => ({ ...t, id: s.file + ":" + t.id })),
          ),
          suites.length,
        );
        result.metrics = {
          dimension: "SQL assertions (not JS coverage)",
          suites: suites.map((s) => ({
            file: s.file,
            passed: s.result.passed,
            failed: s.result.failed,
            skipped: s.result.skipped,
          })),
        };
      } else if (source === "integration-node") {
        const r = object(row.report);
        if (r.complete !== true) throw Error("Incomplete node report");
        result = normalized(r.summary);
        if (
          !result.tests.length ||
          result.tests.length !== result.passed + result.failed + result.skipped
        )
          throw Error("Incomplete node tests");
      } else if (
        [
          "format",
          "lint",
          "typecheck",
          "build-citizen",
          "build-pro",
          "bundles",
          "db-reset",
          "secret-scan",
          "docs",
          "source-integrity",
        ].includes(source)
      ) {
        const r = object(row.report);
        if (r.complete !== true || r.tool_status !== "completed")
          throw Error("Incomplete command evidence");
        result = check({
          metrics: object(r.metrics ?? {}),
          status: r.passed === true ? "PASS" : "FAIL",
        });
      } else throw Error("Unknown producer");
    } catch {
      result = check({
        status: "FAIL",
        reason: "invalid or incomplete native report",
      });
    }
    result.duration_ms = duration;
    if (exit !== 0) {
      result.status = "FAIL";
      result.reason = "producer command failed";
    }
    checks[source] = result;
  }
  if (checks.unit) {
    const a = array(checks.unit.metrics.architecture ?? []).map(object);
    checks.architecture = check({
      status:
        checks.unit.status === "PASS" &&
        a.length >= 2 &&
        a.every(
          (s) =>
            s.status === "passed" && integer(s.passed) === integer(s.total),
        )
          ? "PASS"
          : "FAIL",
      metrics: { suites: a },
      reason: "Architecture and conventions are a subset of unit evidence",
    });
    provenance.architecture = provenance.unit!;
    const o = array(checks.unit.metrics.observability ?? []).map(object);
    checks.observability = check({
      status:
        checks.unit.status === "PASS" &&
        ["logger.test.ts", "observability.test.ts"].every((name) =>
          o.some(
            (s) =>
              s.suite === name &&
              s.status === "passed" &&
              integer(s.total) > 0 &&
              integer(s.passed) === integer(s.total),
          ),
        )
          ? "PASS"
          : "FAIL",
      metrics: { suites: o },
      reason:
        "Registry/privacy/logger subset of unit evidence; SQL audit and real adapters remain separate required checks",
    });
    provenance.observability = provenance.unit!;
  }
  if (checks.e2e) {
    const e = checks.e2e;
    checks["e2e-critical"] = summarize(
      e.tests.filter((t) => t.tags.includes("@critical")),
      e.suites,
    );
    if (e.status === "FAIL") checks["e2e-critical"].status = "FAIL";
    provenance["e2e-critical"] = provenance.e2e!;
    const a = object(e.metrics.axe ?? {});
    checks.axe = check({
      status:
        e.status === "PASS" &&
        typeof a.analyses === "number" &&
        a.analyses > 0 &&
        a.violations === 0
          ? "PASS"
          : "FAIL",
      metrics: a,
      reason: "Only axe analyses; incomplete checks require human review",
    });
    provenance.axe = provenance.e2e!;
    if (who.schema_version === 2) {
      checks["axe-review"] = check({
        status: Number(a.incomplete) > 0 ? "DEFERRED" : "PASS",
        metrics: a,
        reason:
          Number(a.incomplete) > 0
            ? "REVIEW_REQUIRED: incomplete is not a violation or a human PASS"
            : "No incomplete automatic checks; manual accessibility remains separate",
      });
      provenance["axe-review"] = provenance.e2e!;
    }
  }
  const partial = {
    identity: who,
    checks,
    provenance,
    coverage,
    manual_evidence: [],
  };
  return { ...partial, gate_evaluation: evaluate(partial, rawPolicy) };
}
export function validateSnapshot(raw: unknown): Snapshot {
  const r = object(raw),
    who = identity(r.identity);
  const checks = Object.fromEntries(
    Object.entries(object(r.checks)).map(([k, v]) => [k, normalized(v)]),
  );
  const provenance = Object.fromEntries(
    Object.entries(object(r.provenance)).map(([k, v]) => [k, reference(v)]),
  );
  for (const k of Object.keys(checks))
    if (!provenance[k]) throw Error("Missing check provenance");
  const gates = object(r.gate_evaluation);
  if (
    !["PASS", "FAIL", "DEFERRED", "NOT_APPLICABLE"].includes(
      string(gates.status),
    ) ||
    gates.mode !== "advisory" ||
    !/^[a-f0-9]{64}$/.test(string(gates.policy_digest))
  )
    throw Error("Invalid gate evaluation");
  const results = array(gates.results).map((value) => {
    const v = object(value);
    if (
      !["PASS", "FAIL", "DEFERRED", "NOT_APPLICABLE"].includes(string(v.status))
    )
      throw Error("Invalid gate result");
    return {
      rule_id: string(v.rule_id),
      status: v.status as Status,
      reason: string(v.reason),
      evidence: v.evidence === null ? null : reference(v.evidence),
      ...(v.blocking !== undefined
        ? {
            blocking:
              typeof v.blocking === "boolean"
                ? v.blocking
                : (() => {
                    throw Error("Invalid blocking flag");
                  })(),
          }
        : {}),
    };
  });
  // Coverage has the same metrics shape as its native normalized representation.
  let coverage: Snapshot["coverage"] = null;
  if (r.coverage !== null) {
    const c = object(r.coverage);
    const checkMetric = (m: unknown) => normalizeCoverage({ total: m }).global;
    coverage = {
      global: checkMetric(c.global),
      modules: Object.fromEntries(
        Object.entries(object(c.modules)).map(([k, v]) => [k, checkMetric(v)]),
      ),
    };
  }
  const manual_evidence = array(r.manual_evidence).map((value) => {
    const v = object(value);
    if (
      !["PASS", "FAIL", "DEFERRED", "NOT_APPLICABLE"].includes(string(v.status))
    )
      throw Error("Invalid manual status");
    return {
      tool: string(v.tool),
      status: v.status as Status,
      reference: string(v.reference),
      scope: string(v.scope),
    };
  });
  return {
    identity: who,
    checks,
    provenance,
    coverage,
    manual_evidence,
    gate_evaluation: {
      policy_version: string(gates.policy_version),
      policy_digest: gates.policy_digest as string,
      mode: "advisory",
      status: gates.status as Status,
      results,
    },
  };
}
export function candidate(s: Snapshot) {
  return {
    status: "CANDIDATE",
    snapshot_digest: digest(s),
    run_id: s.identity.run_id,
    commit_sha: s.identity.commit_sha,
    environment: s.identity.environment,
    created_at: s.identity.created_at,
    policy_version: s.gate_evaluation.policy_version,
    policy_digest: s.gate_evaluation.policy_digest,
  };
}
function numericMetrics(
  value: unknown,
  prefix = "",
  out: Record<string, number> = {},
) {
  if (typeof value === "number" && Number.isFinite(value)) out[prefix] = value;
  else if (value && typeof value === "object" && !Array.isArray(value))
    for (const [key, item] of Object.entries(value))
      numericMetrics(item, prefix ? prefix + "." + key : key, out);
  return out;
}
function metricDeltas(before: Snapshot, after: Snapshot) {
  const select = (s: Snapshot) =>
    numericMetrics({
      coverage: s.coverage,
      checks: Object.fromEntries(
        Object.entries(s.checks).map(([k, c]) => [k, c.metrics]),
      ),
    });
  const a = select(before),
    b = select(after);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .sort()
    .map((path) => ({
      path,
      before: a[path] ?? null,
      after: b[path] ?? null,
      delta:
        a[path] === undefined || b[path] === undefined
          ? null
          : b[path]! - a[path]!,
    }));
}
export function compare(
  current: Snapshot,
  input: { baseline: unknown; snapshot: Snapshot } | null,
) {
  if (!input) return { status: "NO_BASELINE", deltas: null, metric_deltas: [] };
  const b = object(input.baseline),
    s = validateSnapshot(input.snapshot);
  if (
    b.status !== "ACCEPTED" ||
    s.identity.dirty ||
    s.gate_evaluation.status !== "PASS" ||
    typeof b.accepted_by !== "string" ||
    !b.accepted_by.trim() ||
    typeof b.accepted_at !== "string" ||
    !Number.isFinite(Date.parse(b.accepted_at)) ||
    typeof b.decision_ref !== "string" ||
    !b.decision_ref.trim() ||
    b.snapshot_digest !== digest(s) ||
    b.commit_sha !== s.identity.commit_sha ||
    b.run_id !== s.identity.run_id ||
    b.environment !== current.identity.environment ||
    b.policy_digest !== current.gate_evaluation.policy_digest
  )
    throw Error("Baseline is not accepted or compatible");
  return compareRuns(current, s);
}
// Observed deltas share the canonical comparator, without accepting a baseline or evaluating gates.
export function compareRuns(current: Snapshot, s: Snapshot) {
  const totals = (s: Snapshot) =>
    Object.entries(s.checks)
      .filter(([k]) =>
        [
          "unit",
          "integration-node",
          "integration-adapters",
          "e2e",
          "e2e-prod",
          "sql",
        ].includes(k),
      )
      .reduce(
        (a, [, c]) => ({
          tests: a.tests + c.passed + c.failed + c.skipped,
          failures: a.failures + c.failed,
          skips: a.skips + c.skipped,
          retries: a.retries + c.retries,
          duration_ms: a.duration_ms + c.duration_ms,
        }),
        { tests: 0, failures: 0, skips: 0, retries: 0, duration_ms: 0 },
      );
  const a = totals(s),
    c = totals(current);
  const deltas = Object.fromEntries(
    Object.keys(a).map((k) => [
      k,
      c[k as keyof typeof c] - a[k as keyof typeof a],
    ]),
  );
  return {
    status: "COMPARED",
    deltas,
    metric_deltas: metricDeltas(s, current),
    coverage:
      current.coverage && s.coverage
        ? Object.fromEntries(
            Object.keys(current.coverage.global).map((k) => {
              const key = k as keyof typeof current.coverage.global;
              const now = current.coverage!.global[key].pct,
                was = s.coverage!.global[key].pct;
              return [k, now === null || was === null ? null : now - was];
            }),
          )
        : null,
    classification: "Observed delta only; no regression budget approved",
  };
}
