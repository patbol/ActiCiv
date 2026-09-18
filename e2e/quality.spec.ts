import { test, expect } from "./fixtures/test";
import { accessible, activateByKeyboard } from "./helpers/ui";
test.describe(
  "Quality Center",
  { tag: ["@route:quality", "@component:quality-center"] },
  () => {
    test(
      "anonymous and client roles cannot read evidence",
      { tag: ["@critical", "@type:security"] },
      async ({ quality, login, loginAccount, page }) => {
        await quality.open();
        await expect(quality.denied).toContainText("quality.read");
        await expect(
          page.getByText("synthetic-pass", { exact: true }),
        ).toHaveCount(0);
        await login.open();
        await login.fillCredentials(loginAccount.email, loginAccount.password);
        await login.submitByKeyboard();
        await page.waitForURL("**/espace");
        await quality.open("synthetic-pass");
        await expect(quality.denied).toContainText("quality.read");
        await accessible(page);
      },
    );
    test(
      "platform identity without capability is denied despite forged metadata",
      { tag: ["@critical", "@type:security"] },
      async ({ quality, login, supabase, page }) => {
        const account = await supabase.qualityAccount([]);
        try {
          await login.open();
          await login.fillCredentials(account.email, account.password);
          await login.submitByKeyboard();
          await page.waitForURL("**/espace");
          await quality.open();
          await expect(quality.denied).toContainText("quality.read");
        } finally {
          await supabase.retireQuality(account);
        }
      },
    );
    test(
      "authorized overview, four states, zero coverage, candidate and manual scope are readable",
      { tag: ["@critical", "@type:a11y"] },
      async ({ quality, login, qualityAccount, page }) => {
        await login.open();
        await login.fillCredentials(
          qualityAccount.email,
          qualityAccount.password,
        );
        await login.submitByKeyboard();
        await page.waitForURL("**/espace");
        await page.getByRole("link", { name: "Centre qualité" }).click();
        await expect(quality.heading).toBeVisible();
        await quality.open("synthetic-pass");
        await expect(quality.main).toContainText(
          "Baseline candidate — non acceptée",
        );
        await expect(quality.main).toContainText("0 %");
        await expect(quality.main).toContainText("NOT_APPLICABLE");
        await expect(quality.main).toContainText("TalkBack : DEFERRED");
        await expect(quality.main).toContainText("medium · open");
        await expect(quality.main).toContainText("aucun seuil bloquant");
        await accessible(page);
        await quality.open("synthetic-fail");
        await expect(page.locator("aside")).toContainText("FAIL");
        await accessible(page);
        await quality.open("synthetic-deferred");
        await expect(page.locator("aside")).toContainText("DEFERRED");
        await expect(quality.main).toContainText("Aucune baseline");
        await quality.open("synthetic-partial");
        await expect(quality.denied).toContainText("Aucun verdict fiable");
      },
    );
    test(
      "keyboard drill-down, filters, comparison and responsive layout",
      { tag: ["@high", "@type:a11y"] },
      async ({ quality, login, qualityAccount, page }) => {
        await login.open();
        await login.fillCredentials(
          qualityAccount.email,
          qualityAccount.password,
        );
        await login.submitByKeyboard();
        await page.waitForURL("**/espace");
        await quality.open("synthetic-pass");
        await expect(quality.heading).toBeFocused();
        const summary = quality.suites.locator("summary").first();
        await activateByKeyboard(summary);
        await expect(
          quality.suites.getByText("Synthetic canonical test", {
            exact: false,
          }),
        ).toBeVisible();
        await page
          .getByLabel("Tag exact : criticité, route ou composant")
          .fill("@critical");
        await quality.suites.getByRole("button", { name: "Filtrer" }).click();
        await page
          .getByLabel("Comparer avec un run")
          .selectOption("synthetic-fail");
        await page
          .getByRole("button", { name: "Comparer", exact: true })
          .click();
        await expect(quality.main).toContainText("Tests Δ");
        await expect(page.locator("html")).toHaveAttribute("lang", "fr-FR");
        await page
          .getByRole("combobox", { name: "Langue de l’interface" })
          .focus();
        await page
          .getByRole("combobox", { name: "Langue de l’interface" })
          .selectOption("en-GB");
        await expect(
          page.getByRole("heading", { name: "Quality Center", exact: true }),
        ).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
        await expect(
          page.getByRole("combobox", { name: "Interface language" }),
        ).toBeFocused();
        await page
          .getByRole("combobox", { name: "Environment", exact: true })
          .selectOption("ci-local");
        await page
          .locator("#history")
          .getByRole("button", { name: "Filter" })
          .click();
        await expect(quality.main).toContainText("Run unavailable");
        await expect(
          page.getByRole("link", { name: "synthetic-pass", exact: true }),
        ).toHaveCount(0);
        await accessible(page);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      },
    );
  },
);
