import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";

export const proOrigin = "http://127.0.0.1:3001";
export async function accessible(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
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
