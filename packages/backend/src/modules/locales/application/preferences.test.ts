import { expect, it, vi } from "vitest";
import { setOwnLocale, setOrganizationLocale } from "./preferences";
const context = {
  userId: "u",
  organizationId: "o",
  profileActive: true,
  membershipActive: true,
  organizationActive: true,
  role: "agent" as const,
  services: [],
};
const port = { setOwn: vi.fn(), setOrganization: vi.fn() };
it("self preference needs an active professional and supported locale, has no target user argument", async () => {
  for (const input of [
    null,
    { ...context, profileActive: false },
    { ...context, membershipActive: false },
    { ...context, organizationActive: false },
  ])
    await expect(setOwnLocale(input, "en-GB", port)).rejects.toThrow();
  await expect(setOwnLocale(context, "xx", port)).rejects.toThrow();
  expect(port.setOwn).not.toHaveBeenCalled();
  await setOwnLocale(context, "en-GB", port);
  expect(port.setOwn).toHaveBeenLastCalledWith("en-GB");
  await setOwnLocale(context, null, port);
  expect(port.setOwn).toHaveBeenLastCalledWith(null);
});
it("only own organization administrator can change defaults", async () => {
  for (const role of ["agent", "supervisor"] as const)
    await expect(
      setOrganizationLocale({ ...context, role }, "o", "en-GB", port),
    ).rejects.toThrow();
  const admin = { ...context, role: "client_admin" as const };
  await expect(
    setOrganizationLocale(admin, "other", "en-GB", port),
  ).rejects.toThrow();
  await expect(
    setOrganizationLocale(admin, "o", "invalid", port),
  ).rejects.toThrow();
  expect(port.setOrganization).not.toHaveBeenCalled();
  await setOrganizationLocale(admin, "o", "fr-FR", port);
  expect(port.setOrganization).toHaveBeenCalledWith("o", "fr-FR");
});
