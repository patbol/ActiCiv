import type { Page } from "@playwright/test";
export class Dialog {
  constructor(private readonly page: Page) {}
  get root() {
    return this.page.getByRole("dialog");
  }
  get input() {
    return this.root.getByRole("textbox", { name: "Texte de démonstration" });
  }
  get closeButton() {
    return this.root.getByRole("button", { name: "Fermer", exact: true });
  }
  async dismissByKeyboard() {
    await this.page.keyboard.press("Escape");
  }
}
