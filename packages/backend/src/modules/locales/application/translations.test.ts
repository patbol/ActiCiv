import { expect, it, vi } from "vitest";
import { saveHoldTranslation, saveCatalogTranslation } from "./translations";
const context = {
  userId: "u",
  organizationId: "own",
  profileActive: true,
  membershipActive: true,
  organizationActive: true,
  role: "client_admin" as const,
  services: [],
};
it("hold translation verifies actual ownership before writing", async () => {
  const port = {
    holdOrganization: vi.fn().mockResolvedValue("other"),
    save: vi.fn(),
  };
  await expect(
    saveHoldTranslation(context, "h", "en-GB", "Label", port),
  ).rejects.toThrow();
  expect(port.save).not.toHaveBeenCalled();
  port.holdOrganization.mockResolvedValue("own");
  await saveHoldTranslation(context, "h", "fr-FR", "Libellé", port);
  expect(port.save).toHaveBeenCalledWith(
    "hold_reason",
    "h",
    "fr-FR",
    "Libellé",
  );
});
it("global translation requires catalog capability and valid content", async () => {
  const port = { holdOrganization: vi.fn(), save: vi.fn() };
  await expect(
    saveCatalogTranslation(
      { userId: "u", capabilities: [] },
      "category",
      "c",
      "en-GB",
      "Label",
      port,
    ),
  ).rejects.toThrow();
  await expect(
    saveCatalogTranslation(
      { userId: "u", capabilities: ["catalog.manage"] },
      "category",
      "c",
      "xx",
      "Label",
      port,
    ),
  ).rejects.toThrow();
  await expect(
    saveCatalogTranslation(
      { userId: "u", capabilities: ["catalog.manage"] },
      "category",
      "c",
      "en-GB",
      " ",
      port,
    ),
  ).rejects.toThrow();
  expect(port.save).not.toHaveBeenCalled();
  await saveCatalogTranslation(
    { userId: "u", capabilities: ["catalog.manage"] },
    "vertical",
    "v",
    "en-GB",
    "Accessibility",
    port,
  );
  expect(port.save).toHaveBeenCalled();
});
