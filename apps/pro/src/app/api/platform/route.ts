import { telemetry, commandContext } from "@acticiv/backend/observability";
import { getTranslations } from "next-intl/server";
import { NextResponse, type NextRequest } from "next/server";
import { platformAdministration } from "@acticiv/backend";
import { professionalClient, professionalOrigin } from "../../../lib/auth";
export async function POST(request: NextRequest) {
  const context = commandContext();
  const start = performance.now();
  const t = await getTranslations("common");
  if (request.headers.get("origin") !== professionalOrigin()) {
    telemetry.logger.warn("PLATFORM_FAILED", context, { status: 403 });
    return NextResponse.json(
      { error: t("originDenied") },
      { status: 403, headers: { "X-Correlation-ID": context.correlationId } },
    );
  }
  try {
    const result = await platformAdministration(
      await professionalClient(context.correlationId),
      await request.json(),
    );
    telemetry.logger.info("PLATFORM_COMPLETED", context, {
      status: 200,
      duration_ms: performance.now() - start,
    });
    return NextResponse.json(
      { result: result ?? null },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Correlation-ID": context.correlationId,
        },
      },
    );
  } catch (error) {
    telemetry.logger.warn("PLATFORM_FAILED", context, {
      status: 400,
      error,
      duration_ms: performance.now() - start,
    });
    return NextResponse.json(
      { error: t("invalidOperation") },
      { status: 400, headers: { "X-Correlation-ID": context.correlationId } },
    );
  }
}
