import type { Page } from "@playwright/test";
import {
  activateByKeyboard,
  disableNativeValidation,
  proOrigin,
} from "../helpers/ui";
export class RecoveryPage {
  constructor(private readonly page: Page) {}
  get heading() {
    return this.page.getByRole("heading", {
      name: "Récupérer mon accès",
      exact: true,
    });
  }
  get email() {
    return this.page.getByRole("textbox", {
      name: "Adresse email",
      exact: true,
    });
  }
  get submitButton() {
    return this.page.getByRole("button", {
      name: "Recevoir un lien",
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
