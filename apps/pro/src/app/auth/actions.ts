"use server";
import { redirect } from "next/navigation";
import { professionalClient, professionalOrigin } from "../../lib/auth";
function field(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
}
export async function login(data: FormData) {
  const client = await professionalClient();
  const { error } = await client.auth.signInWithPassword({
    email: field(data, "email"),
    password: String(data.get("password") ?? ""),
  });
  if (error) redirect("/auth/login?error=1");
  redirect("/espace");
}
export async function recover(data: FormData) {
  const client = await professionalClient();
  await client.auth.resetPasswordForEmail(field(data, "email"), {
    redirectTo: professionalOrigin() + "/auth/callback?next=/auth/password",
  });
  redirect("/auth/recover?sent=1");
}
export async function password(data: FormData) {
  const client = await professionalClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/auth/login");
  const value = String(data.get("password") ?? "");
  if (value.length < 12) redirect("/auth/password?error=1");
  const { error } = await client.auth.updateUser({ password: value });
  if (error) redirect("/auth/password?error=1");
  redirect("/auth/accept");
}
export async function accept(data: FormData) {
  const client = await professionalClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: invitations, error: lookup } =
    await client.rpc("pending_invitation");
  if (lookup || !invitations?.length || invitations.length !== 1)
    redirect("/auth/accept?error=1");
  const { error } = await client.rpc("accept_invitation", {
    p_invitation: invitations[0].id,
    p_name: field(data, "name"),
  });
  if (error) redirect("/auth/accept?error=1");
  redirect("/espace");
}
export async function logout() {
  const client = await professionalClient();
  await client.auth.signOut();
  redirect("/auth/login");
}
