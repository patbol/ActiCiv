import type { Page } from "@playwright/test";
import {
  activateByKeyboard,
  disableNativeValidation,
  proOrigin,
} from "../helpers/ui";
export class RecoveryPage {
  constructor(
    private readonly page: Page,
    private readonly locale: "fr-FR" | "en-GB" = "fr-FR",
  ) {}
  get heading() {
    return this.page.getByRole("heading", {
      name:
        this.locale === "fr-FR" ? "Récupérer mon accès" : "Recover my access",
      exact: true,
    });
  }
  get email() {
    return this.page.getByRole("textbox", {
      name: this.locale === "fr-FR" ? "Adresse email" : "Email address",
      exact: true,
    });
  }
  get submitButton() {
    return this.page.getByRole("button", {
      name: this.locale === "fr-FR" ? "Recevoir un lien" : "Send me a link",
      exact: true,
    });
  }
  get error() {
    return this.page.getByRole("main").getByRole("alert");
  }
  get status() {
    return this.page.getByRole("main").getByRole("status");
  }
  async open() {
    await this.page.goto(proOrigin + "/auth/recover");
  }
  async exerciseServerValidation() {
    await disableNativeValidation(this.email);
  }
  async submitByKeyboard() {
    await activateByKeyboard(this.submitButton);
  }
}
