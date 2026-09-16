import { it, expect } from "vitest";
import { serializeLog } from "./logger";
it("does not serialize extra payloads, error objects, URLs or personal values", () => {
  const runtimeRecord = {
    event: "request.failed" as const,
    requestId: "opaque-request-123",
    status: 500,
    email: "private@example.test",
    token: "secret-tracking",
    url: "/tracking/secret",
    error: new Error("sensitive"),
  };
  expect(JSON.parse(serializeLog(runtimeRecord))).toEqual({
    event: "request.failed",
    requestId: "opaque-request-123",
    status: 500,
  });
});
it("retains zero duration and valid operational fields", () => {
  expect(
    JSON.parse(
      serializeLog({
        event: "request.completed",
        requestId: "request-456",
        status: 200,
        durationMs: 0,
      }),
    ),
  ).toEqual({
    event: "request.completed",
    requestId: "request-456",
    status: 200,
    durationMs: 0,
  });
});
