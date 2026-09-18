import {
  telemetry,
  commandContext,
  authObserver,
} from "@acticiv/backend/observability";
import { getTranslations } from "next-intl/server";
import { NextResponse, type NextRequest } from "next/server";
import {
  configure,
  getProfessionalContext,
  supabaseContext,
} from "@acticiv/backend";
import { professionalClient, professionalOrigin } from "../../../lib/auth";
export async function GET() {
  const t = await getTranslations("common");
  const client = await professionalClient();
  const context = await getProfessionalContext(supabaseContext(client));
  if (!context)
    return NextResponse.json({ error: t("denied") }, { status: 403 });
  return NextResponse.json(
    { context },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function POST(request: NextRequest) {
  const context = commandContext();
  const start = performance.now();
  const observer = authObserver(telemetry, context);
  const t = await getTranslations("common");
  if (request.headers.get("origin") !== professionalOrigin()) {
    telemetry.logger.warn("CONFIGURATION_FAILED", observer.context(), {
      status: 403,
    });
    return NextResponse.json(
      { error: t("originDenied") },
      {
        status: 403,
        headers: { "X-Correlation-ID": observer.context().correlationId },
      },
    );
  }
  try {
    const client = await professionalClient(context.correlationId);
    const result = await configure(
      client,
      await request.json(),
      process.env,
      professionalOrigin(),
      observer,
    );
    telemetry.logger.info("CONFIGURATION_COMPLETED", observer.context(), {
      status: 200,
      duration_ms: performance.now() - start,
    });
    return NextResponse.json(
      { result: result ?? null },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Correlation-ID": observer.context().correlationId,
        },
      },
    );
  } catch (error) {
    telemetry.logger.warn("CONFIGURATION_FAILED", observer.context(), {
      status: 400,
      error,
      duration_ms: performance.now() - start,
    });
    return NextResponse.json(
      { error: t("invalidOperation") },
      {
        status: 400,
        headers: { "X-Correlation-ID": observer.context().correlationId },
      },
    );
  }
}
