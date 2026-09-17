export type TerritoryInput = {
  code: string;
  name: string;
  kind: string;
  geometry: Record<string, unknown>;
  parentId: string | null;
};
export type ContractInput = {
  organizationId: string;
  reference: string;
  status: "draft" | "active" | "expired" | "cancelled";
  from: string;
  until: string | null;
  plan: string;
};
export type ScopeInput = {
  contractId: string;
  territoryId: string;
  categories: string[];
  services: string[];
};
export function validateContract(value: ContractInput) {
  if (
    !value.organizationId ||
    !value.reference.trim() ||
    !value.plan.trim() ||
    !Number.isFinite(Date.parse(value.from)) ||
    (value.until !== null &&
      (!Number.isFinite(Date.parse(value.until)) ||
        Date.parse(value.until) <= Date.parse(value.from)))
  )
    throw new Error("Contrat invalide");
}
export function validateTerritory(value: TerritoryInput) {
  if (
    !value.code.trim() ||
    !value.name.trim() ||
    !value.kind.trim() ||
    !["Polygon", "MultiPolygon"].includes(String(value.geometry.type))
  )
    throw new Error("Territoire invalide");
}
