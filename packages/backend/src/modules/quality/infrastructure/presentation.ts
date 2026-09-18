import { compareRuns } from "@acticiv/quality/snapshot";
import type { Snapshot } from "@acticiv/quality/model";
import type { Run } from "./files";
// Only trusted, normalized evidence is projected. Never return raw native reports.
export function safeText(value: unknown): string {
  if (typeof value !== "string") return "—";
  if (
    /(?:https?:|file:|\/Users\/|\/home\/|\/private\/|Bearer\s|password\s*[:=]|token\s*[:=]|secret\s*[:=]|eyJ[\w-]+\.|[\w.+-]+@[\w.-]+|(?:ghp_|sk_live_|sb_secret_)[\w-]+)/i.test(
      value,
    )
  )
    return "[redacted]";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 600);
}
function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}
function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function number(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
const metricKeys = new Set([
  "kb",
  "adrs",
  "skills",
  "checked_markdown",
  "errors",
  "analyses",
  "violations",
  "incomplete",
  "info",
  "low",
  "moderate",
  "medium",
  "high",
  "critical",
  "scanned_files",
  "source_files",
  "files",
  "js_bytes",
  "gzip_bytes",
  "chunk_count",
  "largest_chunk_bytes",
  "static_asset_bytes",
  "css_bytes",
  "requests",
  "warmups",
  "median_ms",
  "p95_ms",
  "max_ms",
  "client_source_files",
]);
function measurements(
  value: unknown,
  prefix = "",
  out: { name: string; value: number }[] = [],
  depth = 0,
) {
  if (depth > 5) return out;
  for (const [key, v] of Object.entries(obj(value))) {
    const label = prefix ? prefix + " / " + safeText(key) : safeText(key);
    if (metricKeys.has(key) && number(v) !== null)
      out.push({ name: label, value: number(v)! });
    else if (
      [
        "apps",
        "citizen",
        "pro",
        "latency",
        "routes",
        "/",
        "/auth/login",
        "/api/health",
        "vulnerabilities",
      ].includes(key)
    )
      measurements(v, label, out, depth + 1);
  }
  return out;
}
export function present(run: Run) {
  if (run.state !== "valid")
    return { state: "invalid" as const, id: safeText(run.id) };
  const s = run.snapshot;
  const checks = Object.entries(s.checks).map(([id, c]) => ({
    id: safeText(id),
    status: c.status,
    reason: safeText(c.reason),
    passed: c.passed,
    failed: c.failed,
    skipped: c.skipped,
    retries: c.retries,
    flaky: c.flaky,
    suites: c.suites,
    duration_ms: c.duration_ms,
    metrics: measurements(c.metrics),
    tests: c.tests.map((t) => ({
      ...t,
      id: safeText(t.id),
      final_status: safeText(t.final_status),
      tags: t.tags.map(safeText),
    })),
  }));
  const findings = Object.entries(s.checks).flatMap(([source, c]) =>
    arr(c.metrics.findings).map((raw) => {
      const f = obj(raw),
        risk = obj(f.accepted_risk);
      return {
        source: safeText(source),
        tool: safeText(f.tool),
        category: safeText(f.category),
        severity: safeText(f.severity),
        status: safeText(f.status),
        summary: safeText(f.category),
        owner: safeText(risk.owner),
        expiry: safeText(risk.expiry),
        accepted: Object.keys(risk).length > 0,
        retest: safeText(f.retest_status),
      };
    }),
  );
  return {
    state: "valid" as const,
    id: s.identity.run_id,
    sha: s.identity.commit_sha,
    branch: safeText(s.identity.branch),
    environment: s.identity.environment,
    created_at: s.identity.created_at,
    dirty: s.identity.dirty,
    policy: safeText(s.gate_evaluation.policy_version),
    verdict: s.gate_evaluation.status,
    digest: run.digest,
    source_digest: s.identity.source_digest,
    policy_digest: s.gate_evaluation.policy_digest,
    gates: s.gate_evaluation.results.map((g) => ({
      id: safeText(g.rule_id),
      status: g.status,
      reason: safeText(g.reason),
      evidence: g.evidence?.sha256 ?? null,
    })),
    checks,
    coverage: s.coverage
      ? {
          global: s.coverage.global,
          modules: Object.fromEntries(
            Object.entries(s.coverage.modules).map(([k, v]) => [
              safeText(k),
              v,
            ]),
          ),
        }
      : null,
    findings,
    manual: s.manual_evidence.map((e) => ({
      tool: safeText(e.tool),
      status: e.status,
      scope: safeText(e.scope),
      reference: safeText(e.reference),
    })),
    baseline: run.baseline.status,
    artifact: run.artifact,
    artifacts: arr(s.checks.artifact?.metrics.artifacts).map((v) => {
      const a = obj(v);
      return {
        app: safeText(a.app),
        digest:
          typeof a.artifact_digest === "string" &&
          /^[a-f0-9]{64}$/.test(a.artifact_digest)
            ? a.artifact_digest
            : null,
        files: number(a.files),
        findings: arr(a.findings).length,
      };
    }),
    provenance: Object.entries(s.provenance).map(([id, r]) => ({
      id: safeText(id),
      digest: r.sha256,
    })),
  };
}
export type RunView = ReturnType<typeof present>;
export type ValidView = Extract<RunView, { state: "valid" }>;
export type Comparison = {
  state: "NONE" | "INCOMPATIBLE" | "COMPARED";
  base?: string;
  coverage?: Record<string, number | null>;
  tests?: number | null;
  performance?: { name: string; delta: number }[];
  moduleCoverage?: { name: string; delta: number | null }[];
};
// Use the canonical comparator. This layer selects safe display fields only.
export function observedComparison(
  current: Snapshot,
  baseline: Snapshot,
): Comparison {
  if (
    current.identity.environment !== baseline.identity.environment ||
    current.gate_evaluation.policy_digest !==
      baseline.gate_evaluation.policy_digest
  )
    return { state: "INCOMPATIBLE" };
  const delta = compareRuns(current, baseline);
  const allSuites = [
    "unit",
    "sql",
    "integration-node",
    "integration-adapters",
    "e2e",
    "e2e-prod",
  ].every((k) => current.checks[k] && baseline.checks[k]);
  return {
    state: "COMPARED",
    base: baseline.identity.run_id,
    coverage: delta.coverage ?? {},
    tests: allSuites ? (delta.deltas.tests ?? null) : null,
    moduleCoverage: delta.metric_deltas
      .filter(
        (m) =>
          m.path.startsWith("coverage.modules.") && m.path.endsWith(".pct"),
      )
      .map((m) => ({
        name: safeText(m.path.slice("coverage.modules.".length, -4)),
        delta: m.delta,
      })),
    performance: delta.metric_deltas
      .filter(
        (m) =>
          m.path.startsWith("checks.performance.") &&
          metricKeys.has(m.path.split(".").at(-1)!) &&
          m.delta !== null,
      )
      .map((m) => ({ name: safeText(m.path), delta: m.delta! })),
  };
}
export function historyDeltas(runs: Run[]) {
  return Object.fromEntries(
    runs.flatMap((run, i) => {
      if (run.state !== "valid") return [];
      const before = runs
        .slice(i + 1)
        .find(
          (b) =>
            b.state === "valid" &&
            b.snapshot.identity.environment ===
              run.snapshot.identity.environment &&
            b.snapshot.gate_evaluation.policy_digest ===
              run.snapshot.gate_evaluation.policy_digest,
        );
      if (before?.state !== "valid") return [];
      const delta = observedComparison(run.snapshot, before.snapshot);
      return [
        [
          run.id,
          {
            base: before.id,
            tests: delta.tests ?? null,
            lines: delta.coverage?.lines ?? null,
          },
        ],
      ];
    }),
  );
}
