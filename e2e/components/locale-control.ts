import { expect, type Page } from "@playwright/test";
export class LocaleControl {
  constructor(private readonly page: Page) {}
  get selector() {
    return this.page.getByRole("combobox", {
      name: /^(Langue de l’interface|Interface language)$/,
    });
  }
  get status() {
    return this.page
      .getByRole("region", {
        name: /^(Langue de l’interface|Interface language)$/,
      })
      .getByRole("status");
  }
  async choose(locale: "fr-FR" | "en-GB" | "inherit", effective = locale) {
    await this.selector.focus();
    await this.selector.selectOption(locale);
    await expect(this.page.locator("html")).toHaveAttribute("lang", effective);
    await expect(this.selector).toHaveValue(locale);
    await expect(this.page).toHaveTitle("ActiCiv");
    await expect(this.status).toHaveText(
      /^(Langue enregistrée\.|Language saved\.)$/,
    );
  }
}
