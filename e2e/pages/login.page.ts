import type { Page } from "@playwright/test";
import { activateByKeyboard, proOrigin } from "../helpers/ui";
export class LoginPage {
  constructor(private readonly page: Page) {}
  get heading() {
    return this.page.getByRole("heading", {
      name: "Connexion professionnelle",
      exact: true,
    });
  }
  get email() {
    return this.page.getByRole("textbox", {
      name: "Adresse email",
      exact: true,
    });
  }
  get password() {
    return this.page.getByLabel("Mot de passe", { exact: true });
  }
  get submitButton() {
    return this.page.getByRole("button", { name: "Se connecter", exact: true });
  }
  get error() {
    return this.page.getByRole("main").getByRole("alert");
  }
  async open() {
    await this.page.goto(proOrigin + "/auth/login");
  }
  async openInvalidCallback(next: string) {
    await this.page.goto(
      proOrigin +
        "/auth/callback?code=invalid&next=" +
        encodeURIComponent(next),
    );
  }
  async fillCredentials(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
  }
  async submitByKeyboard() {
    await activateByKeyboard(this.submitButton);
  }
}
