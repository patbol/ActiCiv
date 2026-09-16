import { it, expect, vi } from "vitest";
import { inviteProfessional, type Invitations } from "./invite";
import type { Context } from "../../authorization/domain/policy";
import { safeDestination } from "../domain/redirect";
const context: Context = {
  userId: "u",
  profileActive: true,
  organizationId: "o",
  organizationActive: true,
  membershipActive: true,
  role: "client_admin",
  services: [],
};
it("does not reach privileged provider when authorization/reservation fails", async () => {
  const provider = { invite: vi.fn() };
  const repository: Invitations = {
    reserve: vi.fn().mockRejectedValue(new Error("denied")),
    bind: vi.fn(),
  };
  await expect(
    inviteProfessional(
      null,
      "o",
      "x@example.test",
      "agent",
      [],
      "key",
      repository,
      provider,
    ),
  ).rejects.toThrow();
  await expect(
    inviteProfessional(
      context,
      "o",
      "x@example.test",
      "agent",
      [],
      "key",
      repository,
      provider,
    ),
  ).rejects.toThrow();
  expect(provider.invite).not.toHaveBeenCalled();
});
it("keeps partial failures recoverable and never grants membership", async () => {
  const repository: Invitations = {
    reserve: vi.fn().mockResolvedValue({
      id: "i",
      email: "x@example.test",
      state: "pending",
      expires_at: "2099-01-01Z",
    }),
    bind: vi
      .fn()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce(undefined),
  };
  const provider = { invite: vi.fn().mockResolvedValue("auth-user") };
  await expect(
    inviteProfessional(
      context,
      "o",
      "x@example.test",
      "agent",
      [],
      "key",
      repository,
      provider,
    ),
  ).rejects.toThrow("temporary");
  await expect(
    inviteProfessional(
      context,
      "o",
      "x@example.test",
      "agent",
      [],
      "key",
      repository,
      provider,
    ),
  ).resolves.toBe("i");
  expect(repository.bind).toHaveBeenCalledWith("i", "auth-user");
});
it("uses an exact allowlist for redirect destinations", () => {
  for (const value of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/espace?next=https://evil.test",
    "/auth/callback",
  ])
    expect(safeDestination(value)).toBe("/espace");
  expect(safeDestination("/auth/password")).toBe("/auth/password");
});
