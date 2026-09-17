# ActiCiv — Phase 2 bis — Exhaustiveness Checklist v1.2

Date: 17 septembre 2026
Purpose: cross-check the decisions validated with Patrick against the Product & Technical Book v1.4 and the Phase 2 bis Master Prompt v1.2.

| Area | Locked content checked | Book v1.4 | Prompt v1.2 |
|---|---|---:|---:|
| POM | Pragmatic POM + Component Objects + readable specs | PASS | PASS |
| Locators | Accessible locators first; testid only when justified | PASS | PASS |
| Test tagging | `@critical/@high/@medium/@low` on tests | PASS | PASS |
| Route tagging | `@route:*` at suite/describe level | PASS | PASS |
| Component tagging | `@component:*` at suite/describe level | PASS | PASS |
| Optional type tags | security/a11y/smoke/regression | PASS | PASS |
| Targeted runs | Execute by criticality, route, component, combinations | PASS | PASS |
| TDD | Test-first on critical business/security logic | PASS | PASS |
| Regression | Repro test before bug fix when reasonably possible | PASS | PASS |
| Test behavior | Test observable behavior, not private implementation | PASS | PASS |
| DoD | Code/tests/coverage/security/a11y/i18n/observability/docs/gates | PASS | PASS |
| PR governance | Acceptance, risk, tests, coverage, security, docs, evidence | PASS | PASS |
| i18n | Locale-first architecture | PASS | PASS |
| Locale model | Language / BCP47 locale / IANA timezone separated | PASS | PASS |
| Locale resolution | Explicit preference, browser/org fallback, deterministic | PASS | PASS |
| Locales exercised | `fr-FR` and `en-GB` | PASS | PASS |
| Formatting | `Intl`, no hardcoded French formats | PASS | PASS |
| Reference labels | Stable business codes independent from translations | PASS | PASS |
| Coverage | statements/branches/functions/lines | PASS | PASS |
| Critical module coverage | Separate visibility / configurable thresholds | PASS | PASS |
| Coverage regression | Delta against accepted baseline | PASS | PASS |
| Structured QA reports | Machine-readable unit/E2E/SQL/a11y/security/build evidence | PASS | PASS |
| QA metadata | Preserve criticality/route/component/type tags | PASS | PASS |
| Aggregation | Canonical quality snapshot by SHA/environment | PASS | PASS |
| PROD baseline | Immutable accepted quality baseline model | PASS | PASS |
| Retries | Release proof does not hide failure with retry | PASS | PASS |
| Flakiness | Separate repeated measurement job | PASS | PASS |
| Retry metrics | Quality Center distinguishes retries/flaky/clean pass | PASS | PASS |
| DEV→DEMO gate | Automated quality gate | PASS | PASS |
| DEMO→PROD gate | Stricter gate model without fake PROD proof | PASS | PASS |
| Artifact promotion | Same SHA/artifact; branch is not release identity | PASS | PASS |
| Gate waivers | Explicit, owned, expiring and auditable | PASS | PASS |
| Security Assurance | Continuous security quality model | PASS | PASS |
| SAST | Static security analysis foundation | PASS | PASS |
| Dependency scan | Vulnerability audit | PASS | PASS |
| Secret scan | Secret scanning | PASS | PASS |
| DAST | DEMO-ready dynamic security scanning | PASS | PASS |
| Auth/RLS security | Tenant, IDOR, privilege, session and bypass scenarios | PASS | PASS |
| Pentest | Independent/manual pentest before real PROD/significant pilot | PASS | PASS |
| Retest | Targeted retest after high/critical remediation | PASS | PASS |
| Cyber readiness | CI/CD, repo protection, supply chain, secrets, backup/restore, incident response | PASS | PASS |
| Security debt | Severity/age/owner/due/retest | PASS | PASS |
| Security gate | 0 critical; 0 unaccepted high for PROD | PASS | PASS |
| Analytics | Product usage, aggregated/minimized | PASS | PASS |
| Audit | Business/security proof, transactional where required | PASS | PASS |
| Logs | Technical diagnostics | PASS | PASS |
| Stream separation | Analytics != Audit != Logs | PASS | PASS |
| Correlation | Shared correlation ID without merging responsibilities | PASS | PASS |
| Analytics taxonomy | `<surface>_<domain>_<action>` | PASS | PASS |
| GA4/GTM | Provider adapter only; no scattered `gtag()` | PASS | PASS |
| Analytics privacy | No email/free text/plate/exact GPS/token/secrets by default | PASS | PASS |
| Structured logs | levels + safe context + no secrets/PII dumps | PASS | PASS |
| Quality Center | Protected Super Admin read-only page | PASS | PASS |
| Quality Center source | Same canonical snapshot as Quality Gates | PASS | PASS |
| Quality Center metrics | coverage/fails/skips/retries/flakiness/a11y/security/gates/history | PASS | PASS |
| Quality Center drill-down | suite/test/module/finding/evidence links | PASS | PASS |
| Quality Center auth | explicit platform capability / trusted ingestion | PASS | PASS |
| Business KB | Structured Markdown Knowledge Base | PASS | PASS |
| KB frontmatter | machine-readable stable IDs and relations | PASS | PASS |
| Feature contract | actors, rights, flows, errors, edge cases, data, observability, tests, ADR, code | PASS | PASS |
| Technical KB | architecture/DB/RLS/Auth/PostGIS/SLA/testing/security/observability/i18n/release | PASS | PASS |
| Traceability | requirement↔KB↔rights↔code↔tests↔observability↔ADR | PASS | PASS |
| Doc update rule | behavioral change updates KB/docs in same PR | PASS | PASS |
| ADR governance | structural decisions; supersede instead of rewriting history | PASS | PASS |
| Persistent Rules | root `AGENTS.md`, concise non-negotiables | PASS | PASS |
| Skills | 15 initial reusable workflow skills | PASS | PASS |
| Change feature skill | impact map before edits | PASS | PASS |
| Fix bug skill | reproduce→test→fix→regression→gates | PASS | PASS |
| Migration skill | constraints/RLS/audit/seeds/rebuild/tests | PASS | PASS |
| Release skill | exact SHA and real gate evidence | PASS | PASS |
| No overengineering | foundations must immediately help Phase 3 / release quality | PASS | PASS |
| No Phase 3 | Phase 2 bis remains non-functional foundation phase | PASS | PASS |
| Postmortem | exhaustive acceptance matrix and evidence | PASS | PASS |
| Executable conventions | Important repeatable conventions enforced automatically | PASS | PASS |
| Prettier/TS/ESLint/architecture stack | Correct tool used for each guardrail layer | PASS | PASS |
| Mandatory criticality lint | Exactly one `@critical/@high/@medium/@low` per Playwright test | PASS | PASS |
| Mandatory route/component metadata | `@route:*` and `@component:*` validated when applicable | PASS | PASS |
| Focus/skip hygiene | `.only` forbidden; skips governed and visible | PASS | PASS |
| Debug hygiene | `console.log/debug/trace` forbidden in production code | PASS | PASS |
| Direct provider guard | No scattered `gtag`/analytics-provider direct calls | PASS | PASS |
| Domain network guard | Domain/application cannot import/use HTTP/network infrastructure | PASS | PASS |
| Production artifact hygiene | Compiled PROD artifact scanned, not only source | PASS | PASS |
| Test hooks in PROD | Test-only `data-testid/data-test/data-cy` absent by default | PASS | PASS |
| Test/dev runtime leakage | No mocks/fixtures/test deps/debug routes in PROD runtime | PASS | PASS |
| Source map policy | Production source maps controlled/not public by default | PASS | PASS |
| Performance hygiene | Unnecessary runtime cost removed or justified | PASS | PASS |
| Performance budgets | Configurable metrics and baseline/delta gates | PASS | PASS |
| Runtime dependency cost | Material dependency cost/alternative reviewed | PASS | PASS |
| Quality Center artifact/perf | Same canonical evidence exposed in Super Admin | PASS | PASS |
| Risk-proportionate rigor | Controls scale with risk/impact, no bureaucracy for trivial changes | PASS | PASS |
| Automation vs human judgment | Objective checks automated, human reviews retained where needed | PASS | PASS |

## Consistency checks

- Book source of truth: **v1.4** — PASS.
- Phase name aligned: **Engineering Quality, Internationalisation & Knowledge Foundations** — PASS.
- Prompt source references Book v1.4 and Prompt v1.2 — PASS.
- Phase 2 must be formally closed before Phase 2 bis starts — PASS.
- No obsolete Book v1.2 reference remains in the current source-of-truth statements — PASS.
- No old Phase 2 bis v1.0 title remains as current contract — PASS.
- Product book rendered A4 and visually reviewed after final edits — PASS.
