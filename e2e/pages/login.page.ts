import type { Page } from "@playwright/test";
import { activateByKeyboard, proOrigin } from "../helpers/ui";
export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly locale: "fr-FR" | "en-GB" = "fr-FR",
  ) {}
  get heading() {
    return this.page.getByRole("heading", {
      name:
        this.locale === "fr-FR"
          ? "Connexion professionnelle"
          : "Professional sign in",
      exact: true,
    });
  }
  get email() {
    return this.page.getByRole("textbox", {
      name: this.locale === "fr-FR" ? "Adresse email" : "Email address",
      exact: true,
    });
  }
  get password() {
    return this.page.getByLabel(
      this.locale === "fr-FR" ? "Mot de passe" : "Password",
      { exact: true },
    );
  }
  get submitButton() {
    return this.page.getByRole("button", {
      name: this.locale === "fr-FR" ? "Se connecter" : "Sign in",
      exact: true,
    });
  }
  get recoveryLink() {
    return this.page.getByRole("link", {
      name: this.locale === "fr-FR" ? "Mot de passe oublié" : "Forgot password",
      exact: true,
    });
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
