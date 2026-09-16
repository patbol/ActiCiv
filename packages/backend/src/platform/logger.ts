export type LogEvent =
  "request.completed" | "request.failed" | "configuration.failed";
export type LogRecord = {
  event: LogEvent;
  requestId: string;
  durationMs?: number;
  status?: number;
};
/** Allowlist: never serialize arbitrary errors, URLs, headers or payloads. */
export function serializeLog(record: LogRecord): string {
  return JSON.stringify({
    event: record.event,
    requestId: record.requestId,
    ...(record.durationMs === undefined
      ? {}
      : { durationMs: record.durationMs }),
    ...(record.status === undefined ? {} : { status: record.status }),
  });
}
