export type TargetKind = "acknowledgment" | "intervention" | "resolution";
export type Target = {
  kind: TargetKind;
  durationSeconds: number;
  countingMode: "elapsed" | "business_hours";
  pauseReasons: readonly string[];
};
export function validateTargets(targets: readonly Target[]) {
  const kinds = ["acknowledgment", "intervention", "resolution"];
  if (targets.length !== 3 || new Set(targets.map((t) => t.kind)).size !== 3)
    throw new Error("Trois cibles SLA distinctes requises");
  for (const target of targets) {
    if (
      !kinds.includes(target.kind) ||
      !Number.isSafeInteger(target.durationSeconds) ||
      target.durationSeconds <= 0 ||
      target.durationSeconds > 2147483647 ||
      !["elapsed", "business_hours"].includes(target.countingMode) ||
      new Set(target.pauseReasons).size !== target.pauseReasons.length
    )
      throw new Error("Cible SLA invalide");
  }
}
export function pauses(target: Target, reason: string | null) {
  return reason !== null && target.pauseReasons.includes(reason);
}
export type Scope = { serviceId: string | null; categoryId: string | null };
// Documented order for future use. No report resolver in Phase 2.
export const scopeOrder = [
  "organization",
  "service",
  "category",
  "service_category",
] as const;
