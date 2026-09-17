import { it, expect } from "vitest";
import { minimize } from "./collect";
it("drops native Playwright config, environment, errors, screenshots and HTML from public artifacts", () => {
  const r = minimize("e2e", {
    config: { secret: "private" },
    errors: [{ message: "private" }],
    stats: {},
    suites: [
      {
        specs: [
          {
            id: "x",
            title: "test",
            tags: ["@critical"],
            tests: [
              {
                projectName: "desktop",
                status: "expected",
                results: [
                  {
                    status: "passed",
                    retry: 0,
                    duration: 1,
                    stdout: ["private"],
                    attachments: [
                      { name: "screenshot", path: "private" },
                      { name: "acticiv-axe", body: "e30=" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  expect(JSON.stringify(r)).not.toContain("private");
  expect(JSON.stringify(r)).toContain("acticiv-axe");
});

import { loadEvidence } from "./collect";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
it("accepts the e2e report name and rejects path traversal or altered reports", () => {
  const dir = mkdtempSync(join(tmpdir(), "quality-evidence-"));
  try {
    mkdirSync(join(dir, "reports"));
    const report = { suites: [] },
      bytes = JSON.stringify(report);
    writeFileSync(join(dir, "reports/e2e.json"), bytes);
    const entry = {
      source: "e2e",
      report,
      reference: {
        path: "reports/e2e.json",
        sha256: createHash("sha256").update(bytes).digest("hex"),
      },
    };
    const save = (e: unknown) =>
      writeFileSync(
        join(dir, "manifest.json"),
        JSON.stringify({ completed: true, identity: {}, evidence: [e] }),
      );
    save(entry);
    expect(loadEvidence(dir).evidence).toHaveLength(1);
    save({ ...entry, reference: { ...entry.reference, path: "../e2e.json" } });
    expect(() => loadEvidence(dir)).toThrow();
    save(entry);
    writeFileSync(join(dir, "reports/e2e.json"), "{}");
    expect(() => loadEvidence(dir)).toThrow();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

import { readSnapshot, finalize } from "./storage";
import { assemble } from "./snapshot";
it("refuses reading a finalized snapshot when a referenced report has changed", () => {
  const root = mkdtempSync(join(tmpdir(), "quality-integrity-"));
  try {
    const identity = {
      schema_version: 1,
      project: "ActiCiv",
      commit_sha: "a".repeat(40),
      branch: "test",
      environment: "local",
      created_at: "2026-09-18T00:00:00Z",
      producer: "test",
      run_id: "integrity",
      source_digest: "b".repeat(64),
      dirty: false,
      versions: { node: "24" },
    };
    const report = { complete: true, tool_status: "completed", passed: true },
      bytes = JSON.stringify(report);
    const s = assemble(
      identity,
      [
        {
          identity,
          source: "format",
          exit_code: 0,
          duration_ms: 1,
          report,
          reference: {
            path: "reports/format.json",
            sha256: createHash("sha256").update(bytes).digest("hex"),
          },
        },
      ],
      {
        version: "v1",
        mode: "advisory",
        rules: [{ id: "format", source: "format", required: true }],
      },
    );
    const path = finalize(root, s);
    mkdirSync(join(root, "integrity/reports"));
    writeFileSync(join(root, "integrity/reports/format.json"), bytes);
    expect(readSnapshot(path).gate_evaluation.status).toBe("PASS");
    writeFileSync(join(root, "integrity/reports/format.json"), "{}");
    expect(() => readSnapshot(path)).toThrow();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
