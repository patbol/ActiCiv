import { commandContext, telemetry } from "@acticiv/backend/observability";
/** Process health only; never claims database readiness. Poll diagnostics disabled in PROD. */
export function GET() {
  telemetry.logger.debug("HEALTH_CHECK", commandContext(), { status: 200 });
  return Response.json(
    { application: "ok", database: "not_checked" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
