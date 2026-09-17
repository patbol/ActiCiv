// Native node:test event stream; failures/log payloads are deliberately omitted.
export default async function* report(source) {
  const tests = [];
  let final = null;
  for await (const event of source) {
    const d = event.data;
    if (
      (event.type === "test:pass" || event.type === "test:fail") &&
      d.details?.type !== "suite"
    ) {
      tests.push({
        id: d.name,
        final_status:
          d.skip || d.todo
            ? "skipped"
            : event.type === "test:pass"
              ? "passed"
              : "failed",
        retry_count: 0,
        flaky: false,
        duration_ms: d.details?.duration_ms ?? 0,
        tags: ["integration", "security"],
      });
    }
    if (event.type === "test:summary" && d.file === undefined) final = d;
  }
  const passed = tests.filter((t) => t.final_status === "passed").length,
    skipped = tests.filter((t) => t.final_status === "skipped").length,
    failed = tests.length - passed - skipped;
  yield JSON.stringify({
    complete: final !== null,
    summary: {
      status:
        final?.success && tests.length > 0 && !failed && !skipped
          ? "PASS"
          : "FAIL",
      passed,
      failed,
      skipped,
      retries: 0,
      flaky: 0,
      suites: final?.counts?.suites ?? 0,
      duration_ms: final?.duration_ms ?? 0,
      tests,
      metrics: {},
      reason: "node:test native events",
    },
  }) + "\n";
}
