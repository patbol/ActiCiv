import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

export const proOrigin = "http://127.0.0.1:3001";
export async function accessible(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  await test.info().attach("acticiv-axe", {
    body: JSON.stringify({
      violations: result.violations.length,
      incomplete: result.incomplete.length,
      rules: result.violations.map((v) => v.id),
      incomplete_rules: result.incomplete.map((v) => v.id),
    }),
    contentType: "application/json",
  });
  expect(result.violations).toEqual([]);
}
export async function activateByKeyboard(control: Locator) {
  await control.focus();
  await control.press("Enter");
}
// Exercise server validation deliberately, independently of native HTML validation.
export async function disableNativeValidation(field: Locator) {
  await field.evaluate((input: HTMLInputElement) => {
    if (!input.form) throw new Error("Expected an input inside a form");
    input.form.noValidate = true;
  });
}
