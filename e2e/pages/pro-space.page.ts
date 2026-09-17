import type { Page } from "@playwright/test";
import { activateByKeyboard, proOrigin } from "../helpers/ui";
export class ProSpacePage {
  constructor(private readonly page: Page) {}
  get activeMembership() {
    return this.page.getByText("Votre accès professionnel est actif.", {
      exact: true,
    });
  }
  get noMembership() {
    return this.page.getByText("Aucun accès professionnel actif.", {
      exact: false,
    });
  }
  get logoutButton() {
    return this.page.getByRole("button", {
      name: "Se déconnecter",
      exact: true,
    });
  }
  get deniedResponse() {
    return this.page.getByText(/Accès refusé/);
  }
  async logoutByKeyboard() {
    await activateByKeyboard(this.logoutButton);
  }
  async openConfigurationResponse() {
    await this.page.goto(proOrigin + "/api/configuration");
  }
}
