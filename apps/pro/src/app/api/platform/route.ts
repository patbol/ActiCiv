import { NextResponse, type NextRequest } from "next/server";
import { platformAdministration } from "@acticiv/backend";
import { professionalClient, professionalOrigin } from "../../../lib/auth";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== professionalOrigin())
    return NextResponse.json({ error: "Origine refusée" }, { status: 403 });
  try {
    const result = await platformAdministration(
      await professionalClient(),
      await request.json(),
    );
    return NextResponse.json(
      { result: result ?? null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Opération refusée ou données invalides" },
      { status: 400 },
    );
  }
}
