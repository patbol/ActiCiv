"use server";
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
async function session() {
  return professionalSession(await professionalClient(), professionalOrigin());
}
export async function login(data: FormData) {
  try {
    await signInProfessional(
      field(data, "email"),
      field(data, "password"),
      await session(),
    );
  } catch {
    redirect("/auth/login?error=1");
  }
  redirect("/espace");
}
export async function recover(data: FormData) {
  try {
    await recoverProfessional(field(data, "email"), await session());
  } catch {
    redirect("/auth/recover?error=1");
  }
  redirect("/auth/recover?sent=1");
}
export async function password(data: FormData) {
  let destination: string;
  try {
    destination = await defineProfessionalPassword(
      field(data, "password"),
      await session(),
    );
  } catch {
    redirect("/auth/password?error=1");
  }
  redirect(destination);
}
export async function accept(data: FormData) {
  try {
    await acceptProfessionalInvitation(field(data, "name"), await session());
  } catch {
    redirect("/auth/accept?error=1");
  }
  redirect("/espace");
}
export async function logout() {
  await signOutProfessional(await session());
  redirect("/auth/login");
}
