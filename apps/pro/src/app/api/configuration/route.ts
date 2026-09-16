import { NextResponse, type NextRequest } from "next/server";
import {
  configure,
  getProfessionalContext,
  supabaseContext,
} from "@acticiv/backend";
import { professionalClient, professionalOrigin } from "../../../lib/auth";
export async function GET() {
  const client = await professionalClient();
  const context = await getProfessionalContext(supabaseContext(client));
  if (!context)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  return NextResponse.json(
    { context },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== professionalOrigin())
    return NextResponse.json({ error: "Origine refusée" }, { status: 403 });
  try {
    const client = await professionalClient();
    const result = await configure(
      client,
      await request.json(),
      process.env,
      professionalOrigin(),
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
