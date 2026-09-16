import { it, expect } from "vitest";
import { assertAdminTransition, type Membership } from "./membership";
it("protects the last effective administrator without inheriting supervisor permissions", () => {
  const member: Membership = {
    id: "m",
    organizationId: "o",
    role: "client_admin",
    active: true,
    profileActive: true,
  };
  expect(() => assertAdminTransition(member, "supervisor", true, 1)).toThrow();
  expect(() =>
    assertAdminTransition(member, "client_admin", false, 1),
  ).toThrow();
  expect(() => assertAdminTransition(member, "agent", true, 2)).not.toThrow();
});
