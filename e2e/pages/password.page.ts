import type { Page } from "@playwright/test";
import {
  activateByKeyboard,
  disableNativeValidation,
  proOrigin,
} from "../helpers/ui";
export class PasswordPage {
  constructor(private readonly page: Page) {}
  get heading() {
    return this.page.getByRole("heading", {
      name: "Définir mon mot de passe",
      exact: true,
    });
  }
  get password() {
    return this.page.getByLabel("Nouveau mot de passe", { exact: true });
  }
  get submitButton() {
    return this.page.getByRole("button", { name: "Enregistrer", exact: true });
  }
  get error() {
    return this.page.getByRole("main").getByRole("alert");
  }
  async open() {
    await this.page.goto(proOrigin + "/auth/password");
  }
  async exerciseServerValidation() {
    await disableNativeValidation(this.password);
  }
  async submitByKeyboard() {
    await activateByKeyboard(this.submitButton);
  }
}
