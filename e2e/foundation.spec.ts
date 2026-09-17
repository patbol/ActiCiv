import { test, expect } from "./fixtures/test";
import { accessible } from "./helpers/ui";

for (const port of [3000, 3001] as const) {
  test.describe(
    `surface ${port}`,
    { tag: ["@route:foundation", "@component:foundation"] },
    () => {
      test(
        `surface ${port}: renders and passes automatic accessibility checks`,
        { tag: ["@medium", "@type:a11y", "@type:smoke"] },
        async ({ page, foundation }, testInfo) => {
          const surface = foundation(port);
          await surface.open();
          await expect(surface.heading).toBeVisible();
          await page.screenshot({
            path: testInfo.outputPath("surface.png"),
            fullPage: true,
          });
          await expect(surface.developmentNotice).toBeVisible();
          await accessible(page);
          expect(await surface.fitsViewport()).toBe(true);
        },
      );
      test.describe("shared dialog", { tag: "@component:dialog" }, () => {
        test(
          `surface ${port}: keyboard dialog focus and persistent labels`,
          { tag: ["@high", "@type:a11y"] },
          async ({ page, foundation }) => {
            const surface = foundation(port);
            await surface.open();
            await surface.openDialogByKeyboard();
            await expect(surface.dialog.root).toBeVisible();
            await expect(surface.dialog.input).toBeFocused();
            await surface.dialog.input.fill("Essai");
            await accessible(page);
            await page.keyboard.press("Shift+Tab");
            await expect(surface.dialog.closeButton).toBeFocused();
            await surface.dialog.dismissByKeyboard();
            await expect(surface.discoverButton).toBeFocused();
          },
        );
      });
      test(
        `surface ${port}: skip link and reduced motion`,
        { tag: ["@medium", "@type:a11y"] },
        async ({ page, foundation }) => {
          const surface = foundation(port);
          await page.emulateMedia({ reducedMotion: "reduce" });
          await surface.open();
          await page.keyboard.press("Tab");
          await expect(surface.skipLink).toBeFocused();
          await page.keyboard.press("Enter");
          await expect(page).toHaveURL(/#main$/);
          expect(await surface.discoverTransitionDuration()).toBe("0s");
        },
      );
    },
  );
}
