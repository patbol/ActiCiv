"use server";
import {
  telemetry,
  commandContext,
  authObserver,
  type CommandContext,
} from "@acticiv/backend/observability";
import { redirect } from "next/navigation";
import {
  professionalSession,
  signInProfessional,
  recoverProfessional,
  defineProfessionalPassword,
  acceptProfessionalInvitation,
  signOutProfessional,
} from "@acticiv/backend";
import { professionalClient, professionalOrigin } from "../../lib/auth";
function field(data: FormData, name: string) {
  return String(data.get(name) ?? "");
}
async function session(context: CommandContext) {
  return professionalSession(
    await professionalClient(context.correlationId),
    professionalOrigin(),
  );
}
export async function login(data: FormData) {
  const context = commandContext();
  const observer = authObserver(telemetry, context);
  try {
    await signInProfessional(
      field(data, "email"),
      field(data, "password"),
      await session(context),
      observer,
    );
  } catch {
    redirect("/auth/login?error=1");
  }
  redirect("/espace");
}
export async function recover(data: FormData) {
  const context = commandContext();
  const observer = authObserver(telemetry, context);
  try {
    await recoverProfessional(
      field(data, "email"),
      await session(context),
      observer,
    );
  } catch {
    redirect("/auth/recover?error=1");
  }
  redirect("/auth/recover?sent=1");
}
export async function password(data: FormData) {
  const context = commandContext();
  const observer = authObserver(telemetry, context);
  let destination: string;
  try {
    destination = await defineProfessionalPassword(
      field(data, "password"),
      await session(context),
      observer,
    );
  } catch {
    redirect("/auth/password?error=1");
  }
  redirect(destination);
}
export async function accept(data: FormData) {
  const context = commandContext();
  const observer = authObserver(telemetry, context);
  try {
    await acceptProfessionalInvitation(
      field(data, "name"),
      await session(context),
      observer,
    );
  } catch {
    redirect("/auth/accept?error=1");
  }
  redirect("/espace");
}
export async function logout() {
  const context = commandContext();
  const observer = authObserver(telemetry, context);
  await signOutProfessional(await session(context), observer);
  redirect("/auth/login");
}
