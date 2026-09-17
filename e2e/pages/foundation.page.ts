import type { Page } from "@playwright/test";
import { Dialog } from "../components/dialog";
import { activateByKeyboard } from "../helpers/ui";
export class FoundationPage {
  readonly dialog: Dialog;
  constructor(
    private readonly page: Page,
    private readonly port: 3000 | 3001,
  ) {
    this.dialog = new Dialog(page);
  }
  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }
  get developmentNotice() {
    return this.page.getByText(
      "Aperçu de développement · Aucun signalement envoyé",
    );
  }
  get discoverButton() {
    return this.page.getByRole("button", {
      name: "Découvrir le projet",
      exact: true,
    });
  }
  get skipLink() {
    return this.page.getByRole("link", {
      name: "Aller au contenu",
      exact: true,
    });
  }
  async open() {
    await this.page.goto(`http://127.0.0.1:${this.port}`);
  }
  async openDialogByKeyboard() {
    await activateByKeyboard(this.discoverButton);
  }
  async fitsViewport() {
    return this.page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
  }
  async discoverTransitionDuration() {
    return this.discoverButton.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    );
  }
}
