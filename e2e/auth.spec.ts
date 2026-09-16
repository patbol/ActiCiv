import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHash } from "node:crypto";
function id(value: string) {
  const h = createHash("md5").update(value).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
test("professional login, accessible form and logout use real Supabase", async ({
  page,
}, testInfo) => {
  const role = testInfo.project.name === "desktop" ? "agent" : "supervisor";
  const password = process.env.ACTICIV_E2E_PASSWORD!;
  const provision = await fetch(
    `${process.env.SUPABASE_URL}/auth/v1/admin/users/${id(`user-3-${role}`)}`,
    {
      method: "PUT",
      headers: {
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    },
  );
  expect(provision.ok).toBe(true);
  await page.goto("http://127.0.0.1:3001/auth/login");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByLabel("Adresse email").fill(`${role}3@example.test`);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("http://127.0.0.1:3001/espace");
  await expect(
    page.getByText("Votre accès professionnel est actif."),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3001/auth/login");
  await page.goto("http://127.0.0.1:3001/api/configuration");
  await expect(page.getByText(/Accès refusé/)).toBeVisible();
});
test("invalid callbacks cannot redirect off site", async ({ page }) => {
  await page.goto(
    "http://127.0.0.1:3001/auth/callback?code=invalid&next=https://evil.example",
  );
  await expect(page).toHaveURL("http://127.0.0.1:3001/auth/login?error=1");
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Connexion impossible. Vérifiez vos identifiants." }),
  ).toBeVisible();
});
test("invited professional sets a password and activates membership", async ({
  page,
}, testInfo) => {
  const base = process.env.SUPABASE_URL!;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY!;
  async function auth(
    path: string,
    body: unknown,
    token: string = process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ) {
    const response = await fetch(base + path, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    expect(response.ok).toBe(true);
    const bodyText = await response.text();
    return bodyText ? JSON.parse(bodyText) : null;
  }
  const suffix = crypto.randomUUID();
  const email = `browser-${suffix}@example.test`;
  const adminId = id(
    `user-${testInfo.project.name === "desktop" ? 2 : 3}-client_admin`,
  );
  const org = id(`org-${testInfo.project.name === "desktop" ? 2 : 3}`);
  const provision = await fetch(base + `/auth/v1/admin/users/${adminId}`, {
    method: "PUT",
    headers: {
      apikey: anon,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: process.env.ACTICIV_E2E_PASSWORD }),
  });
  expect(provision.ok).toBe(true);
  const session = await auth(
    "/auth/v1/token?grant_type=password",
    {
      email: `client_admin${testInfo.project.name === "desktop" ? 2 : 3}@example.test`,
      password: process.env.ACTICIV_E2E_PASSWORD,
    },
    anon,
  );
  const invitation = await auth(
    "/rest/v1/rpc/reserve_invitation",
    {
      p_org: org,
      p_email: email,
      p_role: "agent",
      p_services: [],
      p_key: suffix,
    },
    session.access_token,
  );
  const user = await auth("/auth/v1/invite", { email });
  await auth("/rest/v1/rpc/mark_invitation_sent", {
    p_invitation: invitation.id,
    p_user: user.id,
  });
  const link = await auth("/auth/v1/admin/generate_link", {
    type: "invite",
    email,
  });
  await page.goto(
    `http://127.0.0.1:3001/auth/confirm?token_hash=${encodeURIComponent(link.hashed_token)}&type=invite`,
  );
  await expect(
    page.getByRole("heading", { name: "Définir mon mot de passe" }),
  ).toBeVisible();
  await page
    .getByLabel("Nouveau mot de passe")
    .fill(process.env.ACTICIV_E2E_PASSWORD!);
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(
    page.getByRole("heading", { name: "Activer mon accès professionnel" }),
  ).toBeVisible();
  await page
    .getByLabel("Nom d’affichage")
    .fill("Professionnel fictif navigateur");
  await page.getByRole("button", { name: "Accepter l’invitation" }).click();
  await expect(
    page.getByText("Votre accès professionnel est actif."),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test("client administrator uses the protected configuration entrypoint", async ({
  page,
}, testInfo) => {
  const n = testInfo.project.name === "desktop" ? 2 : 3;
  const provision = await fetch(
    `${process.env.SUPABASE_URL}/auth/v1/admin/users/${id(`user-${n}-client_admin`)}`,
    {
      method: "PUT",
      headers: {
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: process.env.ACTICIV_E2E_PASSWORD }),
    },
  );
  expect(provision.ok).toBe(true);
  await page.goto("http://127.0.0.1:3001/auth/login");
  await page.getByLabel("Adresse email").fill(`client_admin${n}@example.test`);
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill(process.env.ACTICIV_E2E_PASSWORD!);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3001/espace");
  const results = await page.evaluate(
    async ({ org, other }) => {
      const write = async (organizationId: string) => {
        const response = await fetch("/api/configuration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "service.save",
            organizationId,
            code: "accessibility",
            name: "Accessibilité",
            status: "active",
          }),
        });
        return response.status;
      };
      return [await write(org), await write(other)];
    },
    { org: id(`org-${n}`), other: id("org-1") },
  );
  expect(results).toEqual([200, 400]);
});
