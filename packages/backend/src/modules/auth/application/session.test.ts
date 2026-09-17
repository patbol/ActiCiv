import { expect, it, vi } from "vitest";
import {
  acceptProfessionalInvitation,
  defineProfessionalPassword,
  recoverProfessional,
  signInProfessional,
  type ProfessionalSession,
} from "./session";
function port(): ProfessionalSession {
  return {
    identity: vi.fn().mockResolvedValue("u"),
    signIn: vi.fn(),
    recover: vi.fn(),
    changePassword: vi.fn(),
    activeProfessional: vi.fn().mockResolvedValue(false),
    pendingInvitations: vi.fn().mockResolvedValue([{ id: "i" }]),
    acceptInvitation: vi.fn(),
    signOut: vi.fn(),
  };
}
it("requires identity and exactly one invitation before atomic acceptance", async () => {
  const p = port();
  vi.mocked(p.identity).mockResolvedValueOnce(null);
  await expect(acceptProfessionalInvitation("Alice", p)).rejects.toThrow();
  expect(p.pendingInvitations).not.toHaveBeenCalled();
  vi.mocked(p.pendingInvitations).mockResolvedValueOnce([
    { id: "a" },
    { id: "b" },
  ]);
  await expect(acceptProfessionalInvitation("Alice", p)).rejects.toThrow();
  expect(p.acceptInvitation).not.toHaveBeenCalled();
  await acceptProfessionalInvitation(" Alice ", p);
  expect(p.acceptInvitation).toHaveBeenCalledWith("i", "Alice");
});
it("returns active professionals to context after recovery and invitees to acceptance", async () => {
  const p = port();
  await expect(defineProfessionalPassword("short", p)).rejects.toThrow();
  expect(p.changePassword).not.toHaveBeenCalled();
  expect(await defineProfessionalPassword("long-password-123", p)).toBe(
    "/auth/accept",
  );
  vi.mocked(p.activeProfessional).mockResolvedValue(true);
  expect(await defineProfessionalPassword("long-password-456", p)).toBe(
    "/espace",
  );
});
it("validates Auth input before calling its provider", async () => {
  const p = port();
  await expect(recoverProfessional("invalid", p)).rejects.toThrow();
  expect(p.recover).not.toHaveBeenCalled();
  await signInProfessional(" A@EXAMPLE.TEST ", "secret", p);
  expect(p.signIn).toHaveBeenCalledWith("a@example.test", "secret");
});
