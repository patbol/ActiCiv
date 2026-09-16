import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const port of [3000, 3001]) {
  test(`surface ${port}: renders and passes automatic accessibility checks`, async ({
    page,
  }, testInfo) => {
    await page.goto(`http://127.0.0.1:${port}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath("surface.png"),
      fullPage: true,
    });
    await expect(
      page.getByText("Aperçu de développement · Aucun signalement envoyé"),
    ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
  test(`surface ${port}: keyboard dialog focus and persistent labels`, async ({
    page,
  }) => {
    await page.goto(`http://127.0.0.1:${port}`);
    const trigger = page.getByRole("button", { name: "Découvrir le projet" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    const input = page.getByLabel("Texte de démonstration");
    await expect(input).toBeFocused();
    await input.fill("Essai");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Fermer" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
  test(`surface ${port}: skip link and reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`http://127.0.0.1:${port}`);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Aller au contenu" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    expect(
      await page
        .getByRole("button", { name: "Découvrir le projet" })
        .evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toBe("0s");
  });
}
