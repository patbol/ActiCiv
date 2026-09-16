import { describe, it, expect } from "vitest";
import { parseServerEnv } from "./env";
describe("server configuration", () => {
  it("rejects absent configuration without leaking submitted values", () => {
    expect(() =>
      parseServerEnv({
        SUPABASE_URL: "private-invalid-value",
        SUPABASE_PUBLISHABLE_KEY: "test-key",
      }),
    ).toThrow("SUPABASE_URL");
    try {
      parseServerEnv({ SUPABASE_URL: "private-invalid-value" });
    } catch (error) {
      expect(String(error)).not.toContain("private-invalid-value");
    }
  });
  it("requires a nonempty key", () => {
    expect(() =>
      parseServerEnv({
        SUPABASE_URL: "http://127.0.0.1:54321",
        SUPABASE_PUBLISHABLE_KEY: "",
      }),
    ).toThrow();
  });
  it("accepts local configuration and discards undeclared secrets", () => {
    const config = parseServerEnv({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_PUBLISHABLE_KEY: "local-test-key",
      SERVICE_ROLE_KEY: "must-not-propagate",
    });
    expect(config).toEqual({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_PUBLISHABLE_KEY: "local-test-key",
    });
  });
});
