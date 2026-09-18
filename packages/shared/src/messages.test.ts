import { expect, it } from "vitest";
import { loadDialogMessages } from "./messages/demo";
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

it("preserves complete DEMO catalogues outside the production catalogue", async () => {
  const fr = await loadDialogMessages("fr-FR");
  const en = await loadDialogMessages("en-GB");
  expect(Object.keys(fr)).toEqual(Object.keys(en));
  for (const value of Object.values(en))
    expect(value.trim().length).toBeGreaterThan(0);
  expect(await loadMessages("fr-FR")).not.toHaveProperty("dialog");
  expect(await loadMessages("en-GB")).not.toHaveProperty("dialog");
});

import { loadQualityMessages } from "./messages/quality";
it("quality catalogues are complete and stay outside Citizen catalogue", async () => {
  const fr = await loadQualityMessages("fr-FR"),
    en = await loadQualityMessages("en-GB");
  expect(Object.keys(fr)).toEqual(Object.keys(en));
  for (const v of Object.values(en)) expect(v.trim().length).toBeGreaterThan(0);
  expect(await loadMessages("fr-FR")).not.toHaveProperty("quality");
});
