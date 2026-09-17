import {
  requirePlatform,
  type PlatformContext,
} from "../../authorization/domain/platform";
import {
  validateContract,
  validateTerritory,
  type ContractInput,
  type TerritoryInput,
  type ScopeInput,
} from "../domain/administration";
export interface CoverageAdministration {
  saveTerritory(value: TerritoryInput): Promise<string>;
  saveContract(value: ContractInput): Promise<string>;
  setScope(value: ScopeInput): Promise<string>;
}
export async function saveTerritory(
  context: PlatformContext,
  value: TerritoryInput,
  port: CoverageAdministration,
) {
  requirePlatform(context, "territories.manage");
  validateTerritory(value);
  return port.saveTerritory(value);
}
export async function saveContract(
  context: PlatformContext,
  value: ContractInput,
  port: CoverageAdministration,
) {
  requirePlatform(context, "contracts.manage");
  validateContract(value);
  return port.saveContract(value);
}
export async function setContractScope(
  context: PlatformContext,
  value: ScopeInput,
  port: CoverageAdministration,
) {
  requirePlatform(context, "contracts.manage");
  if (
    !value.contractId ||
    !value.territoryId ||
    new Set(value.categories).size !== value.categories.length ||
    new Set(value.services).size !== value.services.length
  )
    throw new Error("Périmètre invalide");
  return port.setScope(value);
}
