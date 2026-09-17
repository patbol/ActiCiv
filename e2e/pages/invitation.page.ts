import type { Page } from "@playwright/test";
import { activateByKeyboard, proOrigin } from "../helpers/ui";
export class InvitationPage {
  constructor(private readonly page: Page) {}
  get heading() {
    return this.page.getByRole("heading", {
      name: "Activer mon accès professionnel",
      exact: true,
    });
  }
  get displayName() {
    return this.page.getByRole("textbox", {
      name: "Nom d’affichage",
      exact: true,
    });
  }
  get submitButton() {
    return this.page.getByRole("button", {
      name: "Accepter l’invitation",
      exact: true,
    });
  }
  get error() {
    return this.page.getByRole("main").getByRole("alert");
  }
  get unavailableNotice() {
    return this.page.getByText("Aucune invitation à activer.");
  }
  get spaceLink() {
    return this.page.getByRole("link", {
      name: "Accéder à mon espace",
      exact: true,
    });
  }
  async openUnavailable() {
    await this.page.goto(proOrigin + "/auth/accept?error=1");
  }
  async submitByKeyboard() {
    await activateByKeyboard(this.submitButton);
  }
}
