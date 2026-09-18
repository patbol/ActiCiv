import { array, object, string } from "./model.ts";
import type { Budget, Check, Gate, Reference } from "./model.ts";
export function exactKeys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    throw Error("Unknown configuration field");
}
export function approval(raw: unknown) {
  const r = object(raw);
  exactKeys(r, ["approved_by", "approved_at", "decision_ref"]);
  const approved_at = string(r.approved_at);
  if (
    !Number.isFinite(Date.parse(approved_at)) ||
    !string(r.approved_by).trim() ||
    !string(r.decision_ref).trim()
  )
    throw Error("Invalid approval date");
  return {
    approved_by: string(r.approved_by),
    approved_at,
    decision_ref: string(r.decision_ref),
  };
}
export function budgets(raw: unknown, ids: Set<string>): Budget[] {
  return array(raw).map((value) => {
    const b = object(value);
    exactKeys(b, [
      "id",
      "source",
      "metric",
      "operator",
      "value",
      "mode",
      "approval",
    ]);
    const id = string(b.id),
      metric = string(b.metric);
    if (
      ids.has(id) ||
      !/^[\w-]+(?:\.[\w-]+)*$/.test(metric) ||
      metric
        .split(".")
        .some((k) => ["__proto__", "prototype", "constructor"].includes(k)) ||
      !["min", "max"].includes(string(b.operator)) ||
      !["advisory", "blocking"].includes(string(b.mode)) ||
      typeof b.value !== "number" ||
      !Number.isFinite(b.value)
    )
      throw Error("Invalid numeric budget");
    ids.add(id);
    return {
      id,
      source: string(b.source),
      metric,
      operator: b.operator as "min" | "max",
      value: b.value,
      mode: b.mode as "advisory" | "blocking",
      ...(b.approval !== undefined || b.mode === "blocking"
        ? { approval: approval(b.approval) }
        : {}),
    };
  });
}
export function evaluateBudget(
  b: Budget,
  checks: Record<string, Check>,
  provenance: Record<string, Reference>,
): Gate {
  let measured: unknown = checks[b.source]?.metrics;
  for (const key of b.metric.split("."))
    measured =
      measured && typeof measured === "object" && Object.hasOwn(measured, key)
        ? (measured as Record<string, unknown>)[key]
        : undefined;
  const known = typeof measured === "number" && Number.isFinite(measured);
  const passed =
    typeof measured === "number" &&
    known &&
    checks[b.source]?.status === "PASS" &&
    (b.operator === "min" ? measured >= b.value : measured <= b.value);
  return {
    rule_id: b.id,
    status: passed ? "PASS" : "FAIL",
    blocking: b.mode === "blocking",
    reason: !known
      ? "Budget measurement missing"
      : `${b.mode} budget ${b.operator} ${b.value}; observed ${measured}`,
    evidence: provenance[b.source] ?? null,
  };
}
