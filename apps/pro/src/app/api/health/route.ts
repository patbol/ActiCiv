import { serializeLog } from "@acticiv/backend";
/** Process health only; never claims database readiness. */
export function GET() {
  const start = performance.now();
  const requestId = crypto.randomUUID();
  console.info(
    serializeLog({
      event: "request.completed",
      requestId,
      status: 200,
      durationMs: Math.round(performance.now() - start),
    }),
  );
  return Response.json(
    { application: "ok", database: "not_checked" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
