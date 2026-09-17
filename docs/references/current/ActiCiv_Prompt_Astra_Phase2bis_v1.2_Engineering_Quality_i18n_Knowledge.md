# ACTICIV — PHASE 2 BIS MASTER PROMPT v1.2

## Engineering Quality + Internationalization + Knowledge Foundations

You are continuing development of the ActiCiv MVP.

This phase is an intentional insertion between Phase 2 and Phase 3.

It exists to install ActiCiv’s engineering operating system before the Citizen Reporting Core multiplies screens, workflows, security surfaces, data paths and E2E scenarios. It must prevent foreseeable debt in test architecture, internationalization, test coverage, release quality, security assurance, observability, documentation and AI/developer working methods.

The phase has no new citizen or operational business workflow. It creates foundations that Phase 3 and every later phase must use.

This prompt is a development contract. Do not silently reinterpret it.

---

# 1. AUTHORITATIVE SOURCES

Apply the following sources in this order:

1. **Latest explicitly validated product/technical decisions**
2. **ActiCiv — Livre Produit & Technique v1.4 FINAL A4**
3. **ActiCiv_Phase2_Decisions.md**
4. **Final accepted Phase 2 postmortem and closure evidence**
5. **This Phase 2 bis Master Prompt v1.2**
6. **Master Development Prompt**
7. Existing ADRs and repository documentation

If two sources conflict, stop and report the conflict instead of choosing silently.

---

# 2. HARD ENTRY GATE — PHASE 2 MUST BE CLOSED

Do not start Phase 2 bis implementation if Phase 2 is not formally accepted.

Current accepted Phase 2 baseline for this contract:

- status: **CLOSED**;
- final SHA: `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`;
- final matrix: **260 PASS / 0 FAIL / 1 DEFERRED**;
- only accepted deferred item: TalkBack, because no validated Android/TalkBack environment was available;
- no Phase 3 business workflow had started at closure.

The historical Phase 2 postmortem remains immutable evidence of the state before final closure. The external closure attestation complements it; do not rewrite historical evidence retroactively.

Before modifying any file, verify:

- Phase 2 closure has **0 mandatory FAIL**;
- the final Phase 2 SHA is identified;
- the working tree is clean;
- `verify` passes on the accepted baseline;
- `verify:full` passes on the accepted baseline;
- the accepted SHA has the required CI evidence;
- no Phase 3 feature has been started.

If any mandatory Phase 2 closure criterion is still open, stop and report exactly which criterion blocks Phase 2 bis.

Do not “fix Phase 2 while doing Phase 2 bis” unless Patrick explicitly authorizes a narrowly scoped prerequisite correction.

---

# 3. PHASE NAME AND SCOPE

You are working only on:

## PHASE 2 BIS — ENGINEERING QUALITY, INTERNATIONALIZATION & KNOWLEDGE FOUNDATIONS

Objectives:

### QA architecture
- introduce a pragmatic Page Object Model for Playwright;
- introduce Component Objects where real reusable UI components justify them;
- migrate the existing Playwright suite without losing coverage;
- make specs read primarily as user/business scenarios;
- centralize reusable UI mechanics and locators;
- add architectural guardrails preventing regression toward duplicated test mechanics.

### Internationalization
- make Citizen and Pro applications locale-aware;
- introduce message catalogs and stable translation keys;
- implement deterministic locale resolution;
- implement explicit locale selection and persistence;
- separate locale/language from timezone;
- introduce locale-aware formatting;
- prepare organization/user locale preferences;
- prepare multilingual display of relevant configurable reference data;
- prove the architecture with at least `fr-FR` and `en-GB`.

### Engineering quality
- formalize pragmatic TDD/test-first for critical business/security logic;
- add test taxonomy and mandatory Playwright tagging;
- add code coverage with global and critical-module visibility;
- normalize machine-readable QA reports and aggregate them by SHA/environment;
- introduce configurable Quality Gates for DEV → DEMO → PROD;
- separate release validation from dedicated flakiness measurement;
- prepare immutable SHA/artifact promotion and production quality baselines;
- create the minimum viable Quality Center data flow and Super Admin read-only view.

### Security Assurance
- integrate/prepare SAST, dependency audit, secret scanning and DAST where meaningful;
- preserve and expand RBAC/RLS/Auth negative security testing;
- define pentest and retest requirements before first real production/pilot;
- define cyber readiness around CI/CD, supply chain, secrets, backup/restore and incident response.

### Observability
- formalize three separate streams: Analytics, Audit and Logs;
- introduce stable analytics taxonomy and privacy rules;
- introduce structured technical logging and correlation IDs;
- ensure no stream is used as a substitute for another.

### Knowledge & engineering governance
- create a structured business Knowledge Base optimized for humans and AI;
- create structured technical documentation;
- complete ADR governance for structural decisions;
- add persistent repository Rules, including root `AGENTS.md`;
- add reusable Skills/workflows for recurring engineering tasks;
- formalize the Definition of Done and PR expectations.

This is a foundation phase, not a product-feature phase.

---

# 4. STRICTLY OUT OF SCOPE

Do NOT implement Phase 3 features.

Specifically do not add:

- citizen report creation;
- report persistence;
- citizen tracking token;
- photo upload workflow;
- citizen geolocation/report routing workflow;
- smart queue;
- agent claim;
- interventions;
- operational transfers;
- duplicate detection;
- report notifications;
- report analytics;
- anti-abuse engine;
- routing winner selection;
- any new business workflow merely to demonstrate i18n or POM.

Do not redesign the product UI beyond the minimum required to expose locale selection cleanly.

Do not introduce native mobile applications.

---

# 5. PRE-IMPLEMENTATION AUDIT — NO FILE MODIFICATION YET

Before coding, audit the exact accepted Phase 2 repository.

Report:

- current path;
- remote;
- branch;
- HEAD SHA;
- `git status --short`;
- Node and pnpm versions after `nvm use`;
- current Playwright structure;
- every existing E2E spec and test count;
- current fixtures/helpers/selectors;
- any duplicated locator/action logic;
- current user-visible string locations in Citizen and Pro;
- existing locale/i18n dependencies, if any;
- organization settings schema;
- professional profile schema;
- vertical/category schema and current display-label fields;
- Auth callback/link structure that could be affected by locale routing;
- current app routing strategy;
- current accessibility coverage of locale controls if any.

Then provide a concise implementation plan and list any migrations/dependencies/ADR changes required.

Do not modify files until this audit/plan is explicitly approved.

---

# 6. QA DECISION — PAGE OBJECT MODEL IS LOCKED

ActiCiv E2E uses a **pragmatic Page Object Model**.

The goal is not “classes everywhere”.

The goal is:

- readable specs;
- reusable UI mechanics;
- stable locators;
- low duplication;
- clear user intent;
- easy maintenance;
- no hidden loss of assertion quality.

---

# 7. TARGET E2E STRUCTURE

Use a structure equivalent to the following when justified by the existing repository:

```text
e2e/
  pages/
    login.page.ts
    pro-space.page.ts
    ...
  components/
    ... only real reusable components ...
  fixtures/
    ...
  helpers/
    ... only non-page technical helpers ...
  *.spec.ts or specs/
```

Do not create empty ceremonial folders.

Do not mechanically force every helper into a class.

Keep pure API/database fixture helpers separate from UI Page Objects.

---

# 8. PAGE OBJECT RESPONSIBILITIES

A Page Object may encapsulate:

- navigation to its surface;
- semantic locators;
- repeated UI actions;
- form completion mechanics;
- waiting for stable UI states;
- reusable accessibility-friendly element access;
- reusable semantic assertions only when they genuinely improve clarity.

Preferred method names communicate intent, for example:

```ts
await loginPage.loginAs(email, password);
await invitationPage.setPassword(password);
await invitationPage.acceptInvitation();
```

Avoid methods such as:

```ts
clickButton1();
fillField2();
getSelectorA();
```

---

# 9. WHAT MUST REMAIN IN THE SPEC

The test spec must remain readable as the scenario.

Keep important business expectations visible in the spec whenever possible.

Example target style:

```ts
test('an invited professional activates their membership', async ({ loginPage, invitationPage, proSpacePage }) => {
  await invitationPage.openFromValidInvitation();
  await invitationPage.setPassword(testPassword);
  await invitationPage.acceptInvitation();

  await expect(proSpacePage.heading).toBeVisible();
  await expect(proSpacePage.activeMembershipIndicator).toBeVisible();
});
```

Do not turn specs into opaque one-line calls such as:

```ts
await invitationPage.completeEverythingAndAssertSuccess();
```

unless the helper represents a deliberately reusable high-level domain action and the actual assertions remain understandable.

---

# 10. LOCATOR POLICY

Priority order:

1. `getByRole`
2. `getByLabel`
3. other semantic/accessibility locators
4. stable visible text when translation does not make it fragile
5. `data-testid` only when a semantic locator is genuinely unsuitable

Do not introduce `data-testid` broadly as a shortcut.

Because the application becomes multilingual, tests must not depend unnecessarily on French literal text.

Where a test is specifically verifying translation, text assertions are expected.

Otherwise prefer roles, labels resolved from locale-aware fixtures/catalogs, or stable semantics.

---

# 11. COMPONENT OBJECTS

Create Component Objects only for UI elements reused across multiple pages/flows, for example:

- language/locale selector;
- shared dialog;
- shared navigation;
- future map/location picker when it actually exists.

Do not create a Component Object for every React component.

The test abstraction follows user interaction boundaries, not the source component tree.

---

# 12. NO GOD PAGE OBJECTS

A Page Object must not become:

- a giant selector registry;
- a fixture factory;
- a database client;
- a business service;
- a global state container;
- an assertion dumping ground.

Split by real user-facing surfaces or reusable components when size/responsibility justifies it.

---

# 13. TEST ISOLATION

Existing ActiCiv guarantees remain mandatory:

- tests are independent;
- no test relies on another test having run;
- no hidden shared mutable state;
- fixtures are deterministic;
- retries remain `0` unless a future explicit policy changes this;
- a POM refactor must not weaken tests to make them pass.

---

# 14. POM MIGRATION REQUIREMENT

Migrate the current Playwright E2E suite in this phase.

Do not leave two competing test styles unless a narrow technical reason is documented.

For every migrated spec:

- preserve the scenario;
- preserve or strengthen assertions;
- preserve accessibility checks;
- preserve desktop/mobile coverage where currently present;
- preserve real Supabase/Auth behavior where currently present;
- remove duplicated UI mechanics now represented by POM/Component Objects.

The migration must be behavior-preserving.

---

# 15. POM ARCHITECTURAL GUARDRAIL

Add a lightweight automated safeguard or review-test approach that makes regressions obvious.

At minimum document and test conventions sufficient to prevent:

- direct duplicated selectors spreading across many specs;
- page objects importing server/backend privileged code;
- business persistence logic inside POMs.

Do not build a custom static-analysis framework unless existing ESLint/tests can express the rule simply.

---

# 16. INTERNATIONALIZATION DECISION — LOCALE-FIRST IS LOCKED

ActiCiv is locale-first.

French is the initial primary language, not an architectural assumption.

Never use translated display strings as business identifiers.

Business rules operate on stable codes/IDs.

---

# 17. THREE DISTINCT CONCEPTS

Keep these separate everywhere:

### Language
Human language, e.g. French or English.

### Locale
BCP 47 formatting/translation context, e.g.:

- `fr-FR`
- `en-GB`
- future `fr-CA`, `en-US`, etc.

### Timezone
IANA timezone, e.g.:

- `Europe/Paris`
- `America/Montreal`

A locale must never silently define the SLA timezone.

`default_locale` and `time_zone` are independent settings.

---

# 18. INITIAL SUPPORTED LOCALES

Phase 2 bis must actively support and test at least:

- `fr-FR`
- `en-GB`

`fr-FR` is the initial platform fallback.

Supported locales must be declared centrally.

Do not scatter arrays of supported locales across components.

Adding a future locale should primarily require:

- adding it to central supported configuration;
- adding its message catalog/translations;
- adding/adjusting tests.

---

# 19. I18N IMPLEMENTATION LIBRARY

Audit compatibility with the actual Next.js/App Router version first.

Prefer a mature SSR-compatible solution such as `next-intl` if it fits the current stack cleanly.

Do not implement a homemade translation framework if an established dependency solves the problem with less risk.

If you choose something other than `next-intl`, justify:

- App Router support;
- server component support;
- client component support;
- SSR/hydration correctness;
- locale negotiation;
- type safety strategy;
- bundle impact;
- maintenance risk.

Add only the dependency actually used.

---

# 20. MESSAGE CATALOGS

All user-visible system copy introduced or migrated in this phase must come from message catalogs where appropriate.

Examples:

- navigation labels;
- buttons;
- form labels;
- validation messages shown to users;
- auth messages;
- status labels;
- accessibility text / aria labels where localized;
- email/auth template copy when technically controlled by the app and in scope.

Use stable semantic keys, for example:

```text
auth.login.title
auth.login.emailLabel
auth.login.submit
navigation.language
common.actions.cancel
```

Avoid keys equal to the French sentence itself.

Do not create a flat catalog of hundreds of anonymous keys such as `text1`, `text2`.

---

# 21. NO USER-FACING HARDCODED FRENCH IN NEW FLOWS

After Phase 2 bis, new user-facing application copy should not be introduced directly as hardcoded French literals unless it is intentionally non-translatable content such as:

- a proper name;
- a legal/external value explicitly stored as content;
- user-entered text;
- debugging/internal logs not shown to end users.

Where practical, migrate current Citizen/Pro visible copy into catalogs during this phase because the current surface area is still small.

Do not translate internal database enum values; translate their presentation.

---

# 22. LOCALE RESOLUTION — CITIZEN

For an unauthenticated citizen, use this precedence:

1. explicit supported locale previously selected by the user and persisted in a cookie;
2. best supported match from browser `Accept-Language`;
3. organization/territory default locale if that context is already known;
4. platform fallback `fr-FR`.

Important:

- do not require organization context merely to choose the initial locale;
- unknown/malformed locale values must safely fall back;
- a user can always override automatic detection using the selector;
- the explicit user choice wins on subsequent visits.

---

# 23. LOCALE RESOLUTION — PROFESSIONAL

For an authenticated professional, use this precedence:

1. explicit locale preference stored on the professional profile;
2. organization default locale;
3. persisted local preference / browser negotiation for initial bootstrap when no profile/org preference is available;
4. platform fallback `fr-FR`.

When an authenticated professional explicitly changes locale:

- persist the preference server-side on their allowed profile setting;
- also keep the current browser/session coherent;
- apply normal authorization/RLS rules;
- do not allow changing another user’s preference unless a future explicitly authorized admin feature exists.

---

# 24. ORGANIZATION DEFAULT LOCALE

Add/prepare an organization-level `default_locale` setting if it is not already present.

Requirements:

- supported locale only;
- default existing organizations safely to `fr-FR` unless a migration strategy proves a better existing value;
- keep `time_zone` separate;
- client admins may eventually configure it according to existing configuration permissions;
- Phase 2 bis does not require building a full administration dashboard if none exists;
- API/RPC/domain support may be added only as needed by the current configuration foundation.

Do not make organization default locale override an authenticated user’s explicit personal preference.

---

# 25. PROFESSIONAL LOCALE PREFERENCE

Add/prepare a nullable explicit locale preference for professional users if needed by the chosen design.

Requirements:

- supported locale validation;
- no cross-tenant write path;
- user can update their own preference through a narrowly scoped server operation;
- setting the preference to null restores inherited/default behavior;
- audit only if it is consistent with current audit policy and contains no sensitive data.

Do not store locale preference in editable Auth metadata as the source of truth for authorization-sensitive profile behavior.

---

# 26. COOKIE / SESSION PERSISTENCE

Use a secure, minimal cookie for explicit locale preference when appropriate for SSR.

Requirements:

- no sensitive data;
- sane SameSite behavior;
- no unnecessary long-lived tracking identifier;
- value restricted to supported locales;
- server and client resolve the same effective locale to avoid hydration mismatch.

Do not use localStorage as the only source if the server needs locale during render.

---

# 27. URL / ROUTING STRATEGY

Do not break existing deep links or Auth callbacks.

Before choosing URL-prefixed locale routes such as `/fr-FR/...`, audit impact on:

- `/auth/callback`;
- `/auth/confirm`;
- `/auth/recover`;
- `/auth/password`;
- `/auth/accept`;
- `/espace`;
- future secure citizen tracking links.

A locale prefix is not mandatory in Phase 2 bis.

If locale routing changes URL structure, treat it as structural and create/update an ADR.

If a cookie/server resolution provides simpler behavior without sacrificing future SEO/deep-link needs, prefer the simplest reversible solution.

---

# 28. LOCALE SELECTOR UX

Provide an accessible language/locale selector on appropriate existing Citizen and Pro surfaces.

Requirements:

- keyboard accessible;
- screen-reader labeled;
- touch friendly;
- current selection clear;
- no flag-only language UI;
- use language names, e.g. `Français`, `English`;
- switching locale must not silently lose the current safe route/state;
- selector must work before authentication where appropriate;
- selector must work for an authenticated professional.

Do not infer language solely from flags or country.

---

# 29. LOCALE MATCHING

Implement deterministic matching.

Expected behavior:

1. exact supported locale match;
2. if exact unavailable, match by language to the configured preferred supported locale;
3. otherwise fallback to `fr-FR`.

Examples:

- `fr-FR` → `fr-FR`
- `fr-CA` when only `fr-FR` is supported → `fr-FR`
- `en-US` when only `en-GB` is supported → `en-GB`
- malformed/unsupported locale → `fr-FR`

Test this as pure logic.

---

# 30. LOCALE-AWARE FORMATTING

Use locale-aware formatting for all relevant visible values.

Prefer platform `Intl` APIs or abstractions over them:

- `Intl.DateTimeFormat`
- `Intl.NumberFormat`
- `Intl.RelativeTimeFormat`
- plural rules where needed

Do not hardcode:

- `dd/mm/yyyy` globally;
- decimal separators;
- thousands separators;
- unit word order;
- English/French plural assumptions.

Timezone-sensitive values must still use the explicit intended timezone.

Locale formatting must not alter SLA calculation semantics.

---

# 31. TRANSLATABLE REFERENCE DATA

Audit which current database entities contain user-visible labels that represent system/catalog content.

At minimum inspect:

- `verticals`;
- `categories`;
- `hold_reasons`.

Do not assume every string column should become a translation table.

Proper names such as organization/service names are not translated by default.

For system/catalog reference entities that need multilingual display, prefer a normalized translation model such as:

```text
<entity>_translations
  entity_id
  locale
  label
  optional description/help text
  UNIQUE(entity_id, locale)
```

or another equally explicit normalized design.

Do not store a JSON translation blob unless you justify why it is superior for constraints/querying/RLS in this project.

---

# 32. CATEGORY / VERTICAL BUSINESS IDENTITY

Routing, analytics, SLA and contract behavior must use stable IDs/codes, never translated labels.

Example:

```text
code = accessible_parking_occupied
```

Presentation may resolve to:

- `fr-FR`: `Place PMR occupée`
- `en-GB`: `Accessible parking space occupied`

Changing a translation must not change business identity or contract associations.

---

# 33. CUSTOM CLIENT CONTENT

Do not pretend all future client-created text is automatically multilingual.

If an organization creates a custom translatable label in a future phase, the data model may support multiple translations, but Phase 2 bis should not invent complex translation workflows that do not yet exist.

Keep the foundation extensible without creating an admin translation CMS.

---

# 34. VALIDATION AND TYPES

Locale values must be validated centrally.

Prefer a shared type derived from supported locale configuration rather than arbitrary `string` throughout the app.

Example intent:

```ts
export const supportedLocales = ['fr-FR', 'en-GB'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
```

Exact implementation may differ if the selected i18n library provides a stronger pattern.

Do not use `any`.

---

# 35. SERVER / CLIENT BOUNDARY

Resolve the effective locale server-side wherever practical for initial render.

Client components may consume the resolved locale/messages but must not independently invent another locale resolution algorithm.

There must be one authoritative locale-resolution policy with reusable tests.

Avoid hydration mismatch caused by server rendering French while client immediately switches to English based on navigator state.

---

# 36. EMAIL / AUTH COPY

Audit Auth/invitation/recovery email content.

If current local templates can support locale selection safely, prepare them accordingly.

Do not create a complex production email localization system before notifications/email architecture requires it.

At minimum:

- document what is localized now;
- document what remains provider/template-level;
- ensure links/callbacks remain valid regardless of UI locale.

---

# 37. ACCESSIBILITY AND I18N

Internationalization must preserve WCAG 2.2 AA.

Test:

- locale selector keyboard operation;
- accessible name;
- focus preservation after switching where appropriate;
- translated form labels;
- translated errors;
- `lang` attribute on the document reflects effective language/locale appropriately;
- no color-only language state;
- layout tolerates longer English/French strings without clipping;
- zoom/text scaling does not break the selector.

Do not use flags as the only accessible name.

---

# 38. HTML LANGUAGE METADATA

Set the document language consistently with the effective locale/language.

At minimum:

- `fr-FR` → document language French;
- `en-GB` → document language English.

Use standards-compatible values and ensure SSR output is correct.

Do not hardcode `<html lang="fr">` once locale switching exists.

---

# 39. SEO / METADATA

Phase 2 bis does not require an international SEO strategy.

However, do not introduce metadata that lies about locale.

If existing metadata is user-visible/localized, make it consistent with the current locale where practical.

Do not build hreflang/canonical strategy unless URL routing makes it genuinely necessary now.

---

# 40. DATABASE MIGRATIONS

If database changes are necessary, use versioned migrations only.

Likely candidates after audit:

- `organization_settings.default_locale`;
- professional explicit locale preference;
- translation tables for relevant catalog/reference data.

Requirements:

- safe defaults/backfill;
- tenant coherence;
- RLS/grants from creation;
- composite FKs where tenant-scoped;
- supported-locale constraints where appropriate;
- no destructive rewrite of stable business codes;
- rollback/rebuild reproducibility through Supabase reset process.

Do not alter SLA timezone behavior.

---

# 41. RLS / SECURITY

All existing Phase 2 guarantees remain mandatory.

Locale preferences and translation data must not create a tenant bypass.

Specifically test:

- professional can modify only their own locale preference;
- organization default locale requires the existing appropriate admin capability;
- cross-tenant locale setting mutation is refused;
- reading global catalog translations does not expose tenant-private data;
- tenant-specific translations, if introduced, are tenant-isolated;
- service-role is not used as an ordinary locale-preference client.

---

# 42. AUDIT

Follow the accepted Phase 2 audit policy.

If locale preference/default locale changes are audited:

- actor must be real;
- change must remain transactionally consistent;
- no sensitive data;
- correlation behavior follows the final accepted Phase 2 implementation.

Do not audit browser `Accept-Language` headers or create unnecessary behavioral tracking.

---

# 43. PRIVACY

Locale detection is not a justification for fingerprinting.

Do not collect or persist:

- full browser fingerprint;
- unnecessary language history;
- device identifiers;
- exact browser metadata beyond what is needed to resolve locale.

A simple preference cookie is enough for anonymous explicit choice.

---

# 44. DEPENDENCIES

Add the minimum dependencies needed.

For every new package, state:

- why it is necessary;
- why existing platform APIs are insufficient;
- browser/server impact;
- bundle impact;
- maintenance maturity.

Do not add:

- Redux/state management solely for locale;
- a second validation library;
- an unrelated formatting library when `Intl` suffices;
- a large UI framework for the selector;
- a custom test framework for POM.

---

# 45. ADR REQUIREMENTS

Create/update ADR only for structural decisions.

Expected ADR topics if applicable:

1. **Internationalization and locale resolution strategy**
   - supported locales;
   - fallback;
   - user/org/browser precedence;
   - cookie/profile persistence;
   - URL strategy;
   - SSR strategy.

2. **E2E Page Object Model conventions** only if existing quality ADR does not already adequately carry the decision.

Do not create an ADR for simple file names or every translation key.

---

# 46. UNIT TESTS — LOCALE LOGIC

Add pure tests for at least:

- exact locale match;
- language fallback (`fr-CA → fr-FR`, `en-US → en-GB`);
- unsupported locale fallback;
- malformed locale fallback;
- explicit user choice precedence;
- professional profile preference precedence;
- organization default precedence;
- browser precedence when appropriate;
- locale and timezone independence;
- message key coverage/type safety strategy where feasible.

---

# 47. UNIT TESTS — FORMATTING

Test representative formatting in both locales:

- date;
- number;
- relative time where used;
- any currently visible unit formatting.

Do not write brittle tests against implementation-specific Unicode spacing unless the product behavior truly requires exact characters.

---

# 48. DATABASE / INTEGRATION TESTS

If DB schema changes are introduced, test with real Supabase/PostgreSQL:

- migration from clean DB;
- seed/reset;
- organization default locale;
- own profile locale update;
- cross-user/cross-tenant refusal;
- translation uniqueness `(entity, locale)`;
- stable code unchanged by translation update;
- old French seed data migrated or represented correctly;
- RLS behavior under real JWT where relevant.

---

# 49. E2E TESTS — LOCALE

Add real Playwright scenarios using the new POM architecture.

Minimum required:

### Citizen/public surface
- browser/default French renders French;
- English browser negotiation renders English or follows the chosen deterministic policy;
- explicit switch to English works;
- reload preserves explicit choice;
- switch back to French works.

### Pro surface
- login remains functional;
- professional preference wins after authentication;
- organization default is used when no personal preference exists;
- explicit professional switch persists;
- Auth callback/deep link remains valid after locale handling;
- logout/login does not accidentally corrupt locale persistence.

Do not duplicate the entire suite for every locale unless that gives real value.

Use a small locale matrix for translation infrastructure plus critical smoke flows.

---

# 50. E2E TESTS — POM QUALITY

All Phase 2 bis E2E scenarios must use the new Page Objects / Component Objects.

After migration:

- no unnecessary duplicated locator sequences remain in specs;
- existing Phase 1/2 scenarios still pass;
- specs are materially more readable;
- assertions are not hidden or weakened;
- no test is skipped to simplify migration.

---

# 51. TRANSLATION CATALOG TESTS

Add a check that prevents obvious catalog drift.

At minimum verify:

- every required `fr-FR` key exists in `en-GB`;
- no unexpected missing keys in either supported locale;
- optionally no unused keys if this can be implemented reliably without fragile static analysis.

Do not build a complex parser if the i18n library provides validation/type generation.

---

# 52. ACCESSIBILITY TESTS

Use axe where applicable and manual validation where needed.

Automated checks must include at least:

- both locales on a representative Citizen surface;
- both locales on login/Pro surface;
- locale selector;
- translated error state.

Manual checks for new UI:

- keyboard;
- focus;
- zoom;
- VoiceOver on available Apple environment.

TalkBack may remain DEFERRED only if the compatible Android environment is genuinely unavailable, and must not be reported PASS.

---

# 53. NO REGRESSION RULE

The global ActiCiv rule remains absolute:

Every bug discovered and fixed during Phase 2 bis must receive an appropriate regression test that would fail before the fix and pass after it.

Never:

- delete a valid test;
- weaken an assertion simply to pass;
- skip a failing critical test;
- disable RLS/security validation;
- reduce Phase 1/2 coverage to make the POM migration easier.

---

# 54. VERIFY / VERIFY:FULL

The existing release discipline remains in force.

`verify` must remain green.

`verify:full` must remain green and include all relevant new tests.

If new DB migrations exist, the final validation must include clean reconstruction/reset/seed evidence on the exact final SHA according to the accepted Phase 2 release discipline.

No fake green caused by missing local services.

---

# 55. CI

CI must validate the same final SHA as local release validation.

Phase 2 bis is not complete until:

- required local checks pass;
- required CI jobs pass on the same SHA;
- the working tree is clean;
- documentation is part of that SHA;
- any delivery/archive comes from that SHA.

Do not repeat the Phase 1 artifact mismatch incident.

---

# 56. DOCUMENTATION TO UPDATE

Update repository documentation to reflect Phase 2 bis:

- product book reference to v1.4;
- current phase status;
- POM conventions;
- i18n/locale strategy;
- supported locales;
- locale precedence;
- data model changes;
- ADR(s);
- test architecture;
- any open questions genuinely left for future phases.

Do not rewrite historical Phase 1/2 postmortems as if they originally contained Phase 2 bis decisions.

History remains history.

---

# 57. OPEN QUESTIONS THAT MUST NOT BLOCK THIS PHASE

Do not over-expand into future product questions such as:

- all countries supported at launch;
- currencies/pricing localization;
- full international legal/compliance strategy;
- right-to-left language support implementation;
- translation vendor workflow;
- public SEO strategy for every country;
- automatic machine translation;
- multilingual free-text citizen reports;
- full admin translation CMS.

The architecture should not gratuitously block these futures, but do not implement them now.

---

# 58. RTL READINESS

Do not implement RTL unless explicitly requested.

However:

- avoid assumptions that make RTL impossible at trivial cost;
- do not use left/right language in business semantics where logical CSS properties already suffice;
- no dedicated RTL test matrix is required in Phase 2 bis.

---

# 59. PERFORMANCE

Internationalization must not cause unreasonable bundle growth.

Prefer loading only the active locale catalog where the selected framework supports it cleanly.

Do not ship every future locale eagerly.

Measure/report material bundle changes if the i18n dependency changes client bundles.

POM changes must not materially slow E2E through unnecessary fixed waits.

No `waitForTimeout` used as synchronization unless a specific unavoidable reason is documented.

---

# 60. ERROR HANDLING

Missing translation key behavior must be deterministic and observable in development/test.

Do not silently show blank UI.

Prefer:

- fail tests for missing required keys;
- clear development diagnostics;
- safe production fallback according to the library/strategy.

User-visible errors should be localized where they are application-controlled.

Internal logs may remain technical English if that is the established repository convention.

---

# 61. SEEDS

If schema changes require seed changes:

- keep all data synthetic;
- add locale defaults explicitly;
- add `fr-FR` and `en-GB` catalog translations for seeded system reference data where required;
- preserve 3+ organizations from Phase 2;
- do not add reports;
- keep deterministic IDs where already established.

---

# 62. TDD / TEST-FIRST DEVELOPMENT — LOCKED

ActiCiv uses pragmatic test-first development for critical logic.

Mandatory test-first areas:

- business invariants;
- authorization / RBAC;
- RLS-sensitive behavior;
- tenancy;
- security rules;
- concurrency;
- SLA/routing/assignment/report rules when present;
- external workflow recovery/idempotence;
- bugs that can be reproduced automatically.

Expected cycle:

1. understand the requirement and acceptance criteria;
2. identify risk and affected contracts;
3. write the smallest behavior test that fails for the right reason;
4. implement the minimum correct solution;
5. make the test pass;
6. refactor without changing behavior;
7. run focused regression;
8. run the Quality Gates required by the change.

Tests must prefer externally observable behavior and invariants over internal implementation details.

Do not force strict TDD for documentation-only changes, purely visual styling without behavior, or trivial mechanical plumbing where a pre-test provides no useful signal. Validation still applies.

For a reproducible bug, add the regression test before the fix whenever reasonably possible. If this cannot be done, document why.

---

# 63. TEST TAXONOMY AND TAGGING — LOCKED

Every Playwright test must have exactly one criticality tag:

- `@critical`
- `@high`
- `@medium`
- `@low`

Criticality describes product impact if the scenario fails. It must not be used as a temporary state.

At `describe` / suite level, add stable functional tags:

- route: `@route:<route>`
- component/feature: `@component:<component>` when relevant

Examples:

```ts
test.describe('@route:auth @component:forgot-password', () => {
  test('@critical an active professional can recover access', async ({ page }) => {
    // scenario
  });
});
```

A “route” is a stable product path/domain surface, not necessarily a literal URL.

Optional orthogonal type tags are allowed only when useful:

- `@type:security`
- `@type:a11y`
- `@type:smoke`
- `@type:regression`

Do not create permanent `@broken`, `@todo`, or `@flaky` tags. Flakiness is measured from execution history.

Add an automated taxonomy validation that rejects:

- missing criticality;
- multiple criticalities on one test;
- malformed `@route:*` / `@component:*` tags;
- unknown reserved tags;
- divergent naming conventions.

Document commands/examples to run:

- all critical tests;
- a route;
- a component;
- combinations such as critical + auth;
- smoke set.

Do not weaken scenario readability to satisfy tagging.

---

# 64. COVERAGE STRATEGY — LOCKED

Introduce code coverage for testable TypeScript/JavaScript using the simplest compatible toolchain.

Track at minimum:

- statements;
- branches;
- functions;
- lines.

Report:

- global coverage;
- coverage by workspace/module;
- coverage of critical modules separately.

Critical modules include current security/domain modules and later modules such as authorization, auth/invitations, SLA, routing, assignments and reports as they exist.

Coverage is one signal, never proof of quality.

Do not game coverage with meaningless assertions or test implementation details.

The quality model must also represent non-code coverage dimensions where applicable:

- roles/capabilities exercised;
- RLS negative scenarios;
- API/RPC paths;
- critical E2E flows;
- accessibility scenarios;
- concurrency invariants;
- supported locales.

Thresholds must be configurable and versioned.

Do not hardcode arbitrary aspirational thresholds before measuring the repository baseline. During the pre-implementation audit, calculate the initial baseline and propose sensible thresholds. Patrick must approve thresholds before they become hard blocking gates.

Even when an absolute threshold is passed, flag material coverage regression versus the previous accepted baseline.

---

# 65. MACHINE-READABLE QA REPORTS — LOCKED

Every relevant quality producer must output or be normalized to a machine-readable artifact.

Include as applicable:

- Vitest results;
- code coverage JSON/LCOV;
- Playwright JSON/JUnit;
- pgTAP/SQL result summary;
- integration results;
- axe/a11y results;
- build/bundle checks;
- dependency audit;
- SAST;
- secret scan;
- DAST;
- Quality Gate evaluation.

Human HTML reports may also be generated, but they are not the canonical ingestion format.

Artifacts must identify at minimum:

- commit SHA;
- branch/reference;
- environment;
- run ID/provider where available;
- timestamps;
- relevant tool/runtime versions;
- pass/fail/skipped/error counts;
- duration;
- metrics/findings needed for gates;
- test metadata/tags including criticality, route, component and type when present.

Do not parse ANSI terminal output when a native structured reporter exists.

---

# 66. QUALITY RESULT AGGREGATION — LOCKED

Introduce a small, explicit quality aggregation layer.

Conceptual flow:

```text
Test/scan tools
    ↓ structured artifacts
QA normalizer/aggregator
    ↓
Quality snapshot
    ↓
Quality Gate evaluator + Quality Center
```

The same canonical quality snapshot must feed both:

1. promotion/gate decisions;
2. the Super Admin Quality Center.

The UI must never independently recalculate release readiness.

The data model should support, without one column per future metric:

- quality runs;
- suites/checks;
- normalized metrics;
- gate results;
- failures/findings references;
- baseline/reference run links.

A reasonable shape may include tables/entities equivalent to:

- `quality_runs`
- `quality_test_suites` / `quality_checks`
- `quality_metrics`
- `quality_gate_results`
- `quality_findings`

Names may differ if a simpler coherent model is proposed.

Do not store unlimited raw logs/reports in PostgreSQL. Store normalized summaries and links/identifiers to detailed artifacts.

All quality data ingestion must be authenticated and protected against forged client-side results.

---

# 67. QUALITY BASELINE AND REGRESSION DETECTION — LOCKED

Each accepted PROD release eventually establishes an immutable Quality Baseline tied to its exact SHA/artifact.

For Phase 2 bis, implement the baseline model and comparison capability even if no real PROD baseline exists yet.

Compare candidate runs with an appropriate previous accepted run/baseline for:

- coverage;
- test counts;
- failures;
- flakiness;
- critical-flow coverage;
- accessibility findings;
- security findings;
- CI duration;
- other approved critical metrics.

Surface deltas and regressions explicitly.

Deleting tests or losing a meaningful amount of coverage must be visible, not hidden by a still-green global percentage.

---

# 68. RETRIES AND FLAKINESS — LOCKED

Official release-validation runs must not hide instability with automatic retries.

Keep `retries: 0` for release evidence unless Patrick explicitly approves a narrowly documented exception.

If any tool returns “pass after retry”, normalize it as a distinct unstable/flaky state, never a clean PASS.

Create a separate flakiness workflow/job that intentionally repeats selected tests or suites.

It may be scheduled/nightly/manual depending on cost.

Store at minimum:

- attempts;
- passes;
- failures;
- flaky rate;
- first/last observation;
- affected route/component/test.

Do not make normal release pipelines repeat the entire E2E suite many times merely to calculate flakiness.

---

# 69. ENVIRONMENTS AND PROMOTION MODEL — LOCKED

ActiCiv anticipates three promotion stages:

```text
DEV → DEMO/STAGING → PROD
```

A promotion moves an already validated candidate/artefact whenever technically possible.

Do not silently promote a moving branch.

A promotion record must identify:

- source environment;
- target environment;
- exact SHA;
- exact artifact/build identity when available;
- quality run/gate result;
- actor/automation;
- timestamp.

Any code/config/migration/dependency change after validation creates a new candidate requiring new validation.

---

# 70. DEV → DEMO QUALITY GATE — LOCKED

The automated gate must be designed to include at minimum:

- format;
- lint;
- typecheck;
- unit tests;
- SQL/RLS tests;
- integration tests;
- `@critical` E2E and other required high-risk scenarios;
- production builds;
- bundle boundaries;
- automatic accessibility checks;
- dependency audit;
- approved coverage thresholds/delta rules;
- security checks already automated at this maturity level.

The exact gate configuration is versioned, machine-readable and reviewable.

A critical hard FAIL blocks promotion independently of any aggregate readiness score.

---

# 71. DEMO → PROD QUALITY GATE — LOCKED FOUNDATION

Do not deploy a real PROD environment merely to satisfy this phase.

Build the gate model and automation foundations for future PROD.

The PROD gate must be able to require:

- same SHA/artifact validated in DEMO;
- full regression;
- all critical E2E;
- RLS/security suites;
- migration rehearsal where applicable;
- required manual accessibility evidence;
- Security Assurance checks;
- no open P0/P1 defects;
- no open critical security finding;
- no unaccepted high security finding;
- dependency/secret/SAST/DAST requirements;
- backup/rollback readiness when PROD exists;
- release notes/change evidence;
- approved pentest requirement when applicable.

Do not invent fake PROD proof in Phase 2 bis.

---

# 72. GATE EXCEPTIONS — STRICT

An exception/waiver must never be an invisible boolean bypass.

If gate waivers are modeled, require:

- exact failed check;
- reason;
- approver;
- owner;
- creation timestamp;
- expiry;
- environment/release scope;
- audit trail.

Critical/security exceptions must remain visible in the Quality Center.

Do not implement a broad “ignore all checks” capability.

---

# 73. QUALITY CENTER — SUPER ADMIN — LOCKED

Create the minimum viable Super Admin Quality Center in Phase 2 bis.

It is read-only quality observability, not a test runner.

Protect it with an explicit platform capability such as `quality.read` or a better equivalent proposed during audit.

The page must show a real ingested/aggregated quality run, not hardcoded sample values.

Minimum overview:

- target environment;
- exact SHA;
- run status;
- timestamp/duration;
- tests passed/failed/skipped;
- code coverage;
- critical-flow status;
- flakiness count/rate if available;
- retry / retried-test count if any tool produces it, clearly separated from clean PASS;
- filters/grouping by criticality, route and component when test metadata is available;
- accessibility status;
- security findings by severity;
- dependency/security scan status;
- Quality Gate result;
- blocking reasons;
- baseline/delta when available;
- link/reference to CI run/artifacts when available.

Provide drill-down where practical to suite/check/module/finding details.

The rich final Super Admin UX can be developed later, but Phase 2 bis must prove the end-to-end architecture:

```text
quality evidence → aggregation/ingestion → protected persistence → Quality Center rendering
```

Do not expose secret scan details or exploitable pentest details to unauthorized actors.

---

# 74. SECURITY ASSURANCE — LOCKED

Security is a continuous quality dimension.

Phase 2 bis must define and implement the immediately useful automated controls, and prepare the future controls that require deployed environments.

Cover:

- SAST/static security analysis;
- dependency vulnerability audit;
- secret scanning;
- existing Auth/RBAC/RLS security tests;
- configuration/security checks where useful;
- DAST capability for DEMO when an environment exists;
- supply-chain awareness;
- GitHub/CI branch/release protection documentation;
- secret/key management and rotation expectations;
- backup/restore readiness;
- incident-response foundations.

Do not install multiple overlapping scanners without a justified signal.

Prefer tools that produce structured reports suitable for the quality aggregator.

---

# 75. APPLICATION SECURITY SCENARIO CATALOG — LOCKED

Maintain a security scenario catalog covering applicable risks such as:

- cross-tenant access;
- IDOR;
- privilege escalation;
- role/capability bypass;
- `organization_id` tampering;
- RLS bypass attempts;
- stale JWT/session behavior;
- invitation abuse;
- password recovery abuse;
- callback/open-redirect abuse;
- injection;
- XSS;
- CSRF;
- SSRF when server-side URL fetching exists;
- unsafe file upload later when files exist;
- rate-limit abuse later when exposed;
- sensitive-data leakage.

Only test risks relevant to actual current surfaces. Do not create dangerous fake features just to test a category.

---

# 76. PENTEST AND CYBER POLICY — LOCKED

A scanner is not a human pentest.

Before the first real production deployment or significant external pilot using real users/data, ActiCiv requires an independent/manual penetration test covering the relevant application/API/Auth/RLS/infrastructure surface.

After remediation of critical/high findings, require targeted retest/evidence before closure.

Track pentest metadata without storing exploit-sensitive detail in broadly accessible quality screens:

- scope;
- provider/reviewer;
- date;
- status;
- severity counts;
- remediation status;
- retest status;
- report reference/access-controlled location.

Cyber readiness also includes:

- CI/CD permissions;
- repository protections;
- supply chain;
- secrets and key rotation;
- backup/restore;
- encryption/configuration;
- incident response;
- retention/access control.

---

# 77. SECURITY GATE POLICY — LOCKED

Future PROD hard rules:

- zero open critical vulnerability;
- zero unaccepted high vulnerability;
- required pentest/retest satisfied when the release policy requires it.

A high-risk acceptance, if ever allowed, must be explicit, owned, time-bound and auditable.

Track Security Debt:

- severity;
- age;
- owner;
- due date;
- source;
- remediation state;
- retest state.

Do not expose a “green score” that hides a critical finding.

---

# 78. THREE OBSERVABILITY STREAMS — LOCKED

ActiCiv has three distinct observability streams:

1. **Analytics** — aggregated/minimized product usage;
2. **Audit** — business/security proof;
3. **Logs** — technical diagnostics.

Hard rules:

- Analytics never replaces Audit.
- Audit never replaces Logs.
- Logs are never business source of truth.
- The three streams may share a `correlation_id` where useful.
- Their retention, access, payloads and storage remain separate.

Create/maintain distinct interfaces/adapters rather than provider calls scattered through business code.

Conceptual APIs:

```ts
analytics.track(...)
audit.record(...) // or transactional SQL mechanism
logger.info(...)
```

The existing transactional SQL audit remains authoritative for business mutations requiring atomicity.

---

# 79. ANALYTICS EVENT TAXONOMY — LOCKED

Use stable event names in the form:

```text
<surface>_<domain>_<action>
```

Examples:

- `pro_auth_login_succeeded`
- `pro_auth_password_recovered`
- `admin_sla_published`
- future `citizen_report_started`
- future `citizen_report_submitted`

Maintain an event catalog documenting:

- event name;
- description;
- trigger;
- allowed properties;
- property types/enums;
- surface/domain;
- consent/privacy classification;
- owner;
- status/deprecation.

Do not create future Citizen events in runtime merely because they are documented examples.

---

# 80. ANALYTICS PRIVACY — LOCKED

Product analytics is minimized by default.

Never send by default:

- email;
- password;
- tokens;
- license plates;
- free text;
- photos;
- exact GPS coordinates;
- tracking tokens;
- secrets;
- raw sensitive identifiers.

Use stable business codes and aggregated/non-sensitive dimensions.

Geographic analytics should use an appropriate territory/coarse dimension only when justified.

Consent/regulatory behavior must be reviewable before real PROD and must not be silently assumed from a development implementation.

Provider independence is required. Do not scatter `gtag()` calls. GA4 / Google Tag Manager may be adapters later, but event contracts belong to ActiCiv rather than to Google-specific implementation details.

---

# 81. TECHNICAL LOGGING — LOCKED

Use structured technical logs with explicit levels:

- debug;
- info;
- warn;
- error.

Include only necessary technical context such as:

- environment;
- module;
- operation;
- correlation ID;
- safe resource identifiers;
- timing/status/error classification.

Do not log secrets, passwords, tokens, unnecessary emails/PII, entire request bodies or sensitive payloads by default.

Logs remain separate from transactional Audit.

---

# 82. CORRELATION ID — LOCKED

Complete the correlation-ID foundation identified during Phase 2 closure.

A request/command correlation ID should propagate, where relevant, through:

- server entrypoint;
- application use case;
- technical logs;
- audit context;
- external provider calls where safe/useful;
- quality/support diagnostics.

Do not expose sensitive internal IDs unnecessarily to end users.

Transaction ID and correlation ID are different concepts.

Tests must prove propagation across at least one representative request and one multi-step Auth/invitation path if that path remains appropriate after Phase 2 closure.

---

# 83. BUSINESS KNOWLEDGE BASE — LOCKED

Create a versioned business Knowledge Base in Markdown, optimized for both humans and AI retrieval.

Do not rely on one giant PDF as the only detailed source.

Suggested structure, adaptable after audit:

```text
docs/kb/
  business/
    auth/
    organizations/
    coverage/
    schedules/
    sla/
    ...
```

Each significant feature/domain behavior document must include stable frontmatter similar to:

```yaml
---
id: feature.professional-invitation
domain: auth
type: business-feature
status: active
roles:
  - client_admin
related_adrs:
  - ADR-...
related_tests:
  - integration/...
---
```

Use actual repository paths/IDs, not placeholders, in final committed documents.

---

# 84. BUSINESS FEATURE DOCUMENT CONTRACT — LOCKED

Each business feature page must document, where applicable:

- purpose;
- actors;
- role/capability matrix;
- preconditions;
- nominal flow;
- alternate flows;
- error flows;
- edge cases;
- business rules/invariants;
- statuses/transitions;
- data read/written;
- tenant/ownership rules;
- security considerations;
- accessibility considerations;
- i18n/locale considerations;
- analytics events;
- audit events;
- technical logs relevant for diagnosis;
- tests that prove the behavior;
- ADR references;
- implementation/code references;
- known limitations/open questions;
- historical decision references when useful.

Rights must be explicit. “Admin can manage it” is not enough if different admin types/capabilities exist.

---

# 85. TECHNICAL KNOWLEDGE BASE — LOCKED

Create/normalize technical documentation for:

- architecture/module map;
- hexagonal boundaries;
- database/migrations;
- tenancy/RLS;
- Auth/invitations;
- PostGIS/coverage;
- schedules/SLA;
- testing/POM/tagging/TDD;
- coverage/reporting;
- Quality Gates/promotion;
- Security Assurance;
- Analytics/Audit/Logs;
- i18n/locales;
- CI/CD/release;
- Quality Center;
- Rules/Skills.

Keep documents focused and linkable.

Prefer stable headings, IDs and cross-links over long narrative files that are hard for an AI to retrieve precisely.

---

# 86. TRACEABILITY — LOCKED

For important features, establish bidirectional traceability:

```text
Requirement
  ↕
Business KB
  ↕
Permissions / security rules
  ↕
Code / migrations / APIs
  ↕
Tests
  ↕
Audit / Analytics / Logs
  ↕
ADR / technical docs
```

A future developer/AI modifying an existing feature must be able to identify impact before editing.

Do not duplicate the same source-of-truth text into many files. Use links and stable references.

---

# 87. DOCUMENTATION CHANGE RULE — LOCKED

If a PR changes any of the following, update the related documentation in the same PR:

- business behavior;
- permissions/access rights;
- state transitions;
- API/RPC contract;
- database contract;
- audit behavior;
- analytics contract;
- significant logging/diagnostic contract;
- i18n behavior;
- security behavior;
- architectural decision.

A behavior change with stale KB is a documentation regression and blocks completion.

If code and authoritative documentation disagree, stop and report the contradiction. Do not silently choose one.

---

# 88. ADR GOVERNANCE — LOCKED

Every structural technology/architecture decision requires an ADR when not already covered by an accepted ADR.

ADR contract:

- status;
- context;
- decision;
- alternatives considered;
- consequences/tradeoffs;
- security impact;
- testing/quality impact;
- migration/operational impact;
- related KB/code/tests.

Do not create ADRs for trivial implementation choices.

Do not rewrite accepted ADR history to pretend the original decision was different.

When a decision changes, create/supersede with a new ADR and link both.

Ensure the repo has coherent ADR coverage for the structural decisions now locked: monolith/hexagonal, tenancy/RLS, PostGIS, SLA versioning, audit, POM/test architecture, i18n, Quality Gates/quality data, observability separation, knowledge governance and AI engineering rules where structurally relevant.

---

# 89. PERSISTENT RULES FOR CODEX / DEVELOPERS — LOCKED

Create or update the repository root `AGENTS.md` as the concise persistent instruction entrypoint for Codex.

OpenAI Codex applies `AGENTS.md` by directory scope; nested files should be used only when a subtree genuinely needs more specific instructions.

`AGENTS.md` must remain concise enough to be reliably loaded and followed.

It must point to the deeper KB/engineering documents and encode the non-negotiable rules, including:

- do not start the next phase automatically;
- read feature KB/ADRs before changing existing behavior;
- critical logic test-first;
- bug = regression test;
- never delete/weaken/skip valid tests to make CI green;
- monolith + pragmatic hexagonal boundaries;
- backend/DB source of truth;
- RLS/security rules;
- POM/test-tag conventions;
- i18n locale-first;
- Analytics/Audit/Logs separation;
- documentation/ADR update obligations;
- Quality Gates and proof discipline;
- dependency justification;
- no overengineering;
- contradiction stop rule.

Do not put every long workflow into `AGENTS.md`; use Skills.

---

# 90. REUSABLE SKILLS — LOCKED

Create repository-versioned reusable workflow Skills, using the supported Codex/OpenAI skill convention available in the environment and documenting their canonical paths.

A Skill playbook should define:

- name/purpose;
- when to use it;
- required inputs/context;
- exact workflow;
- expected outputs;
- final checks;
- stop/escalation conditions.

Initial catalog required:

1. `implement-feature`
2. `change-existing-feature`
3. `fix-bug`
4. `add-business-rule`
5. `add-e2e-test`
6. `add-rbac-rule`
7. `database-migration`
8. `add-analytics-event`
9. `add-audit-event`
10. `add-logging`
11. `i18n`
12. `create-adr`
13. `update-kb`
14. `security-review`
15. `prepare-release`

Do not create dozens of micro-skills.

If the current Codex environment does not support repository-local automatic skill discovery exactly as expected, keep the canonical `SKILL.md` playbooks in a documented repository directory and report the limitation instead of inventing unsupported behavior.

---

# 91. REQUIRED SKILL BEHAVIORS — LOCKED

At minimum:

### `change-existing-feature`
Must first build an impact map covering:

- business rules;
- actors/rights;
- DB/RLS;
- APIs/RPC;
- UI/routes;
- E2E/tests;
- i18n;
- Analytics;
- Audit;
- Logs;
- KB/ADR.

### `fix-bug`
Must:

1. reproduce;
2. find expected behavior in KB/decision source;
3. write failing regression test when possible;
4. fix minimally;
5. rerun focused regression;
6. run required gates;
7. update KB only if intended behavior changes.

### `database-migration`
Must review:

- append-only migration discipline;
- tenant FKs/constraints;
- indexes;
- RLS/grants;
- audit;
- seed impact;
- pgTAP/integration;
- reset/reconstruction;
- compatibility with existing data.

### `prepare-release`
Must never declare ready without exact SHA, actual gate evidence and required manual proof.

---

# 92. DEFINITION OF DONE — LOCKED

A feature/change is not DONE because code compiles.

The Definition of Done requires all applicable dimensions:

- acceptance criteria satisfied;
- code complete;
- test-first used where required;
- automated tests added/updated;
- bug regression test if applicable;
- coverage acceptable / regression reviewed;
- security/RLS impact validated;
- accessibility validated;
- i18n/locales handled;
- Analytics event contract handled if applicable;
- Audit handled if applicable;
- Logs handled if applicable;
- business KB updated;
- technical docs updated;
- ADR added/superseded if structural;
- Quality Gates passed;
- no hidden skipped/weakened validation.

If an item is not applicable, it should be obviously N/A rather than silently forgotten in critical PRs.

---

# 93. PR / CHANGE CHECKLIST — LOCKED

Introduce a practical PR/change template containing at minimum:

- requirement / issue;
- acceptance criteria;
- risk level;
- tests written/changed;
- TDD evidence/notes for critical logic;
- test tags/routes/components affected;
- coverage impact;
- security/RLS impact;
- a11y impact;
- i18n impact;
- Analytics/Audit/Logs impact;
- DB/migration impact;
- KB/technical doc changes;
- ADR decision;
- screenshots only when useful;
- Quality Gate evidence/reference.

Keep it usable; do not turn every trivial change into a 100-field form.

---

# 94. PHASE 2 BIS QUALITY CENTER DATA SECURITY

Quality data can contain sensitive operational information.

Protect it as platform-internal data.

Requirements:

- no anonymous access;
- explicit platform capability;
- validated ingestion source;
- RLS/authorization appropriate to the model;
- no secret tokens stored in result payloads;
- no raw pentest exploit details exposed in general UI;
- audit changes to gate configuration/waivers where implemented;
- sensible retention policy documented.

Do not let a browser submit arbitrary “green” quality results.

---

# 95. QUALITY GATE CONFIGURATION

Gate configuration should be centralized and versioned.

A conceptual format may resemble:

```yaml
demo:
  format: required
  lint: required
  typecheck: required
  unit: required
  integration: required
  sql_rls: required
  e2e_critical: required
  accessibility_auto: required
  dependency_audit: required
  coverage:
    lines: APPROVED_THRESHOLD
    branches: APPROVED_THRESHOLD

production:
  inherits: demo
  full_regression: required
  security_assurance: required
  manual_accessibility: required
  critical_vulnerabilities: 0
  high_vulnerabilities_unaccepted: 0
```

Do not commit placeholder strings as executable configuration.

During implementation, propose actual config only after baseline measurement and Patrick’s approval.

---

# 96. SECURITY / QUALITY SCORE POLICY

A summary score is optional.

If a readiness score is implemented:

- document its formula;
- never let it override hard gates;
- a critical hard failure must show BLOCKED regardless of score;
- avoid false precision.

The primary truth remains individual gate status and evidence.

---

# 97. PHASE 2 BIS IMPLEMENTATION ORDER

After the pre-implementation audit and explicit approval, prefer this order unless the audit proves a better dependency order:

1. documentation/decision baseline + ADR plan;
2. persistent rules and engineering conventions;
3. POM migration + test taxonomy/tag validation;
4. TDD/DoD/PR workflow documentation and guardrails;
5. i18n foundations and tests;
6. coverage instrumentation;
7. structured test/report outputs;
8. quality aggregator/snapshot schema;
9. Quality Gate evaluator/config foundation;
10. Security Assurance automation feasible locally/CI;
11. Analytics/Audit/Logs interfaces/taxonomies/correlation foundation;
12. Knowledge Base + traceability docs;
13. Skills implementation;
14. Quality Center protected read-only end-to-end slice;
15. complete verification, CI, documentation and postmortem.

Do not perform large parallel refactors that make failure attribution impossible.

## Controlled implementation checkpoints

Phase 2 bis remains one engineering phase, but implementation must proceed through controlled internal checkpoints so Patrick can review the result before the next large block begins:

- **2bis-A — Documentation baseline & governance**: authoritative docs/indexes, Phase 2 closure references, `AGENTS.md`, proportional DoD/PR/traceability foundations, KB/ADR/Skills structure. No runtime feature work.
- **2bis-B — E2E architecture & executable conventions**: pragmatic POM/Component Objects, fixtures, Playwright tagging, lint/architecture guardrails.
- **2bis-C — i18n & locale data**: locale resolution, catalogs, selector, user/org preferences and translated reference labels.
- **2bis-D — Coverage, reports, canonical snapshot & quality gates**.
- **2bis-E — Security Assurance + Production Artifact/Performance Hygiene**.
- **2bis-F — Analytics / Audit / Logs separation and observability contracts**.
- **2bis-G — Knowledge Base, ADR, Skills and governance completion**.
- **2bis-H — Quality Center protected read-only slice using real canonical evidence**.
- **2bis-I — Hardening, full regression, exact-SHA release evidence and postmortem**.

A checkpoint is not a new product phase. Do not begin the next checkpoint automatically when Patrick has explicitly requested a review stop.

For the initial launch, **2bis-A is the only authorized implementation checkpoint until Patrick approves its result**.

---

# 98. EXPECTED RESULT OF PHASE 2 BIS

At completion, ActiCiv must have all of the following foundations working, not merely documented.

### QA architecture
- current Playwright suite migrated to coherent POM/Component Objects;
- readable business-scenario specs;
- stable locator policy;
- mandatory criticality/route/component taxonomy;
- tag validation and targeted execution commands;
- preserved Phase 1/2 regression coverage.

### TDD / engineering method
- test-first rule encoded for critical logic;
- regression-test rule encoded;
- Definition of Done;
- PR/change checklist;
- Rules and Skills available in-repo.

### i18n
- `fr-FR` and `en-GB` real catalogs/behavior;
- deterministic locale resolution;
- accessible locale selector;
- anonymous and professional persistence;
- organization default locale;
- locale-aware formatting;
- reference-data translation foundation;
- locale/timezone separation.

### Coverage & quality evidence
- code coverage active;
- critical-module visibility;
- machine-readable outputs;
- quality aggregation by SHA/environment;
- regression/baseline comparison model;
- retries/flakiness policy and dedicated measurement foundation.

### Quality Gates & release readiness
- machine-readable gate configuration/evaluation;
- DEV→DEMO gate working;
- DEMO→PROD gate model ready without fake PROD evidence;
- immutable SHA/artifact promotion rules documented/encoded where possible.

### Security Assurance
- automated controls appropriate to current repo integrated;
- structured security findings available to aggregator;
- pentest/retest policy documented and gate-ready;
- security debt model/readiness visible.

### Observability
- Analytics / Audit / Logs explicitly separate;
- analytics taxonomy/catalog foundation;
- privacy guardrails;
- structured logging;
- correlation ID foundation.

### Knowledge / governance
- structured business KB;
- structured technical KB;
- frontmatter/link conventions;
- feature traceability;
- ADR governance complete enough for current structural decisions;
- root persistent rules;
- 15 initial Skills or their approved equivalent.

### Quality Center
- protected platform/Super Admin read-only page;
- real canonical quality snapshot rendered;
- coverage, tests, failures, flakiness when available, a11y, security and gate status visible;
- evidence/CI links where available;
- no fake hardcoded quality data.

### Delivery
- all mandatory tests/gates green;
- DB reproducible if schema changed;
- CI green on exact final SHA;
- documentation updated;
- no Phase 3 business workflow started.

---

# 99. PHASE 2 BIS ACCEPTANCE MATRIX

At the end, produce a criterion-by-criterion matrix with `PASS`, `FAIL`, or `DEFERRED` and actual evidence.

At minimum cover:

1. Git/release exact SHA
2. Phase 2 accepted entry gate
3. POM structure
4. migrated E2E inventory
5. locator policy
6. test isolation
7. criticality tags
8. route tags
9. component tags
10. targeted test execution
11. tag taxonomy validation
12. TDD rule/workflow
13. regression-test workflow
14. Definition of Done
15. PR template/checklist
16. locale configuration
17. message catalogs
18. Citizen locale resolution
19. Pro locale resolution
20. cookie persistence
21. professional preference
22. organization default
23. DB/RLS locale changes
24. reference translations
25. `Intl` formatting
26. Auth/deep-link compatibility
27. i18n accessibility
28. code coverage generation
29. global coverage
30. critical-module coverage
31. coverage regression/delta
32. machine-readable unit report
33. machine-readable E2E report
34. SQL/integration report normalization
35. a11y report normalization
36. security report normalization
37. quality snapshot/aggregator
38. snapshot SHA/environment integrity
39. baseline/comparison model
40. release retries = 0
41. flakiness measurement foundation
42. DEV→DEMO gate
43. DEMO→PROD gate model
44. hard-fail behavior
45. gate configuration versioning
46. promotion SHA/artifact model
47. SAST/current static security control
48. dependency audit
49. secret scanning
50. DAST readiness/current execution if environment exists
51. Auth/RLS security suite
52. security finding/debt model
53. pentest policy
54. retest policy
55. cyber operational checklist
56. Analytics interface
57. Analytics event catalog
58. analytics privacy tests/guardrails
59. Audit separation/atomicity preserved
60. Logging interface/structure
61. correlation ID propagation
62. business KB structure
63. business feature document completeness
64. technical KB structure
65. feature traceability
66. ADR governance
67. `AGENTS.md`
68. Skill catalog
69. Skill `change-existing-feature`
70. Skill `fix-bug`
71. Skill `database-migration`
72. Skill `prepare-release`
73. Quality Center authorization
74. Quality Center ingestion authenticity
75. Quality Center real-data overview
76. Quality Center drill-down/evidence links
77. Quality Center security/privacy
78. existing Phase 1/2 regression suite
79. full `verify`
80. full `verify:full`
81. dependency/security audit
82. CI exact SHA
83. documentation
84. explicit confirmation no Phase 3 started

A structural review is not a substitute for behavior proof where a test is required.

No PASS without actual evidence.

---

# 100. REQUIRED PHASE 2 BIS POSTMORTEM

Before requesting Phase 3, create:

`docs/quality/ActiCiv_Phase2bis_Postmortem.md`

It must include:

1. Summary
2. Entry baseline / accepted Phase 2 SHA
3. Final Phase 2 bis SHA
4. Branch / remote / clean-tree state
5. Files/modules changed
6. Dependencies added/removed and justification
7. DB migrations/schema changes
8. POM architecture obtained
9. E2E migration inventory
10. Test tagging taxonomy implemented
11. TDD/DoD/PR workflow implemented
12. i18n architecture obtained
13. Locale resolution rules actually implemented
14. Persistence model
15. Translation/reference-data model
16. Auth/deep-link impact
17. Coverage tool/config/baseline
18. Coverage global + critical modules
19. Structured report outputs
20. Quality aggregation/snapshot model
21. Quality Gate configuration and results
22. DEV→DEMO readiness
23. DEMO→PROD readiness model and intentionally missing real-PROD proof
24. Retry/flakiness behavior
25. Security Assurance controls executed
26. SAST/dependency/secret/DAST results and limitations
27. Pentest policy/status
28. Security debt/findings
29. Analytics architecture/event catalog/privacy
30. Audit preservation/correlation changes
31. Logging architecture
32. Knowledge Base structure
33. Feature docs created/migrated
34. Technical docs created/migrated
35. ADR inventory/status
36. `AGENTS.md` rules
37. Skills inventory and validation
38. Quality Center architecture/UI/authorization
39. Quality Center ingestion proof
40. Accessibility validation
41. Tests actually executed
42. `verify` / `verify:full`
43. CI exact SHA and run evidence
44. Bugs encountered
45. For each bug: cause, fix, regression test
46. Deviations from plan
47. Technical debt
48. Open questions intentionally deferred
49. Dependency/security audit
50. Acceptance matrix PASS/FAIL/DEFERRED
51. Explicit confirmation no Phase 3 code was started
52. Conclusion and condition to begin Phase 3

No PASS without real evidence.

---

# 101. DOCUMENTATION DELIVERABLES

Update repository documentation to the current authoritative baseline and add/normalize at minimum:

- product book reference v1.4;
- Phase 2 bis master prompt v1.2;
- engineering/testing conventions;
- POM/tagging conventions;
- TDD/DoD/PR conventions;
- coverage/reporting architecture;
- Quality Gates/promotion architecture;
- Security Assurance/pentest policy;
- Analytics/Audit/Logs architecture;
- analytics event catalog;
- logging conventions;
- i18n strategy;
- business KB index;
- technical KB index;
- traceability conventions;
- ADR index/status;
- Rules/`AGENTS.md` documentation;
- Skills index;
- Quality Center architecture;
- open questions genuinely deferred.

Historical Phase 1/2 reports remain historical and must not be silently rewritten.

---

# 102. PHASE 2 BIS OUT-OF-SCOPE GUARD

Still do NOT implement Phase 3 business workflows.

Specifically no:

- citizen report creation/persistence;
- photo/report upload workflow;
- citizen tracking token;
- citizen geolocation/report routing flow;
- smart queue;
- agent claim;
- intervention workflow;
- operational transfer;
- duplicate engine;
- report notifications;
- full report analytics;
- production routing winner;
- complete citizen anti-abuse engine.

Documenting future events/quality requirements is allowed. Runtime feature implementation is not.

---

# 103. PERFORMANCE / COST DISCIPLINE

Do not let quality infrastructure become the product.

Rules:

- reuse existing tools where they provide the needed signal;
- do not add multiple scanners/reporters for the same purpose without justification;
- store summaries, not enormous raw artifacts, in application DB;
- keep CI cost/time visible;
- do not run exhaustive flakiness loops on every commit;
- lazy/load locale catalogs appropriately;
- keep Quality Center queries paginated/indexed;
- no Elasticsearch, Kafka, Redis or dedicated analytics warehouse unless a measured need later justifies it.

Phase 2 bis must improve future delivery speed, not create a permanent maintenance tax.

---

# 104. REQUIRED ADR REVIEW FOR THIS PHASE

Before implementation, propose which ADRs are new versus updates/superseding ADRs.

At minimum evaluate ADR needs for:

- QA/POM/test taxonomy;
- i18n/locale resolution;
- quality evidence model and gates;
- Security Assurance/pentest policy;
- Analytics/Audit/Logs separation;
- Knowledge Base/documentation governance;
- persistent Rules/Skills;
- Quality Center ingestion/security.

Do not create one giant “everything Phase 2 bis” ADR if separate structural decisions deserve independent lifecycle.

---

# 105. PRE-IMPLEMENTATION AUDIT — ADDITIONAL REQUIRED OUTPUT

In addition to section 5, the audit must now report:

### QA / coverage
- current test inventory by type;
- existing tags/naming;
- current retry configuration;
- current reporters;
- current code coverage capability and baseline if measurable without modifications;
- CI runtime/cost indicators available;
- current accessibility/security checks.

### Security
- existing dependency audit;
- existing secret scanning locally/CI/GitHub if observable;
- existing static security tooling;
- existing DAST capability;
- branch/release protections that can be observed without changing remote settings;
- current security-test inventory.

### Observability
- current logger(s);
- current audit implementation;
- current correlation ID state;
- any analytics provider/events already present;
- current PII/logging risks.

### Knowledge / governance
- current docs tree;
- current business documentation coverage;
- current technical docs coverage;
- ADR inventory/status;
- existing `AGENTS.md` / agent rules;
- existing skills/workflows;
- current PR template / DoD.

### Quality Center feasibility
- current platform-admin routes/capabilities;
- safe persistence/ingestion options;
- migrations and capabilities required;
- how to feed real local/CI quality evidence without exposing privileged secrets.

Then provide a consolidated implementation plan with dependencies/migrations/ADRs and identify any decision that still requires Patrick’s explicit approval.

Do not modify files before approval.

---

# 106. FINAL RELEASE DISCIPLINE

Before declaring Phase 2 bis complete:

- `git diff --check` clean;
- working tree clean;
- final SHA recorded;
- complete local release validation on that SHA;
- DB reconstruction/reset/seed proof if DB changed;
- exact-SHA CI success for required jobs;
- no code/docs changed after validation without rerun;
- Quality Gate result captured from canonical snapshot;
- archive/delivery only from validated commit;
- all mandatory acceptance criteria = PASS;
- only explicitly impossible/manual environment items may remain DEFERRED with Patrick’s acceptance.

Do not convert an unexecuted future PROD/pentest requirement into FAIL if the phase only requires the foundation; clearly label it NOT YET APPLICABLE / DEFERRED BY POLICY in the postmortem and prove that the gate can represent it.

---

# 107. STOP CONDITION

Do not begin Phase 3 automatically.

When Phase 2 bis implementation and validation are complete:

- produce the final postmortem;
- provide final SHA and evidence;
- show the acceptance matrix;
- show any remaining DEFERRED item and why it is acceptable or blocking;
- stop;
- wait for Patrick’s explicit validation.

---

# 108. GOVERNING PRINCIPLE

ActiCiv uses **Quality by Design**.

The goal of Phase 2 bis is that a future developer or AI can quickly answer:

- what is this feature supposed to do?
- why does it exist?
- who can access it?
- what are every important edge/error case?
- which code and data enforce it?
- which tests prove it?
- which analytics/audit/log signals exist?
- which ADR explains the architecture?
- which Quality Gate proves it can be promoted?

Prefer the simplest implementation that is correct, secure, accessible, testable, locale-aware, documented, observable and maintainable.

Do not overengineer.

Do not defer foundations that would become materially more expensive immediately in Phase 3.


---

# 109. EXECUTABLE ENGINEERING RULES — LOCKED

ActiCiv must convert important, objective and repeatable conventions into executable guardrails instead of relying only on documentation. The governing rule is: **any important, objectively verifiable convention SHOULD become an executable guardrail when doing so remains simple, maintainable and proportionate to risk.**

The expected control stack is:

`Prettier → TypeScript strict → ESLint/custom ActiCiv rules → architecture tests/scripts → Quality Gates`

The implementation must remain pragmatic: choose the simplest layer capable of proving the rule reliably.

Examples of rules that must be automatically enforced where applicable:

- every Playwright test declares exactly one criticality tag: `@critical`, `@high`, `@medium` or `@low`;
- suites/describes declare the required `@route:*` and `@component:*` metadata when applicable;
- `test.only`, `describe.only` and committed focus markers are forbidden;
- skips must be explicit, justified and governed rather than silently hiding failures;
- arbitrary `waitForTimeout()` usage is forbidden except for a documented exceptional reason;
- `console.log`, `console.debug` and `console.trace` are forbidden in production application code. `console.warn`/`console.error` should normally go through the structured logger; a narrowly scoped low-level tooling/adapter exception is allowed only when technically necessary and documented.
- domain/application code cannot import Next.js, Supabase, HTTP/network clients or infrastructure implementations;
- direct analytics-provider calls such as `gtag()`/`dataLayer.push()` outside the analytics adapter are forbidden;
- dangerous TypeScript escapes such as unbounded `any` or `@ts-ignore` require explicit, narrow justification and must be minimized;
- browser/public packages cannot import privileged backend code.

For project-specific syntax rules, prefer a small internal ESLint rule/plugin when ESLint is the correct abstraction. For multi-file or semantic invariants, use architecture tests or dedicated validation scripts instead of forcing them into lint.

The expected developer experience is immediate IDE feedback, identical command-line feedback, then identical CI enforcement.

---

# 110. PLAYWRIGHT TAG VALIDATION — LOCKED

Test metadata is part of the QA contract, not optional decoration.

Mandatory criticality at test level:

- `@critical`
- `@high`
- `@medium`
- `@low`

A test missing criticality or declaring multiple criticalities must fail validation.

Route metadata belongs to the suite/describe level when the scenario is associated with an application route or logical user journey, for example:

- `@route:auth`
- `@route:admin-pro`
- `@route:citizen-report`

Component/feature metadata also belongs at suite/describe level when applicable, for example:

- `@component:forgot-password`
- `@component:invitation`
- `@component:contract-scope`

The validation must support targeted execution by criticality, route, component and useful combinations.

Optional `@type:*` metadata such as security/a11y/smoke/regression must remain governed and must not become uncontrolled tag sprawl.

---

# 111. PRODUCTION ARTIFACT HYGIENE — LOCKED

Production quality is verified on the compiled/deployable artifact, not inferred only from source code.

Any test-only, debug-only or development-only behavior must be absent from the PROD runtime artifact unless explicitly classified, justified and approved.

By default the production artifact must not contain unnecessary:

- `data-testid`, `data-test`, `data-cy` or equivalent hooks used only by tests. Semantic locators remain the default. A hook may be retained only when it has an explicit production purpose (for example controlled synthetic monitoring) and has been reviewed for security/privacy;
- Playwright/Vitest runtime code;
- test fixtures, fake users, mocks or development seed helpers;
- debug routes, test-login routes, dev panels or internal mock endpoints;
- `console.log`, `console.debug`, `console.trace`;
- local/development-only configuration;
- mock-auth, bypass-security or equivalent dangerous runtime modes;
- test credentials, tokens or secrets;
- publicly exposed source maps.

Playwright should prefer semantic locators (`getByRole`, `getByLabel`, etc.) so test-only hooks remain exceptional.

If a test hook is intentionally retained in production, document the reason and prove that it does not expose sensitive state or behavior.

Implement a `production-artifact-check` or equivalent gate that inspects generated bundles/HTML/manifests/routes/configuration/runtime dependencies after a production build.

The scanner must be precise enough to avoid meaningless false positives while still failing closed on forbidden artifacts.

---

# 112. SOURCE MAP AND ERROR EXPOSURE POLICY

Production source maps may exist only when they materially improve error observability and are handled securely.

Requirements:

- do not expose production source maps publicly by default;
- if a provider requires them, upload them through a controlled server/build process;
- user-facing errors must never expose stack traces, SQL errors, filesystem paths, tokens or implementation internals;
- internal diagnostics may retain safe technical context and a correlation identifier.

---

# 113. PRODUCTION PERFORMANCE HYGIENE — LOCKED

Production must be lean, fast and free from unjustified runtime cost.

Anything that does not provide production value and increases bundle size, network traffic, CPU, memory, rendering cost, request count or latency must be removed, disabled or explicitly justified.

Review at minimum:

- unnecessary client dependencies;
- heavy libraries used for trivial functions;
- non-tree-shakable imports;
- unnecessary polyfills;
- dead code and stale feature flags;
- oversized images/fonts/assets;
- excessive logging or analytics traffic;
- unnecessary polling/retries/preloading;
- duplicate API calls;
- N+1 database/network patterns;
- oversized JSON payloads;
- unnecessary hydration/client components;
- expensive repeated calculations;
- dev/test dependencies leaking into runtime bundles.

Do not invent unrealistic hard thresholds before real measurements exist. Establish the measurement machinery first, collect a baseline, then define explicit budgets.

---

# 114. PERFORMANCE BUDGETS AND REGRESSION GATES

The quality system must be able to record and gate performance metrics over time.

The model should support configurable budgets for metrics such as:

- initial JS/CSS payload;
- largest route chunk;
- total runtime asset weight;
- Core Web Vitals where meaningful;
- API latency;
- database latency;
- request count;
- payload size;
- regression delta against the accepted production baseline.

Exact thresholds are environment/product decisions and may be introduced progressively once measured.

A build can be functionally green and still fail promotion if a configured performance budget regresses beyond the accepted threshold.

---

# 115. RUNTIME DEPENDENCY COST GOVERNANCE

A new runtime dependency with material cost must document:

- why it is required;
- whether it runs client-side, server-side or both;
- expected bundle/runtime cost;
- whether it is tree-shakable;
- whether a smaller native/existing alternative exists;
- security and maintenance implications.

This review must remain proportional: trivial zero-cost development tooling does not require enterprise ceremony.

---

# 116. QUALITY CENTER — ARTIFACT AND PERFORMANCE DATA

Extend the Quality Center model so it can eventually surface, from the same canonical quality evidence used by gates:

- production artifact hygiene result;
- count/list of forbidden debug/test artifacts;
- client bundle sizes and largest chunks;
- performance baseline and deltas;
- configured performance gate status;
- Web Vitals / API / DB latency metrics when real data exists;
- links to the evidence/run that produced the measurement.

The Quality Center must not independently recalculate these metrics with different logic from the release gates.

---

# 117. RISK-PROPORTIONATE ENGINEERING — LOCKED

Engineering rigor must be proportional to risk and impact.

Examples:

- a local CSS adjustment does not require a new ADR or database security campaign;
- a new RLS rule requires security/RLS tests and documentation updates;
- an Auth flow change requires relevant negative/security/accessibility tests;
- a tenant migration requires migration, rebuild, RLS, rollback/recovery and audit consideration.

Rules, Skills and the Definition of Done must encode this proportionality so that ActiCiv remains fast to develop while preserving critical guarantees.

Do not let quality governance become ceremony for its own sake.

---

# 118. AUTOMATION VS HUMAN JUDGMENT

Automate objective/repeatable controls aggressively.

Keep explicit human validation where judgment is materially required, including:

- exploratory testing;
- UX/product review;
- architecture review for structural changes;
- manual/independent penetration testing;
- assistive-technology accessibility checks;
- product/legal/privacy arbitration.

A green metric or composite score never proves that the product is perfect.

---

# 119. PHASE 2 BIS ADDITIONAL ACCEPTANCE CRITERIA

Before Phase 2 bis can be accepted, provide evidence that:

1. mandatory Playwright test metadata is automatically validated;
2. prohibited focus/debug/test patterns fail automatically;
3. domain/application network/framework boundaries are automatically protected;
4. direct analytics-provider usage is automatically protected;
5. a production build is scanned for forbidden test/debug artifacts;
6. production artifact hygiene evidence is machine-readable and ingestible by the quality pipeline;
7. performance measurement/baseline machinery exists without inventing arbitrary thresholds;
8. meaningful bundle/runtime regressions can be represented by configurable gates;
9. runtime-dependency cost review is documented in engineering governance;
10. the Quality Center model can expose artifact/performance evidence from the same canonical source as the gates;
11. Rules/Skills/DoD explicitly preserve risk-proportionate engineering;
12. no Phase 3 behavior was introduced to prove these mechanisms.

Any unsupported item must be reported as FAIL or DEFERRED with a precise reason. Do not claim PASS from documentation alone when executable proof is required.
