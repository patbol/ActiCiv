import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { qualityCenter, type ValidView } from "@acticiv/backend/quality";
import { professionalClient } from "../../lib/auth";
import { AuthHeading } from "../../components/auth-feedback";
import styles from "./quality.module.css";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return { title: (await getTranslations("quality"))("title") };
}
type Query = Record<string, string | string[] | undefined>;
const scalar = (q: Query, key: string) =>
  typeof q[key] === "string" ? (q[key] as string) : "";
export default async function Quality({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const q = await searchParams,
    t = await getTranslations("quality"),
    locale = await getLocale();
  const number = (n: number | null | undefined) =>
    n == null
      ? t("unknown")
      : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
  const date = (s: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(s)) + " UTC";
  let data;
  try {
    data = await qualityCenter(await professionalClient(), {
      run: scalar(q, "run"),
      environment: scalar(q, "environment"),
      status: scalar(q, "status"),
      offset: Number(scalar(q, "offset")) || 0,
      baseline: scalar(q, "baseline"),
    });
  } catch (error) {
    return (
      <main id="main" className={styles.page}>
        <AuthHeading>{t("title")}</AuthHeading>
        <p role="alert">
          {t(
            error instanceof Error && error.message === "QUALITY_FORBIDDEN"
              ? "forbidden"
              : "unavailable",
          )}
        </p>
        <Link href="/auth/login">{t("login")}</Link>
      </main>
    );
  }
  const detail = data.detail;
  const href = (run: string) => "/quality?run=" + encodeURIComponent(run);
  const status = (s: string) => (
    <span
      className={
        s === "FAIL"
          ? styles.fail
          : s === "DEFERRED"
            ? styles.deferred
            : styles.status
      }
    >
      {s}
    </span>
  );
  const count = (r: ValidView, s: string) =>
    r.gates.filter((g) => g.status === s).length;
  const selected = detail?.state === "valid" ? detail : null;
  const summary = (r: ValidView) => (
    <>
      <p className={styles.verdict}>
        {t("verdict")} : {status(r.verdict)}
      </p>
      <dl className={styles.identity}>
        <dt>SHA</dt>
        <dd>
          <code>{r.sha}</code>
        </dd>
        <dt>{t("environment")}</dt>
        <dd>{r.environment}</dd>
        <dt>{t("policy")}</dt>
        <dd>{r.policy} · advisory</dd>
        <dt>{t("date")}</dt>
        <dd>{date(r.created_at)}</dd>
        <dt>{t("sources")}</dt>
        <dd>{r.dirty ? t("dirty") : t("clean")}</dd>
        <dt>{t("baseline")}</dt>
        <dd>
          {t(
            r.baseline === "ACCEPTED"
              ? "accepted"
              : r.baseline === "CANDIDATE"
                ? "candidate"
                : "noBaseline",
          )}
        </dd>
      </dl>
      <p>
        {["PASS", "FAIL", "DEFERRED", "NOT_APPLICABLE"].map((s) => (
          <span key={s} className={styles.count}>
            {s} : {number(count(r, s))}
          </span>
        ))}
      </p>
    </>
  );
  return (
    <main id="main" className={styles.page}>
      <header>
        <AuthHeading>{t("title")}</AuthHeading>
        <p>{t("intro")}</p>
        <Link href="/espace">{t("back")}</Link>
      </header>
      <nav aria-label={t("navigation")} className={styles.nav}>
        <a href="#history">{t("history")}</a>
        {selected && (
          <>
            <a href="#gates">{t("gates")}</a>
            <a href="#security">{t("security")}</a>
            <a href="#tests">{t("tests")}</a>
            <a href="#coverage">{t("coverage")}</a>
            <a href="#provenance">{t("provenance")}</a>
          </>
        )}
      </nav>
      {data.state === "unconfigured" && (
        <p role="status">{t("unconfigured")}</p>
      )}
      {!detail && data.runs[0]?.state === "invalid" && (
        <p role="alert">{t("invalid")}</p>
      )}
      {detail?.state === "invalid" && <p role="alert">{t("invalid")}</p>}
      {!detail && data.runs[0]?.state === "valid" && (
        <section aria-labelledby="latest">
          <h2 id="latest">{t("latest")}</h2>
          {summary(data.runs[0])}
          <Link href={href(data.runs[0].id)}>{t("details")}</Link>
        </section>
      )}
      {selected && (
        <>
          <section>
            <h2>{t("readiness")}</h2>
            <p>
              {selected.id} · {selected.branch}
            </p>
            {summary(selected)}
            {selected.gates.some(
              (g) => g.status === "FAIL" || g.status === "DEFERRED",
            ) && (
              <aside className={styles.attention}>
                <h3>{t("attention")}</h3>
                <ul>
                  {selected.gates
                    .filter(
                      (g) => g.status === "FAIL" || g.status === "DEFERRED",
                    )
                    .sort(
                      (a, b) =>
                        Number(b.status === "FAIL") -
                        Number(a.status === "FAIL"),
                    )
                    .map((g) => (
                      <li key={g.id}>
                        {status(g.status)} — <a href="#gates">{g.id}</a> :{" "}
                        {g.reason}
                      </li>
                    ))}
                </ul>
              </aside>
            )}
          </section>
          <section id="gates">
            <h2>{t("gates")}</h2>
            <p>{t("canonical")}</p>
            <div
              className={styles.scroll}
              tabIndex={0}
              role="region"
              aria-label={t("gates")}
            >
              <table>
                <caption>{t("gates")}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t("check")}</th>
                    <th scope="col">{t("status")}</th>
                    <th scope="col">{t("reason")}</th>
                    <th scope="col">{t("evidence")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.gates.map((g) => (
                    <tr key={g.id}>
                      <th scope="row">{g.id}</th>
                      <td>{status(g.status)}</td>
                      <td>{g.reason}</td>
                      <td>
                        {g.evidence ? (
                          <a href="#provenance">
                            <code>{g.evidence}</code>
                          </a>
                        ) : (
                          t("missing")
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section id="security">
            <h2>{t("security")}</h2>
            <p>{t("securityScope")}</p>
            {selected.checks
              .filter((c) =>
                ["sast", "dast", "dependency-audit", "secret-scan"].includes(
                  c.id,
                ),
              )
              .map((c) => (
                <p key={c.id}>
                  {c.id} : {status(c.status)} · {c.reason}
                </p>
              ))}
            {selected.findings.length ? (
              <ul>
                {selected.findings.map((f, i) => (
                  <li key={i}>
                    <strong>
                      {f.severity} · {f.status}
                    </strong>{" "}
                    — {f.tool} / {f.category}
                    <p>{f.summary}</p>
                    <p>
                      {t("acceptedRisk")} : {f.accepted ? t("yes") : t("no")} ·{" "}
                      {t("owner")} : {f.owner} · {t("expiry")} : {f.expiry} ·{" "}
                      {t("retest")} : {f.retest}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("noFindings")}</p>
            )}
          </section>
          <section id="tests" aria-labelledby="test-heading">
            <h2 id="test-heading">{t("tests")}</h2>
            <form method="get" className={styles.filters}>
              <input type="hidden" name="run" value={selected.id} />
              <label>
                {t("testFilter")}
                <input
                  name="tag"
                  defaultValue={scalar(q, "tag")}
                  placeholder="@critical"
                  maxLength={100}
                />
              </label>
              <button type="submit">{t("filter")}</button>
            </form>
            {selected.checks
              .filter((c) => c.tests.length)
              .map((c) => (
                <details key={c.id} open={scalar(q, "check") === c.id}>
                  <summary>
                    {c.id} — {status(c.status)} · {number(c.passed)}{" "}
                    {t("passed")} / {number(c.failed)} {t("failed")} ·{" "}
                    {number(c.skipped)} {t("skipped")} · {number(c.retries)}{" "}
                    retries · {number(c.flaky)} flaky
                  </summary>
                  <p>
                    {t("suites")} : {number(c.suites)} · {t("duration")} :{" "}
                    {number(c.duration_ms)} ms
                  </p>
                  <p>
                    <Link
                      href={
                        href(selected.id) +
                        "&check=" +
                        encodeURIComponent(c.id) +
                        "#tests"
                      }
                    >
                      {t("permalink")}
                    </Link>
                  </p>
                  <ul>
                    {c.tests
                      .filter(
                        (test) =>
                          !scalar(q, "tag") ||
                          test.tags.includes(scalar(q, "tag")),
                      )
                      .slice(0, 100)
                      .map((test, i) => (
                        <li key={i}>
                          {test.id} — {test.final_status} ·{" "}
                          {number(test.duration_ms)} ms · retries{" "}
                          {test.retry_count} · flaky {String(test.flaky)}
                          <small>{test.tags.join(" · ")}</small>
                        </li>
                      ))}
                  </ul>
                  <p>{t("testLimit")}</p>
                </details>
              ))}
          </section>
          <section id="coverage">
            <h2>{t("coverage")}</h2>
            <p>{t("coverageScope")}</p>
            <p>{t("advisory")}</p>
            {selected.coverage ? (
              <div
                className={styles.scroll}
                tabIndex={0}
                role="region"
                aria-label={t("coverage")}
              >
                <table>
                  <caption>{t("coverage")}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{t("module")}</th>
                      {["statements", "branches", "functions", "lines"].map(
                        (k) => (
                          <th key={k} scope="col">
                            {t(k)}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries({
                      [t("global")]: selected.coverage.global,
                      ...selected.coverage.modules,
                    }).map(([name, m]) => (
                      <tr key={name}>
                        <th scope="row">{name}</th>
                        {(
                          [
                            "statements",
                            "branches",
                            "functions",
                            "lines",
                          ] as const
                        ).map((k) => (
                          <td key={k}>
                            {m[k].pct === null
                              ? t("unknown")
                              : number(m[k].pct) + " %"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>{t("missing")}</p>
            )}
          </section>
          <section>
            <h2>{t("comparison")}</h2>
            <form method="get" className={styles.filters}>
              <input type="hidden" name="run" value={selected.id} />
              <label>
                {t("compareWith")}
                <select name="baseline" defaultValue={scalar(q, "baseline")}>
                  <option value="">{t("choose")}</option>
                  {data.runs
                    .filter((r) => r.state === "valid" && r.id !== selected.id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.id}
                        {r.state === "valid" ? " · " + r.baseline : ""}
                      </option>
                    ))}
                </select>
              </label>
              <button type="submit">{t("compare")}</button>
            </form>
            <p>{t("observed")}</p>
            {data.comparison.state === "NONE" ? (
              <p>{t("noComparison")}</p>
            ) : data.comparison.state === "INCOMPATIBLE" ? (
              <p>{t("incompatible")}</p>
            ) : (
              <>
                <p>
                  {t("tests")} Δ : {number(data.comparison.tests)}
                </p>
                <ul>
                  {Object.entries(data.comparison.coverage ?? {}).map(
                    ([key, v]) => (
                      <li key={key}>
                        {t(key)} Δ : {number(v)}
                      </li>
                    ),
                  )}
                  {data.comparison.moduleCoverage?.map((m) => (
                    <li key={m.name}>
                      {m.name} Δ : {number(m.delta)}
                    </li>
                  ))}
                  {data.comparison.performance?.map((m) => (
                    <li key={m.name}>
                      {m.name} Δ : {number(m.delta)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
          <section>
            <h2>{t("artifactPerformance")}</h2>
            <p>{t("advisory")}</p>
            <p>{t("sourceMaps")}</p>
            {selected.artifacts.map((a) => (
              <p key={a.app}>
                {a.app} · {t("files")} {number(a.files)} · {t("findings")}{" "}
                {a.findings} · <code>{a.digest ?? t("missing")}</code>
              </p>
            ))}
            {selected.checks
              .filter((c) =>
                ["artifact", "bundles", "performance"].includes(c.id),
              )
              .map((c) => (
                <details key={c.id}>
                  <summary>
                    {c.id} : {status(c.status)}
                  </summary>
                  <p>{c.reason}</p>
                  <dl>
                    {c.metrics.map((m) => (
                      <div key={m.name}>
                        <dt>{m.name}</dt>
                        <dd>{number(m.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ))}
            <p>{t("latencyScope")}</p>
          </section>
          <section>
            <h2>{t("accessibility")}</h2>
            <h3>{t("automated")}</h3>
            {selected.checks
              .filter((c) => c.id === "axe")
              .map((c) => (
                <div key={c.id}>
                  <p>axe : {status(c.status)}</p>
                  <dl>
                    {c.metrics.map((m) => (
                      <div key={m.name}>
                        <dt>{m.name}</dt>
                        <dd>{number(m.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            <h3>{t("manual")}</h3>
            {selected.manual.length ? (
              selected.manual.map((m, i) => (
                <p key={i}>
                  <strong>
                    {m.tool} : {status(m.status)}
                  </strong>{" "}
                  — {m.scope}
                </p>
              ))
            ) : (
              <p>{t("missing")}</p>
            )}
            <p>{t("manualScope")}</p>
          </section>
          <section>
            <h2>{t("docs")}</h2>
            {selected.checks
              .filter((c) => c.id === "docs")
              .map((c) => (
                <div key={c.id}>
                  <p>
                    {status(c.status)} · {c.reason}
                  </p>
                  <dl>
                    {c.metrics.map((m) => (
                      <div key={m.name}>
                        <dt>{m.name}</dt>
                        <dd>{number(m.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            {!selected.checks.some((c) => c.id === "docs") && (
              <p>{t("missing")}</p>
            )}
          </section>
          <section id="provenance">
            <h2>{t("provenance")}</h2>
            <dl>
              {[
                ["run_id", selected.id],
                ["SHA", selected.sha],
                ["environment", selected.environment],
                ["snapshot_digest", selected.digest],
                ["source_digest", selected.source_digest],
                ["policy_digest", selected.policy_digest],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>
                    <code>{v}</code>
                  </dd>
                </div>
              ))}
            </dl>
            <details>
              <summary>{t("evidence")}</summary>
              <dl>
                {selected.provenance.map((p) => (
                  <div key={p.id}>
                    <dt>{p.id}</dt>
                    <dd>
                      <code>{p.digest}</code>
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
            {selected.artifact ? (
              <p>
                {selected.artifact.expired ? (
                  t("expired")
                ) : (
                  <a href={selected.artifact.url} rel="noreferrer">
                    {t("artifactLink")}
                  </a>
                )}{" "}
                ·{" "}
                {selected.artifact.expires_at
                  ? date(selected.artifact.expires_at)
                  : t("expiryUnknown")}
              </p>
            ) : (
              <p>{t("artifactAbsent")}</p>
            )}
          </section>
        </>
      )}
      <section id="history">
        <h2>{t("history")}</h2>
        <form method="get" className={styles.filters}>
          <label>
            {t("environment")}
            <select name="environment" defaultValue={scalar(q, "environment")}>
              <option value="">{t("all")}</option>
              <option value="local">local</option>
              <option value="ci-local">ci-local</option>
            </select>
          </label>
          <label>
            {t("status")}
            <select name="status" defaultValue={scalar(q, "status")}>
              <option value="">{t("all")}</option>
              {["PASS", "FAIL", "DEFERRED", "NOT_APPLICABLE"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <button type="submit">{t("filter")}</button>
        </form>
        {!data.runs.length ? (
          <p>{t("empty")}</p>
        ) : (
          <div
            className={styles.scroll}
            tabIndex={0}
            role="region"
            aria-label={t("history")}
          >
            <table>
              <caption>{t("runs")}</caption>
              <thead>
                <tr>
                  {[
                    "run",
                    "environment",
                    "status",
                    "date",
                    "policy",
                    "deltas",
                  ].map((k) => (
                    <th scope="col" key={k}>
                      {t(k)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.runs.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">
                      <Link href={href(r.id)}>{r.id}</Link>
                      {r.state === "valid" && <small>{r.sha}</small>}
                    </th>
                    {r.state === "valid" ? (
                      <>
                        <td>{r.environment}</td>
                        <td>{status(r.verdict)}</td>
                        <td>{date(r.created_at)}</td>
                        <td>{r.policy}</td>
                        <td>
                          {data.historyDeltas[r.id] ? (
                            <>
                              <Link
                                href={
                                  href(r.id) +
                                  "&baseline=" +
                                  encodeURIComponent(
                                    data.historyDeltas[r.id]!.base,
                                  )
                                }
                              >
                                {t("compare")}
                              </Link>
                              <small>
                                {t("tests")} Δ{" "}
                                {number(data.historyDeltas[r.id]!.tests)} ·{" "}
                                {t("lines")} Δ{" "}
                                {number(data.historyDeltas[r.id]!.lines)}
                              </small>
                            </>
                          ) : (
                            t("noComparison")
                          )}
                        </td>
                      </>
                    ) : (
                      <td colSpan={5}>{t("invalid")}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.hasMore && (
          <Link
            href={
              "/quality?" +
              new URLSearchParams({
                offset: String((Number(scalar(q, "offset")) || 0) + 25),
                environment: scalar(q, "environment"),
                status: scalar(q, "status"),
              })
            }
          >
            {t("next")}
          </Link>
        )}
      </section>
    </main>
  );
}
