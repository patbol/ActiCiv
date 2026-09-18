import { confirmSession } from "./helpers/session";
import { LoginPage } from "./pages/login.page";
import { RecoveryPage } from "./pages/recovery.page";
import { ProSpacePage } from "./pages/pro-space.page";
import { test, expect } from "./fixtures/test";
import { LocaleControl } from "./components/locale-control";
import { accessible, proOrigin } from "./helpers/ui";

test.describe(
  "locale persistence",
  { tag: ["@route:foundation", "@component:locale-selector"] },
  () => {
    test(
      "Citizen switches without changing URL, persists and keeps keyboard focus",
      { tag: ["@high", "@type:a11y"] },
      async ({ page, context }) => {
        const hydration: string[] = [];
        page.on("pageerror", (error) => hydration.push(error.message));
        await page.goto("http://127.0.0.1:3000/?source=locale#main");
        const locale = new LocaleControl(page);
        await locale.choose("en-GB");
        await expect(locale.selector).toBeFocused();
        await expect(page).toHaveURL(
          "http://127.0.0.1:3000/?source=locale#main",
        );
        await expect(page.getByRole("heading", { level: 1 })).toContainText(
          "A small gesture.",
        );
        await accessible(page);
        await page.reload();
        await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
        await locale.selector.focus();
        await page.keyboard.press("f");
        await page.keyboard.press("Tab");
        await expect(page.locator("html")).toHaveAttribute("lang", "fr-FR");
        expect(
          (await context.cookies()).find((c) => c.name === "acticiv-locale")
            ?.value,
        ).toBe("fr-FR");
        expect(hydration).toEqual([]);
      },
    );
    test(
      "failed preference save announces an error and can be retried",
      { tag: ["@high", "@type:a11y", "@type:regression"] },
      async ({ page }) => {
        await page.goto("http://127.0.0.1:3000/");
        const locale = new LocaleControl(page);
        await page.route("**/api/locale", (route) =>
          route.fulfill({ status: 500 }),
        );
        await locale.selector.focus();
        await locale.selector.selectOption("en-GB");
        await expect(locale.status).toHaveText(
          "La langue n’a pas pu être enregistrée. Réessayez.",
        );
        await expect(locale.selector).toHaveValue("fr-FR");
        await expect(locale.selector).toBeFocused();
        await accessible(page);
        await page.unroute("**/api/locale");
        await locale.choose("en-GB");
        await expect(locale.selector).toBeFocused();
      },
    );
    test(
      "SSR negotiates independent requests and invalid cookies fall back",
      { tag: ["@high", "@type:regression"] },
      async ({ request }) => {
        for (const port of [3000, 3001]) {
          const origin = `http://127.0.0.1:${port}`;
          const [en, fr, invalid, absent] = await Promise.all([
            request.get(origin, {
              headers: { "Accept-Language": "de-DE,en-GB;q=0.7" },
            }),
            request.get(origin, {
              headers: { "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5" },
            }),
            request.get(origin, {
              headers: {
                Cookie: "acticiv-locale=invalid",
                "Accept-Language": "*",
              },
            }),
            request.get(origin, { headers: { "Accept-Language": "" } }),
          ]);
          expect(await en.text()).toContain('<html lang="en-GB"');
          for (const response of [fr, invalid, absent])
            expect(await response.text()).toContain('<html lang="fr-FR"');
          expect(en.headers()["cache-control"]).toContain("no-store");
          expect(await en.text()).toContain(
            "Citizens report. The right team acts.",
          );
          const missing = await request.get(origin + "/page-absente", {
            headers: { "Accept-Language": "en-GB" },
          });
          expect(missing.status()).toBe(404);
          expect(await missing.text()).toContain("Page not found");
          if (port === 3001) {
            const denied = await request.get(origin + "/api/configuration", {
              headers: { "Accept-Language": "en-GB" },
            });
            expect(denied.status()).toBe(403);
            expect(await denied.json()).toEqual({ error: "Access denied" });
          }
          expect(
            (
              await request.post(origin + "/api/locale", {
                headers: { Origin: "https://other.example" },
                data: { locale: "en-GB" },
              })
            ).status(),
          ).toBe(403);
          expect(
            (
              await request.post(origin + "/api/locale", {
                headers: { Origin: origin },
                data: { locale: "xx" },
              })
            ).status(),
          ).toBe(400);
        }
      },
    );
  },
);
test.describe(
  "professional locale",
  { tag: ["@route:auth", "@component:locale-selector"] },
  () => {
    test(
      "anonymous switch preserves login input, error focus and Auth navigation",
      { tag: ["@high", "@type:a11y"] },
      async ({ page, login, password, invitation }) => {
        const englishLogin = new LoginPage(page, "en-GB");
        const englishRecovery = new RecoveryPage(page, "en-GB");
        await login.open();
        await login.fillCredentials("absent@example.test", "wrong-password");
        const locale = new LocaleControl(page);
        await locale.choose("en-GB");
        await expect(locale.selector).toBeFocused();
        await expect(englishLogin.email).toHaveValue("absent@example.test");
        await expect(englishLogin.password).toHaveValue("wrong-password");
        await page
          .getByRole("button", { name: "Sign in", exact: true })
          .click();
        const error = englishLogin.error;
        await expect(error).toHaveText(
          "Unable to sign in. Check your credentials.",
        );
        await expect(error).toBeFocused();
        await accessible(page);
        await englishLogin.recoveryLink.click();
        await expect(page).toHaveURL(proOrigin + "/auth/recover");
        await expect(englishRecovery.heading).toBeFocused();
        await accessible(page);
        await page.goto(proOrigin + "/auth/password?error=1");
        await expect(password.error).toHaveText(
          "The password could not be saved.",
        );
        await accessible(page);
        await page.goto(proOrigin + "/auth/accept?error=1");
        await expect(invitation.error).toContainText(
          "No invitation to activate.",
        );
        await accessible(page);
      },
    );
    test(
      "invited identity can change interface language without acquiring business access",
      { tag: ["@critical", "@type:security", "@type:a11y"] },
      async ({ page, supabase, password }) => {
        const token = await supabase.invitationToken();
        expect((await confirmSession(page, token, "invite")).status()).toBe(
          307,
        );
        await password.open();
        const locale = new LocaleControl(page);
        await locale.choose("en-GB");
        await expect(locale.selector).toBeFocused();
        expect(
          (await page.request.get(proOrigin + "/api/configuration")).status(),
        ).toBe(403);
        await expect(
          locale.selector.getByRole("option", { name: "Organisation default" }),
        ).toHaveCount(0);
        await accessible(page);
      },
    );
    test(
      "professional choice survives login and reset restores organization inheritance",
      { tag: ["@critical", "@type:security", "@type:a11y"] },
      async ({ page, context, login, localeAccount, request }) => {
        const englishSpace = new ProSpacePage(page, "en-GB");
        await login.open();
        await login.fillCredentials(
          localeAccount.email,
          localeAccount.password,
        );
        await login.submitButton.click();
        await expect(page).toHaveURL(proOrigin + "/espace");
        const locale = new LocaleControl(page);
        const before = (await context.cookies()).filter((c) =>
          c.name.startsWith("sb-"),
        );
        const saved = page.waitForResponse(
          (r) =>
            r.url() === proOrigin + "/api/locale" &&
            r.request().method() === "POST",
        );
        await page.setExtraHTTPHeaders({
          "x-acticiv-command-id": "00000000-0000-4000-8000-000000000000",
        });
        await locale.choose("en-GB");
        const correlation = (await saved).headers()["x-correlation-id"];
        expect(correlation).toMatch(
          /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
        );
        expect(correlation).not.toBe("00000000-0000-4000-8000-000000000000");
        await page.setExtraHTTPHeaders({});
        await expect(locale.selector).toBeFocused();
        expect(
          (await context.cookies()).filter((c) => c.name.startsWith("sb-")),
        ).toEqual(before);
        await expect(englishSpace.activeMembership).toBeVisible();
        await accessible(page);
        await page
          .getByRole("button", { name: "Sign out", exact: true })
          .click();
        await login.fillCredentials(
          localeAccount.email,
          localeAccount.password,
        );
        await login.submitButton.click();
        await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
        const anonymous = await request.get(proOrigin + "/espace", {
          headers: { "Accept-Language": "fr-FR" },
        });
        expect(await anonymous.text()).toContain('<html lang="fr-FR"');
        expect(await anonymous.text()).not.toContain(
          "Your professional access is active.",
        );
        await locale.choose("inherit", "fr-FR");
        await expect(locale.selector).toBeFocused();
        await accessible(page);
      },
    );
  },
);
