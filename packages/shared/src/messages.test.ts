import { expect, it } from "vitest";
import { loadMessages } from "./messages";
it("both server catalogues have identical nonempty semantic keys", async () => {
  const fr = await loadMessages("fr-FR"),
    en = await loadMessages("en-GB");
  expect(Object.keys(fr)).toEqual(Object.keys(en));
  for (const domain of Object.keys(fr) as (keyof typeof fr)[]) {
    expect(Object.keys(fr[domain])).toEqual(Object.keys(en[domain]));
    for (const value of Object.values(en[domain]))
      expect(value.trim().length).toBeGreaterThan(0);
  }
});
