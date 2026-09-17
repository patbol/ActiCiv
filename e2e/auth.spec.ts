import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHash } from "node:crypto";
async function accessible(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
}
async function submitByKeyboard(page: Page, button: string) {
  await page.getByRole("button", { name: button, exact: true }).focus();
  await page.keyboard.press("Enter");
}
test("recovery validates errors, keyboard focus, new password and a fresh login", async ({
  page,
}, testInfo) => {
  const role = testInfo.project.name === "desktop" ? "agent" : "supervisor";
  const uid = id(`user-1-${role}`),
    email = `${role}1@example.test`;
  const initial = process.env.ACTICIV_E2E_PASSWORD!;
  const changed = initial + "Recovery!";
  const base = process.env.SUPABASE_URL!;
  const headers = {
    apikey: process.env.SUPABASE_PUBLISHABLE_KEY!,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
  expect(
    (
      await fetch(`${base}/auth/v1/admin/users/${uid}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ password: initial }),
      })
    ).ok,
  ).toBe(true);
  await page.goto("http://127.0.0.1:3001/auth/recover");
  await expect(
    page.getByRole("heading", { name: "Récupérer mon accès" }),
  ).toBeFocused();
  await accessible(page);
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Adresse email")).toBeFocused();
  await page.getByLabel("Adresse email").fill("invalid-address");
  await page.locator("form").evaluate((form: HTMLFormElement) => {
    form.noValidate = true;
  });
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Recevoir un lien" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#auth-error")).toBeFocused();
  await accessible(page);
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Adresse email")).toBeFocused();
  await page.getByLabel("Adresse email").fill(email);
  await submitByKeyboard(page, "Recevoir un lien");
  await expect(page.locator("#auth-status")).toBeFocused();
  await expect(page.locator("#auth-status")).toContainText("Si cette adresse");
  await accessible(page);
  const response = await fetch(`${base}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers,
    body: JSON.stringify({ type: "recovery", email }),
  });
  expect(response.ok).toBe(true);
  const link = await response.json();
  await page.goto(
    `http://127.0.0.1:3001/auth/confirm?token_hash=${encodeURIComponent(link.hashed_token)}&type=recovery`,
  );
  await expect(
    page.getByRole("heading", { name: "Définir mon mot de passe" }),
  ).toBeFocused();
  await accessible(page);
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Nouveau mot de passe")).toBeFocused();
  await page.getByLabel("Nouveau mot de passe").fill("short");
  await page.locator("form").evaluate((form: HTMLFormElement) => {
    form.noValidate = true;
  });
  await submitByKeyboard(page, "Enregistrer");
  await expect(page.locator("#auth-error")).toBeFocused();
  await accessible(page);
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Nouveau mot de passe")).toBeFocused();
  await page.getByLabel("Nouveau mot de passe").fill(changed);
  await submitByKeyboard(page, "Enregistrer");
  await expect(page).toHaveURL("http://127.0.0.1:3001/espace");
  await accessible(page);
  await submitByKeyboard(page, "Se déconnecter");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(changed);
  await submitByKeyboard(page, "Se connecter");
  await expect(page).toHaveURL("http://127.0.0.1:3001/espace");
});
test("login rejects wrong credentials and exposes a focused accessible error", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:3001/auth/login");
  await expect(
    page.getByRole("heading", { name: "Connexion professionnelle" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Adresse email")).toBeFocused();
  await page.getByLabel("Adresse email").fill("absent@example.test");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Mot de passe", { exact: true })).toBeFocused();
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill("invalid-password");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Se connecter" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#auth-error")).toBeFocused();
  await expect(page.locator("#auth-error")).toContainText(
    "Connexion impossible",
  );
  await accessible(page);
});
test("unavailable invitation remains accessible without granting any membership", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:3001/auth/accept?error=1");
  await expect(page.locator("#auth-error")).toBeFocused();
  await expect(page.getByText("Aucune invitation à activer.")).toBeVisible();
  await accessible(page);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Accéder à mon espace" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("http://127.0.0.1:3001/espace");
  await expect(
    page.getByText("Aucun accès professionnel actif.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("Votre accès professionnel est actif."),
  ).toHaveCount(0);
  expect(
    (
      await page.request.get("http://127.0.0.1:3001/api/configuration")
    ).status(),
  ).toBe(403);
  await accessible(page);
});
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
  await expect(page.locator("#auth-error")).toBeFocused();
  await accessible(page);
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
  await expect(
    page.getByRole("heading", { name: "Définir mon mot de passe" }),
  ).toBeFocused();
  await accessible(page);
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Nouveau mot de passe")).toBeFocused();
  await page
    .getByLabel("Nouveau mot de passe")
    .fill(process.env.ACTICIV_E2E_PASSWORD!);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Enregistrer" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Activer mon accès professionnel" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Activer mon accès professionnel" }),
  ).toBeFocused();
  await accessible(page);
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Nom d’affichage")).toBeFocused();
  await page.getByLabel("Nom d’affichage").fill("   ");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Accepter l’invitation" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#auth-error")).toBeFocused();
  await expect(page.locator("#auth-error")).toContainText(
    "Invitation indisponible",
  );
  await accessible(page);
  await page
    .getByLabel("Nom d’affichage")
    .fill("Professionnel fictif navigateur");
  await submitByKeyboard(page, "Accepter l’invitation");
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
