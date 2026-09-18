import type { Page } from "@playwright/test";
import { proOrigin } from "../helpers/ui";
export class QualityPage {
  constructor(readonly page: Page) {}
  get heading() {
    return this.page.getByRole("heading", {
      name: "Centre qualité",
      exact: true,
    });
  }
  get main() {
    return this.page.getByRole("main");
  }
  async open(run?: string) {
    await this.page.goto(
      proOrigin + "/quality" + (run ? "?run=" + encodeURIComponent(run) : ""),
    );
  }
  get denied() {
    return this.main.getByRole("alert");
  }
  get suites() {
    return this.page.getByRole("region", { name: "Tests", exact: true });
  }
}
