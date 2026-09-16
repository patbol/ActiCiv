import { describe, it, expect } from "vitest";
import { permits, type Context } from "./policy";
const base: Context = {
  userId: "u",
  profileActive: true,
  organizationId: "a",
  organizationActive: true,
  membershipActive: true,
  role: "agent",
  services: ["s"],
};
describe("professional authorization", () => {
  it("requires every active link and actual ownership", () => {
    expect(
      permits(base, "service.read", { organizationId: "a", serviceId: "s" }),
    ).toBe(true);
    for (const context of [
      null,
      { ...base, profileActive: false },
      { ...base, membershipActive: false },
      { ...base, organizationActive: false },
    ])
      expect(
        permits(context, "service.read", {
          organizationId: "a",
          serviceId: "s",
        }),
      ).toBe(false);
    expect(
      permits(base, "service.read", { organizationId: "b", serviceId: "s" }),
    ).toBe(false);
    expect(
      permits(base, "service.read", {
        organizationId: "a",
        serviceId: "other",
      }),
    ).toBe(false);
  });
  it("keeps agent, supervision and administration separate", () => {
    const resource = { organizationId: "a", serviceId: "s" };
    expect(permits(base, "members.read", resource)).toBe(false);
    expect(
      permits({ ...base, role: "supervisor" }, "members.read", resource),
    ).toBe(true);
    expect(
      permits({ ...base, role: "supervisor" }, "configuration.write", resource),
    ).toBe(false);
    expect(
      permits({ ...base, role: "client_admin" }, "report.claim", resource),
    ).toBe(false);
    expect(
      permits(
        { ...base, role: "client_admin" },
        "configuration.write",
        resource,
      ),
    ).toBe(true);
    expect(
      permits({ ...base, role: "client_admin" }, "unknown", resource),
    ).toBe(false);
  });
});
