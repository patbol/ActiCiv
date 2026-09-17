import { expect, it, vi } from "vitest";
import {
  saveContract,
  saveTerritory,
  setContractScope,
  type CoverageAdministration,
} from "./administration";
import {
  recoverOrganization,
  saveOrganization,
} from "../../organizations/application/platform";
const context = { userId: "u", capabilities: ["contracts.manage"] };
it("denies cross-capability and malformed contract commands before adapters", async () => {
  const port: CoverageAdministration = {
    saveContract: vi.fn().mockResolvedValue("c"),
    saveTerritory: vi.fn(),
    setScope: vi.fn(),
  };
  const value = {
    organizationId: "o",
    reference: "r",
    status: "active" as const,
    from: "2026-01-01Z",
    until: null,
    plan: "mvp",
  };
  await expect(saveContract(null, value, port)).rejects.toThrow();
  await expect(
    saveContract(context, { ...value, until: "2025-01-01Z" }, port),
  ).rejects.toThrow();
  expect(port.saveContract).not.toHaveBeenCalled();
  expect(await saveContract(context, value, port)).toBe("c");
  await expect(
    saveTerritory(
      context,
      {
        code: "t",
        name: "t",
        kind: "site",
        geometry: { type: "Polygon" },
        parentId: null,
      },
      port,
    ),
  ).rejects.toThrow();
  await expect(
    setContractScope(
      context,
      {
        contractId: "c",
        territoryId: "t",
        categories: ["x", "x"],
        services: [],
      },
      port,
    ),
  ).rejects.toThrow();
  expect(port.saveTerritory).not.toHaveBeenCalled();
  expect(port.setScope).not.toHaveBeenCalled();
});
it("separates organization administration and recovery capabilities", async () => {
  const port = { save: vi.fn(), recover: vi.fn() };
  await expect(
    saveOrganization(
      context,
      { code: "o", name: "Org", status: "active" },
      port,
    ),
  ).rejects.toThrow();
  await expect(
    recoverOrganization(
      { userId: "u", capabilities: ["organizations.manage"] },
      { organizationId: "o", userId: "v", name: "V" },
      port,
    ),
  ).rejects.toThrow();
  expect(port.recover).not.toHaveBeenCalled();
  await recoverOrganization(
    { userId: "u", capabilities: ["organizations.recover"] },
    { organizationId: "o", userId: "v", name: "V" },
    port,
  );
  expect(port.recover).toHaveBeenCalledOnce();
});
