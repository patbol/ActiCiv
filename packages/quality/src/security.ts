import { object, array, string, integer, check } from "./model.ts";
import { createHash } from "node:crypto";
export type Finding = {
  id: string;
  tool: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  status: "open";
  target: string;
  summary: string;
  accepted_risk: null | Record<string, unknown>;
  retest_status: "pending";
};
export function finding(
  tool: string,
  category: string,
  severity: Finding["severity"],
  target: string,
): Finding {
  return {
    id: createHash("sha256")
      .update([tool, category, target].join(":"))
      .digest("hex")
      .slice(0, 24),
    tool,
    category,
    severity,
    target,
    summary: category,
    status: "open",
    accepted_risk: null,
    retest_status: "pending",
  };
}
export function securityGate(
  raw: unknown[],
  risks: unknown[],
  at = new Date().toISOString(),
  scope = "prod",
) {
  const now = Date.parse(at);
  if (!Number.isFinite(now)) throw Error("Invalid evaluation date");
  const accepted = risks.map((raw) => {
    const r = object(raw);
    for (const k of [
      "finding_id",
      "owner",
      "reason",
      "approved_by",
      "accepted_at",
      "expiry",
      "mitigation",
      "scope",
    ])
      string(r[k]);
    if (
      !Number.isFinite(Date.parse(string(r.expiry))) ||
      !Number.isFinite(Date.parse(string(r.accepted_at))) ||
      r.retest_required !== true
    )
      throw Error("Invalid risk acceptance");
    return r;
  });
  const findings = raw.map((raw) => {
    const f = object(raw);
    for (const k of ["id", "tool", "category", "target", "summary"])
      string(f[k]);
    if (
      !["critical", "high", "medium", "low", "info"].includes(
        string(f.severity),
      ) ||
      ![
        "open",
        "OPEN",
        "ACCEPTED_RISK",
        "FIXED_PENDING_RETEST",
        "CLOSED",
        "FALSE_POSITIVE",
      ].includes(string(f.status)) ||
      !["pending", "passed", "failed"].includes(string(f.retest_status))
    )
      throw Error("Invalid finding");
    const lifecycle: Record<string, unknown> = {};
    if (f.status !== "open") {
      for (const k of ["first_observed", "reason", "mitigation"])
        lifecycle[k] = string(f[k]);
      lifecycle.owner =
        f.owner === null && f.status === "OPEN" ? null : string(f.owner);
      lifecycle.due =
        f.due === null && f.status === "OPEN" ? null : string(f.due);
      if (
        !Number.isFinite(Date.parse(string(f.first_observed))) ||
        Date.parse(string(f.first_observed)) > now ||
        (f.due !== null && !Number.isFinite(Date.parse(string(f.due))))
      )
        throw Error("Invalid finding dates");
      lifecycle.evidence = array(f.evidence).map(string);
      if (
        f.status === "FIXED_PENDING_RETEST" &&
        !array(lifecycle.evidence).length
      )
        throw Error("Fix evidence required");
      if (
        f.status === "CLOSED" &&
        (f.retest_status !== "passed" || !array(lifecycle.evidence).length)
      )
        throw Error("Closure requires evidenced retest");
      if (
        f.status === "FALSE_POSITIVE" &&
        (!array(lifecycle.evidence).length ||
          !string(f.qualified_by).trim() ||
          !string(f.reason).trim())
      )
        throw Error("Qualified false positive required");
      if (f.status === "FALSE_POSITIVE")
        lifecycle.qualified_by = string(f.qualified_by);
    }
    const risk = accepted.find(
      (r) =>
        r.finding_id === f.id &&
        r.scope === scope &&
        Date.parse(string(r.expiry)) > now &&
        Date.parse(string(r.accepted_at)) <= now,
    );
    return {
      id: string(f.id),
      tool: string(f.tool),
      category: string(f.category),
      severity: string(f.severity),
      status:
        f.status === "ACCEPTED_RISK" && (!risk || f.severity === "critical")
          ? "OPEN"
          : string(f.status),
      target: string(f.target),
      summary: string(f.summary),
      retest_status: string(f.retest_status),
      accepted_risk: f.severity === "critical" ? null : (risk ?? null),
      ...lifecycle,
    };
  });
  return {
    status: findings.some(
      (f) =>
        !["CLOSED", "FALSE_POSITIVE"].includes(f.status) &&
        (f.severity === "critical" ||
          (f.severity === "high" && !f.accepted_risk)),
    )
      ? "FAIL"
      : "PASS",
    findings,
  };
}
export function normalizeSemgrep(raw: unknown) {
  const r = object(raw);
  string(r.version);
  if (array(r.errors).length) throw Error("Incomplete SAST execution");
  const scanned = array(object(r.paths).scanned).map(string);
  if (!scanned.length) throw Error("SAST not executed");
  const findings = array(r.results).map((raw) => {
    const x = object(raw),
      extra = object(x.extra),
      severity = string(extra.severity);
    if (!["ERROR", "WARNING", "INFO"].includes(severity))
      throw Error("Unknown SAST severity");
    const target = string(x.path) + ":" + integer(object(x.start).line);
    return finding(
      "semgrep",
      string(x.check_id),
      severity === "ERROR"
        ? "high"
        : severity === "WARNING"
          ? "medium"
          : "info",
      target,
    );
  });
  return {
    complete: true,
    tool: "semgrep",
    version: r.version,
    scanned_files: scanned.length,
    findings,
  };
}
export function normalizeZap(raw: unknown) {
  const r = object(raw);
  string(r["@version"]);
  const sites = array(r.site);
  if (!sites.length) throw Error("DAST not executed");
  const findings = sites.flatMap((raw) => {
    const site = object(raw);
    const u = new URL(string(site["@name"]));
    if (
      !["127.0.0.1", "host.docker.internal", "localhost"].includes(u.hostname)
    )
      throw Error("Unapproved DAST target");
    return array(site.alerts).map((raw) => {
      const a = object(raw),
        n = Number(a.riskcode);
      if (!Number.isInteger(n) || n < 0 || n > 3)
        throw Error("Invalid DAST severity");
      // No URL query, request/response, evidence, description or tokens exported.
      return finding(
        "zap",
        "zap-" + string(a.alertRef ?? a.pluginid),
        (["info", "low", "medium", "high"] as const)[n]!,
        u.origin,
      );
    });
  });
  return {
    complete: true,
    tool: "zap",
    version: r["@version"],
    scope: "local-demo-passive-unauthenticated",
    findings,
  };
}
export function assuranceCheck(raw: unknown, source: string) {
  const r = object(raw);
  if (
    r.complete !== true ||
    !["semgrep", "zap", "artifact", "performance"].includes(string(r.tool))
  )
    throw Error("Incomplete assurance report");
  const expected: Record<string, string> = {
    sast: "semgrep",
    dast: "zap",
    artifact: "artifact",
    performance: "performance",
  };
  if (expected[source] !== r.tool) throw Error("Assurance producer mismatch");
  if (
    r.tool === "semgrep" &&
    (!string(r.version) ||
      integer(r.scanned_files) < 1 ||
      integer(r.source_files) !== r.scanned_files)
  )
    throw Error("Missing SAST execution");
  if (r.tool === "artifact" && array(r.artifacts).length !== 2)
    throw Error("Missing artifacts");
  if (r.tool === "performance" && Object.keys(object(r.apps)).length !== 2)
    throw Error("Missing performance builds");
  if (r.tool === "artifact") {
    const artifacts = array(r.artifacts).map(object);
    if (new Set(artifacts.map((a) => string(a.app))).size !== 2)
      throw Error("Duplicate build");
    for (const a of artifacts) {
      string(a.build_id);
      if (
        !/^[a-f0-9]{64}$/.test(string(a.artifact_digest)) ||
        integer(a.files) < 1
      )
        throw Error("Invalid artifact identity");
    }
    if (
      artifacts.flatMap((a) => array(a.findings)).length !==
      array(r.findings).length
    )
      throw Error("Hidden artifact findings");
  }
  if (r.tool === "performance")
    for (const app of ["citizen", "pro"]) {
      const a = object(object(r.apps)[app]);
      string(a.build_id);
      for (const key of [
        "js_bytes",
        "gzip_bytes",
        "chunk_count",
        "largest_chunk_bytes",
        "static_asset_bytes",
        "css_bytes",
      ])
        integer(a[key]);
      if (a.target !== "prod" || a.chunk_count === 0)
        throw Error("Invalid performance target");
    }
  if (r.tool === "zap") string(r.version);
  const findings = array(r.findings),
    risks = array(r.accepted_risks ?? []);
  const gate = securityGate(
    findings,
    risks,
    string(r.evaluated_at),
    source === "dast" ? "local-demo" : "prod",
  );
  return check({
    status: gate.status === "PASS" ? "PASS" : "FAIL",
    metrics: { ...r, findings: gate.findings },
    reason:
      r.tool === "performance"
        ? "Measured; budgets advisory only"
        : "Executed assurance control; high/critical reviewed",
  });
}
