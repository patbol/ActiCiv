import { test, expect } from "./fixtures/test";
import { accessible, proOrigin } from "./helpers/ui";
import {
  confirmSession,
  configurationStatus,
  saveServiceInBrowser,
} from "./helpers/session";
import { seedId } from "./fixtures/supabase";

test.describe(
  "recover access",
  { tag: ["@route:auth", "@component:recovery"] },
  () => {
    test(
      "recovery validates errors, keyboard focus, new password and a fresh login",
      { tag: ["@critical", "@type:security", "@type:a11y"] },
      async ({
        page,
        recovery,
        password,
        login,
        space,
        recoveryAccount,
        supabase,
      }) => {
        const changed = recoveryAccount.password + "Recovery!";
        await recovery.open();
        await expect(recovery.heading).toBeFocused();
        await accessible(page);
        await page.keyboard.press("Tab");
        await expect(recovery.email).toBeFocused();
        await recovery.email.fill("invalid-address");
        await recovery.exerciseServerValidation();
        await page.keyboard.press("Tab");
        await expect(recovery.submitButton).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(recovery.error).toBeFocused();
        await accessible(page);
        await page.keyboard.press("Tab");
        await expect(recovery.email).toBeFocused();
        await recovery.email.fill(recoveryAccount.email);
        await recovery.submitByKeyboard();
        await expect(recovery.status).toBeFocused();
        await expect(recovery.status).toContainText("Si cette adresse");
        await accessible(page);
        const token = await supabase.recoveryToken(recoveryAccount.email);
        const confirmation = await confirmSession(page, token, "recovery");
        expect(confirmation.status()).toBe(307);
        expect(confirmation.headers()["set-cookie"]).toContain("sb-");
        await password.open();
        await expect(password.heading).toBeFocused();
        await accessible(page);
        await page.keyboard.press("Tab");
        await expect(password.password).toBeFocused();
        await password.password.fill("short");
        await password.exerciseServerValidation();
        await password.submitByKeyboard();
        await expect(password.error).toBeFocused();
        await accessible(page);
        await page.keyboard.press("Tab");
        await expect(password.password).toBeFocused();
        await password.password.fill(changed);
        await password.submitByKeyboard();
        await expect(page).toHaveURL(proOrigin + "/espace");
        await accessible(page);
        await space.logoutByKeyboard();
        await login.fillCredentials(recoveryAccount.email, changed);
        await login.submitByKeyboard();
        await expect(page).toHaveURL(proOrigin + "/espace");
      },
    );
  },
);

test.describe(
  "professional session",
  { tag: ["@route:auth", "@component:login"] },
  () => {
    test(
      "login rejects wrong credentials and exposes a focused accessible error",
      { tag: ["@high", "@type:security", "@type:a11y"] },
      async ({ page, login }) => {
        await login.open();
        await expect(login.heading).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(login.email).toBeFocused();
        await login.email.fill("absent@example.test");
        await page.keyboard.press("Tab");
        await expect(login.password).toBeFocused();
        await login.password.fill("invalid-password");
        await page.keyboard.press("Tab");
        await expect(login.submitButton).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(login.error).toBeFocused();
        await expect(login.error).toContainText("Connexion impossible");
        await accessible(page);
      },
    );
    test(
      "professional login, accessible form and logout use real Supabase",
      { tag: ["@critical", "@type:a11y", "@type:smoke"] },
      async ({ page, login, space, loginAccount }) => {
        await login.open();
        await accessible(page);
        await login.fillCredentials(loginAccount.email, loginAccount.password);
        await login.submitByKeyboard();
        await expect(page).toHaveURL(proOrigin + "/espace");
        await expect(space.activeMembership).toBeVisible();
        await accessible(page);
        await space.logoutButton.click();
        await expect(page).toHaveURL(proOrigin + "/auth/login");
        await space.openConfigurationResponse();
        await expect(space.deniedResponse).toBeVisible();
      },
    );
  },
);

test.describe(
  "invitation",
  { tag: ["@route:auth", "@component:invitation"] },
  () => {
    test(
      "unavailable invitation remains accessible without granting any membership",
      { tag: ["@critical", "@type:security", "@type:a11y"] },
      async ({ page, invitation, space }) => {
        await invitation.openUnavailable();
        await expect(invitation.error).toBeFocused();
        await expect(invitation.error).toContainText(
          "Aucune invitation à activer.",
        );
        await expect(invitation.unavailableNotice).toBeVisible();
        await accessible(page);
        await page.keyboard.press("Tab");
        await expect(invitation.spaceLink).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(proOrigin + "/espace");
        await expect(space.noMembership).toBeVisible();
        await expect(space.activeMembership).toHaveCount(0);
        expect(await configurationStatus(page)).toBe(403);
        await accessible(page);
      },
    );
    test(
      "invited professional sets a password and activates membership",
      { tag: ["@critical", "@type:security", "@type:a11y"] },
      async ({ page, password, invitation, space, supabase }) => {
        const token = await supabase.invitationToken();
        const confirmation = await confirmSession(page, token, "invite");
        expect(confirmation.status()).toBe(307);
        expect(confirmation.headers()["set-cookie"]).toContain("sb-");
        await password.open();
        await expect(password.heading).toBeVisible();
        await expect(password.heading).toBeFocused();
        await accessible(page);
        await page.keyboard.press("Tab");
        await expect(password.password).toBeFocused();
        await password.password.fill(supabase.password);
        await page.keyboard.press("Tab");
        await expect(password.submitButton).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(invitation.heading).toBeVisible();
        await expect(invitation.heading).toBeFocused();
        await accessible(page);
        await page.keyboard.press("Tab");
        await expect(invitation.displayName).toBeFocused();
        await invitation.displayName.fill("   ");
        await page.keyboard.press("Tab");
        await expect(invitation.submitButton).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(invitation.error).toBeFocused();
        await expect(invitation.error).toContainText("Invitation indisponible");
        await accessible(page);
        await invitation.displayName.fill("Professionnel fictif navigateur");
        await invitation.submitByKeyboard();
        await expect(space.activeMembership).toBeVisible();
        await accessible(page);
      },
    );
  },
);

test.describe(
  "callback",
  { tag: ["@route:auth", "@component:callback"] },
  () => {
    test(
      "invalid callbacks cannot redirect off site",
      { tag: ["@critical", "@type:security", "@type:a11y"] },
      async ({ page, login }) => {
        await login.openInvalidCallback("https://evil.example");
        await expect(page).toHaveURL(proOrigin + "/auth/login?error=1");
        await expect(login.error).toBeFocused();
        await accessible(page);
        await expect(
          login.error.filter({
            hasText: "Connexion impossible. Vérifiez vos identifiants.",
          }),
        ).toBeVisible();
      },
    );
  },
);

test.describe(
  "organization configuration",
  { tag: ["@route:admin-pro", "@component:configuration"] },
  () => {
    test(
      "client administrator uses the protected configuration entrypoint",
      { tag: ["@critical", "@type:security"] },
      async ({ page, login, adminAccount, supabase }) => {
        await login.open();
        await login.fillCredentials(adminAccount.email, adminAccount.password);
        await login.submitButton.click();
        await expect(page).toHaveURL(proOrigin + "/espace");
        const results = [
          await saveServiceInBrowser(
            page,
            seedId(`org-${supabase.organizationNumber}`),
          ),
          await saveServiceInBrowser(page, seedId("org-1")),
        ];
        expect(results).toEqual([200, 400]);
      },
    );
  },
);
