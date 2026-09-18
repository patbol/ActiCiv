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
    pendingInvitations: vi
      .fn()
      .mockResolvedValue([
        { id: "i", correlation_id: "1c29fca6-65fa-4d4b-a80c-8a124cf451ba" },
      ]),
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
    { id: "a", correlation_id: "1c29fca6-65fa-4d4b-a80c-8a124cf451ba" },
    { id: "b", correlation_id: "1c29fca6-65fa-4d4b-a80c-8a124cf451ba" },
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
it("observability acceptance resumes the stored invitation correlation without exposing identity fields", async () => {
  const p = port();
  vi.mocked(p.pendingInvitations).mockResolvedValue([
    { id: "i", correlation_id: "1c29fca6-65fa-4d4b-a80c-8a124cf451ba" },
  ]);
  const record = vi.fn();
  await acceptProfessionalInvitation("Private name", p, { record });
  expect(record).toHaveBeenCalledWith(
    "accept.succeeded",
    "1c29fca6-65fa-4d4b-a80c-8a124cf451ba",
    undefined,
  );
  expect(JSON.stringify(record.mock.calls)).not.toContain("Private name");
});
