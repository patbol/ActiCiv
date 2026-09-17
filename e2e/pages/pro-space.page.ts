import type { Page } from "@playwright/test";
import { activateByKeyboard, proOrigin } from "../helpers/ui";
export class ProSpacePage {
  constructor(
    private readonly page: Page,
    private readonly locale: "fr-FR" | "en-GB" = "fr-FR",
  ) {}
  get activeMembership() {
    return this.page.getByText(
      this.locale === "fr-FR"
        ? "Votre accès professionnel est actif."
        : "Your professional access is active.",
      {
        exact: true,
      },
    );
  }
  get noMembership() {
    return this.page.getByText(
      this.locale === "fr-FR"
        ? "Aucun accès professionnel actif."
        : "No active professional access.",
      {
        exact: false,
      },
    );
  }
  get logoutButton() {
    return this.page.getByRole("button", {
      name: this.locale === "fr-FR" ? "Se déconnecter" : "Sign out",
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
