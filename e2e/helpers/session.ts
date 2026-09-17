import type { Page } from "@playwright/test";
import { proOrigin } from "./ui";

export async function confirmSession(
  page: Page,
  token: string,
  type: "recovery" | "invite",
) {
  return page.request.get(
    `${proOrigin}/auth/confirm?token_hash=${encodeURIComponent(token)}&type=${type}`,
    { maxRedirects: 0 },
  );
}
export async function configurationStatus(page: Page) {
  return (await page.request.get(proOrigin + "/api/configuration")).status();
}
// Deliberately keep browser fetch: it proves same-origin cookies/CSRF and tenant checks.
export async function saveServiceInBrowser(page: Page, organizationId: string) {
  return page.evaluate(async (org) => {
    const response = await fetch("/api/configuration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "service.save",
        organizationId: org,
        code: "accessibility",
        name: "Accessibilité",
        status: "active",
      }),
    });
    return response.status;
  }, organizationId);
}
