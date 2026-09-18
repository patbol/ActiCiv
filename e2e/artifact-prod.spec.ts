import { test, expect } from "./fixtures/test";
import { accessible } from "./helpers/ui";
for (const port of [3000, 3001]) {
  test.describe(
    `PROD surface ${port}`,
    { tag: ["@route:foundation", "@component:production-boundary"] },
    () => {
      test(
        "production home excludes demo and retains accessible navigation",
        { tag: ["@high", "@type:a11y"] },
        async ({ page }) => {
          await page.goto(`http://127.0.0.1:${port}/`);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          await expect(
            page.getByRole("button", { name: "Découvrir le projet" }),
          ).toHaveCount(0);
          await expect(page.getByRole("dialog")).toHaveCount(0);
          await accessible(page);
        },
      );
      test(
        "response headers deny framing and MIME sniffing",
        { tag: ["@high", "@type:security"] },
        async ({ request }) => {
          const response = await request.get(`http://127.0.0.1:${port}/`);
          expect(response.headers()["x-frame-options"]).toBe("DENY");
          expect(response.headers()["x-content-type-options"]).toBe("nosniff");
          expect(response.headers()["referrer-policy"]).toBe(
            "strict-origin-when-cross-origin",
          );
        },
      );
      test(
        "malformed locale and missing assets do not reveal implementation details",
        { tag: ["@high", "@type:security"] },
        async ({ request }) => {
          const origin = `http://127.0.0.1:${port}`;
          for (const response of [
            await request.post(origin + "/api/locale", {
              headers: { origin, "content-type": "application/json" },
              data: '{"locale":',
            }),
            await request.get(origin + "/_next/static/missing.js.map"),
          ]) {
            expect(response.status()).toBeGreaterThanOrEqual(400);
            expect(await response.text()).not.toMatch(
              /(?:Error:\s|SQLSTATE|SUPABASE_SERVICE_ROLE_KEY|\/Users\/|\/home\/runner\/|node_modules\/|at \w+ \()/,
            );
          }
        },
      );
    },
  );
}
test.describe(
  "PROD API error boundaries",
  { tag: ["@route:configuration", "@component:authorization"] },
  () => {
    test(
      "anonymous malformed configuration and platform commands stay generic",
      { tag: ["@critical", "@type:security"] },
      async ({ request }) => {
        for (const route of ["configuration", "platform"]) {
          const response = await request.post(
            `http://127.0.0.1:3001/api/${route}`,
            {
              headers: { origin: "http://127.0.0.1:3001" },
              data: { command: "unknown", organization_id: "' OR 1=1--" },
            },
          );
          expect(response.status()).toBe(400);
          expect(await response.json()).toEqual({
            error: "Opération refusée ou données invalides",
          });
        }
      },
    );
  },
);
