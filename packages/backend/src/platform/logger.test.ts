import { it, expect } from "vitest";
import { serializeLog } from "./logger";
const base = {
  code: "CONFIGURATION_FAILED" as const,
  level: "error" as const,
  environment: "test" as const,
  timestamp: "2026-09-18T00:00:00Z",
  context: { correlationId: "1c29fca6-65fa-4d4b-a80c-8a124cf451ba" },
};
it("does not serialize extra payloads, error objects, URLs or personal values", () => {
  const runtimeRecord = {
    ...base,
    metadata: {
      status: 500,
      email: "private@example.test",
      token: "private-tracking",
      url: "/tracking/private",
      error: new Error("private-message"),
    },
  };
  const record = JSON.parse(serializeLog(runtimeRecord));
  expect(record.status).toBe(500);
  expect(record.error).toEqual({ kind: "Error" });
  expect(JSON.stringify(record)).not.toContain("private");
});
it("retains zero duration and valid operational fields", () => {
  const record = JSON.parse(
    serializeLog({ ...base, metadata: { status: 200, duration_ms: 0 } }),
  );
  expect(record).toMatchObject({
    status: 200,
    duration_ms: 0,
    correlation_id: base.context.correlationId,
  });
});
