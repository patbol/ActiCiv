import { ESLint } from "eslint";
import { describe, it, expect } from "vitest";

const eslint = new ESLint();
async function messages(code: string, filePath = "e2e/probe.spec.ts") {
  const results = await eslint.lintText(code, { filePath });
  return results.flatMap((r) => r.messages);
}
const scenario = (tags: string, suite = "'@route:auth', '@component:login'") =>
  `import { test } from "@playwright/test";
  test.describe("auth", { tag: [${suite}] }, () => {
    test("logs in", { tag: [${tags}] }, async () => {});
  });`;

describe("E2E metadata", () => {
  it.each([
    ["missing criticality", ""],
    ["multiple criticalities", "'@critical', '@high'"],
    ["duplicate criticality", "'@critical', '@critical'"],
    ["unknown status", "'@critical', '@flaky'"],
    ["unknown type", "'@critical', '@type:random'"],
    ["malformed route", "'@critical', '@route:Auth_Login'"],
  ])("rejects %s", async (_name, tags) => {
    expect(
      (await messages(scenario(tags))).some(
        (m) => m.ruleId === "acticiv/e2e-metadata",
      ),
    ).toBe(true);
  });
  it.each(["", "'@route:auth'", "'@component:login'"])(
    "requires route and component on a containing suite: %s",
    async (suite) => {
      expect(
        (await messages(scenario("'@critical'", suite))).some(
          (m) => m.ruleId === "acticiv/e2e-metadata",
        ),
      ).toBe(true);
    },
  );
  it("rejects inherited criticality and dynamic metadata", async () => {
    for (const code of [
      scenario("'@critical'", "'@route:auth', '@component:login', '@high'"),
      scenario("'@critical'").replace("tag: ['@critical']", "tag: tags"),
      scenario("'@critical'").replace(
        'test("logs in"',
        'test("logs in @critical"',
      ),
      scenario("'@critical'").replace("async () => {}", "undefined"),
    ])
      expect(
        (await messages(code)).some((m) => m.ruleId === "acticiv/e2e-metadata"),
      ).toBe(true);
  });
  it("accepts static metadata, aliases, loops and inherited suite tags", async () => {
    for (const code of [
      scenario("'@critical', '@type:security'"),
      scenario("'@medium'")
        .replaceAll("test", "check")
        .replace("@playwright/check", "@playwright/test")
        .replace("import { check }", "import { test as check }"),
      `import { test } from "@playwright/test";
      for (const surface of ["citizen", "pro"]) {
        test.describe(surface, { tag: "@route:foundation" }, () => {
          test.describe("dialog", { tag: "@component:dialog" }, () => {
            test(surface, { tag: "@high" }, async () => {});
          });
        });
      }`,
    ])
      expect(
        (await messages(code)).filter((m) => m.ruleId?.startsWith("acticiv/")),
      ).toEqual([]);
  });
  it.each([
    "import { test } from '@playwright/test'; const run = test; run('untagged', async () => {});",
    "import { test } from '@playwright/test'; const suite = test.describe; suite('untagged', () => {});",
    scenario("'@critical'").replace(
      "tag: ['@critical']",
      "tag: ['@critical'], ...hidden",
    ),
  ])("rejects indirection that can hide test metadata: %s", async (code) => {
    expect(
      (await messages(code)).some((m) => m.ruleId === "acticiv/e2e-metadata"),
    ).toBe(true);
  });
});

describe("E2E execution hygiene", () => {
  it.each([
    "test.only('x', () => {});",
    "test.describe.only('x', () => {});",
    "test.describe.serial.only('x', () => {});",
    "test['only']('x', () => {});",
    "const focus = test.only; focus('x', () => {});",
    "const { only: focus } = test; focus('x', () => {});",
    "fit('x', () => {});",
    "fdescribe('x', () => {});",
    "test.skip(true, 'not approved');",
    "test.fixme('x', () => {});",
    "test.describe.skip('x', () => {});",
    "xit('x', () => {});",
    "page.waitForTimeout(100);",
    "const pause = page['waitForTimeout']; pause(100);",
    "const { waitForTimeout: pause } = page; pause(100);",
  ])(
    "rejects focus, unapproved omission or arbitrary wait: %s",
    async (code) => {
      expect(
        (await messages(code, "e2e/helpers/probe.ts")).some(
          (m) => m.ruleId === "acticiv/e2e-execution",
        ),
      ).toBe(true);
    },
  );
  it("accepts observable waits and timeouts on assertions", async () => {
    expect(
      (
        await messages(
          "await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });",
          "e2e/helpers/probe.ts",
        )
      ).filter((m) => m.ruleId?.startsWith("acticiv/")),
    ).toEqual([]);
  });
});

describe("production boundaries", () => {
  it.each([
    "console.log('debug');",
    "console.debug('debug');",
    "console.trace();",
    "console['log']('debug');",
    "const log = console.log; log('debug');",
    "const {log} = console; log('debug');",
    "window.console.debug('debug');",
    "const {console: output} = window; output.log('debug');",
    "gtag('event', 'x');",
    "window.gtag('event', 'x');",
    "globalThis['gtag']('event', 'x');",
    "window.dataLayer.push({event: 'x'});",
    "const {gtag: track} = window; track('event');",
    "import analytics from '@next/third-parties/google'; export { analytics };",
    "export { GoogleAnalytics } from '@next/third-parties/google';",
    "const x = import('react-gtm-module'); export {x};",
    "import { test } from '@playwright/test'; export {test};",
    "import { helper } from '../../../../e2e/fixtures/test'; export {helper};",
    "import { helper } from './helper.test'; export {helper};",
  ])("rejects production debug/provider/test leakage: %s", async (code) => {
    expect(
      (await messages(code, "apps/pro/src/lib/convention-probe.ts")).some(
        (m) => m.ruleId === "acticiv/production-boundaries",
      ),
    ).toBe(true);
  });
  it("keeps warnings, errors and tool diagnostics available", async () => {
    for (const [file, code] of [
      [
        "packages/backend/src/platform/diagnostic.ts",
        "console.warn('safe code'); console.error('safe code');",
      ],
      ["scripts/probe.mjs", "console.log('tool output');"],
      ["packages/types/src/probe.test.ts", "console.debug('test diagnostic');"],
    ])
      expect(
        (await messages(code!, file!)).filter((m) =>
          m.ruleId?.startsWith("acticiv/"),
        ),
      ).toEqual([]);
  });
});
