import { array, object, string } from "./model.ts";
import {
  compare,
  digest,
  evaluate,
  policy,
  validateSnapshot,
} from "./snapshot.ts";
// Pure eligibility assessment; the caller is the trusted CLI/operator, never a browser.
// No deployment, acceptance, receipt, or external readiness proof is manufactured here.
export function assessPromotion(raw: unknown) {
  const r = object(raw),
    s = validateSnapshot(r.snapshot),
    p = policy(r.policy);
  const at = Date.parse(string(r.at));
  if (!Number.isFinite(at)) throw Error("Invalid assessment date");
  const result = (
    state: "candidate" | "validated" | "eligible" | "promoted",
    reasons: string[],
  ) => ({
    state,
    commit_sha: s.identity.commit_sha,
    snapshot_digest: digest(s),
    policy_digest: s.gate_evaluation.policy_digest,
    source_environment: r.source_environment,
    target_environment: r.target_environment,
    at: r.at,
    reasons,
  });
  const current = evaluate(s, p);
  if (
    s.identity.dirty ||
    current.status !== "PASS" ||
    digest(current) !== digest(s.gate_evaluation)
  )
    return result("candidate", [
      "Clean validated evidence and unchanged policy required",
    ]);
  const reasons: string[] = [];
  if (
    !["dev", "demo"].includes(String(r.source_environment)) ||
    !["demo", "prod"].includes(String(r.target_environment)) ||
    r.source_environment === r.target_environment ||
    (r.target_environment === "prod" && r.source_environment !== "demo")
  )
    reasons.push("Invalid promotion environments");
  try {
    compare(s, { baseline: r.baseline, snapshot: s });
    const b = object(r.baseline);
    if (Date.parse(string(b.accepted_at)) > at)
      throw Error("Future baseline decision");
  } catch {
    reasons.push("This candidate requires explicit baseline acceptance");
  }
  try {
    const a = object(r.policy_approval);
    if (
      a.policy_digest !== current.policy_digest ||
      !string(a.approved_by).trim() ||
      !string(a.decision_ref).trim() ||
      !Number.isFinite(Date.parse(string(a.approved_at))) ||
      Date.parse(string(a.approved_at)) > at
    )
      throw Error("Invalid approval");
  } catch {
    reasons.push("Exact policy requires explicit approval");
  }
  const artifacts = object(r.artifacts),
    measured: Record<string, string> = {};
  for (const item of array(s.checks.artifact?.metrics.artifacts ?? [])) {
    const a = object(item);
    measured[string(a.app)] = string(a.artifact_digest);
  }
  if (
    s.checks.artifact?.status !== "PASS" ||
    !Object.keys(measured).length ||
    Object.keys(artifacts).length !== Object.keys(measured).length ||
    Object.entries(measured).some(
      ([app, hash]) => !/^[a-f0-9]{64}$/.test(hash) || artifacts[app] !== hash,
    )
  )
    reasons.push("Exact validated artifacts required");
  for (const k of p.promotion?.required_checks ?? [])
    if (s.checks[k]?.status !== "PASS" || !s.provenance[k])
      reasons.push("Required readiness check: " + k);
  for (const k of p.promotion?.required_manual ?? [])
    if (
      !s.manual_evidence.some(
        (m) => m.tool === k && m.status === "PASS" && m.reference.trim(),
      )
    )
      reasons.push("Required manual evidence: " + k);
  if (reasons.length) return result("validated", reasons);
  if (r.receipt !== undefined) {
    const receipt = object(r.receipt);
    if (
      receipt.commit_sha === s.identity.commit_sha &&
      receipt.snapshot_digest === digest(s) &&
      receipt.policy_digest === current.policy_digest &&
      receipt.source_environment === r.source_environment &&
      receipt.target_environment === r.target_environment &&
      digest(receipt.artifacts) === digest(artifacts) &&
      typeof receipt.actor === "string" &&
      receipt.actor.trim() &&
      typeof receipt.evidence_ref === "string" &&
      receipt.evidence_ref.trim() &&
      typeof receipt.at === "string" &&
      Number.isFinite(Date.parse(receipt.at)) &&
      Date.parse(receipt.at) <= at &&
      Date.parse(receipt.at) >= Date.parse(s.identity.created_at)
    )
      return { ...result("promoted", []), receipt };
    return result("eligible", [
      "External receipt missing or inconsistent; no promotion attested",
    ]);
  }
  return result("eligible", []);
}
