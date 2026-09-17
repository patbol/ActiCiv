# ACTICIV — PHASE 2 MASTER PROMPT v1.1

## Core Data & Security + architecture hexagonale pragmatique

You are continuing development of the ActiCiv MVP.

Phase 1 is completed and validated.

The authoritative sources are, in order:

1. **ActiCiv — Livre Produit & Technique v1.1 FINAL A4**
2. **This Phase 2 Master Prompt v1.1**
3. **The Master Development Prompt**
4. **The Phase 1 postmortem**
5. **Explicitly validated decisions made later**

If there is a conflict, the latest explicitly validated product decision wins, then the product book, then this prompt.

Do not silently reinterpret product behavior.

---

# 1. CURRENT PHASE

You are working only on:

## PHASE 2 — CORE DATA & SECURITY

Objectives:

- organizations;
- territories;
- contractual scopes;
- services;
- professional identities;
- RBAC;
- RLS;
- verticals/categories;
- SLA foundations;
- service hours;
- audit;
- PostGIS foundations.

Do not begin the citizen reporting workflow or Phase 3.

---

# 2. PRE-PHASE REQUIREMENTS FROM THE PHASE 1 POSTMORTEM

Before business implementation:

- add/finalize root `verify` and `verify:full` commands;
- maintain a clean Git baseline;
- record the validated SHA;
- run local and CI validation against the same SHA;
- do not modify code after final validation without invalidating previous results;
- create release artifacts only from the validated commit;
- inspect targeted diffs and run `git diff --check` after fixes;
- document Node 24 activation and keep runtime reproducible.

`verify` must include at least format check, lint, TypeScript strict, unit tests and production builds.

`verify:full` must include `verify`, Playwright E2E, accessibility automation, real Phase 2 integration/RLS tests and dependency/security audit where applicable.

A missing prerequisite must fail or clearly block verification. Do not report a global success by silently skipping real tests.

---

# 3. ARCHITECTURE — LOCKED DECISION

ActiCiv remains a **modular monolith**.

It now explicitly adopts a **pragmatic hexagonal architecture** for business-critical modules.

This does NOT mean creating academic layers, generic repositories or interfaces everywhere.

The purpose is to keep business rules independent from frameworks and infrastructure while avoiding over-engineering.

## 3.1 Domain

For critical business modules, the domain contains:

- entities;
- value objects;
- invariants;
- policies;
- pure business rules.

The domain MUST NOT depend on:

- Next.js;
- Supabase SDK;
- HTTP;
- PostGIS adapters;
- Storage SDKs;
- Resend;
- Turnstile;
- logging providers;
- frontend code.

Critical domain logic must be unit-testable without starting Next.js or Supabase.

## 3.2 Application

The application layer contains:

- use cases;
- orchestration;
- transaction intent;
- ports/interfaces when a real infrastructure boundary exists.

Use cases coordinate the domain and ports. They do not contain transport-specific behavior.

## 3.3 Infrastructure

Infrastructure contains adapters implementing required ports, including as applicable:

- PostgreSQL/Supabase repositories;
- PostGIS geographic queries;
- Supabase Auth integration;
- Storage;
- email;
- anti-bot;
- logs/observability;
- external providers.

Infrastructure may depend on application/domain. Domain must never depend on infrastructure.

## 3.4 Entrypoints / adapters

Next.js Route Handlers, Server Actions or equivalent server entrypoints may:

- authenticate;
- validate transport input;
- map DTOs;
- call application use cases;
- translate results/errors into the transport response.

They must NOT become the location of business rules.

## 3.5 Scope of the hexagonal structure

Apply the explicit hexagonal split primarily to modules with significant business logic, including:

- routing;
- SLA;
- assignments;
- reports/workflow when introduced;
- authorization/permissions;
- critical tenant rules.

Simple configuration or branding modules must NOT be artificially split into empty `domain/application/infrastructure` folders when that adds no value.

Ports are introduced only when they protect a real infrastructure boundary or testability requirement.

Do not create generic repository abstractions “just in case”.

## 3.6 Monolith boundary

`packages/backend` remains internal to the modular monolith.

It MUST NOT become:

- a third application;
- a standalone API product;
- a microservice;
- a separate deployment.

A possible module shape is:

```text
packages/backend/src/modules/<module>/
  domain/
  application/
  infrastructure/
```

Only create directories actually needed by the implementation. Do not generate empty ceremonial layers.

---

# 4. ORGANIZATIONS AND PROFESSIONAL MEMBERSHIP

Locked decisions:

- one professional user belongs to one organization in the MVP;
- a professional may belong to multiple services inside that organization;
- organization membership has one primary role: `agent`, `supervisor`, or `client_admin`;
- platform super-admin is separate from client organization roles;
- `client_admin` does not implicitly inherit supervisor operational permissions;
- an Auth identity without an active business membership has no professional access.

A `client_admin` may invite/promote another `client_admin` in the same organization, but the system must prevent disabling, deleting or demoting the last active client administrator. Platform administration may recover the organization if necessary.

---

# 5. ORGANIZATIONS, SERVICES AND CONTRACTUAL SCOPE

An organization may cover multiple territories.

A territory may contain multiple organizations in different contractual/operational contexts.

Services belong to an organization. Professional service membership is explicit and tenant-coherent.

Contractual scope is controlled by the ActiCiv platform.

Client administrators may view their scope but cannot expand it.

Internal service/category configuration NEVER grants commercial coverage by itself.

Transfers remain intra-organization only in the MVP.

---

# 6. TERRITORIES AND POSTGIS

PostGIS is approved in Phase 2.

Use a pragmatic operational territory model, not a complete French administrative GIS ontology.

Expected capabilities:

- point-in-polygon;
- nested territories;
- overlapping territories;
- future distance queries;
- future duplicate/proximity foundations.

Recommended baseline:

- territory geometry: `geometry(MultiPolygon, 4326)`;
- GPS points: SRID 4326, longitude/latitude order documented;
- GiST index on geometry;
- use `geography` conversion later for distance in meters.

Reject empty, invalid, wrong-SRID or inappropriate geometries.

Do not silently repair contractual boundaries with `ST_MakeValid`.

Use `ST_Covers` for point containment so boundary points count as covered.

A parent relation may represent known geographic containment, but is not a mandatory administrative hierarchy.

Requirements:

- no cycles;
- child geometry must be contained by its parent when parent is declared;
- overlaps without inclusion are allowed;
- for non-nested overlaps, Phase 2 returns candidates and does NOT invent a routing winner.

Territory specificity for future routing must be based on actual geographic inclusion/context, not merely smallest surface or declared depth.

---

# 7. VERTICALS AND CATEGORIES

Verticals and categories are configurable data, not hardcoded application rules.

Initial vertical: `accessibility`.

Model should support:

- vertical;
- category;
- active/inactive state;
- default priority;
- future optional subcategory;
- future service routing;
- future SLA override.

Do not create category-specific database columns for PMR parking or other individual scenarios.

Contractual authorization of categories should be explicit. A newly created category must not automatically become commercially authorized by an existing contract unless an explicit rule is later approved.

---

# 8. PRIORITY

Prepare structural values:

- Normal;
- Important;
- Urgent.

Citizens never choose priority.

Priority is backend/domain controlled.

Do not implement the citizen report model in Phase 2.

---

# 9. SLA MODEL

Prepare three distinct SLA target types:

1. acknowledgment/claim: `received_at -> claimed_at`;
2. intervention: `claimed_at -> intervention_started_at`;
3. resolution: `received_at -> closed_at`.

No report timestamps are created in Phase 2.

SLA configuration may be scoped to organization, service or category.

Do not implement a complex final SLA resolver before reports use it.

The model must allow a future “most specific applicable configuration” strategy without silently deciding unresolved precedence in storage.

`on_hold` does NOT automatically pause SLA.

Only explicitly configured hold reasons may pause a given target.

No matching pause rule = no pause.

---

# 10. SLA VERSIONING AND SERVICE HOURS

SLA changes are not retroactive.

Published SLA policy versions must be immutable.

Service schedules must also be versioned because changing hours/timezone can alter historical deadlines.

Future reports must preserve/reference:

- SLA policy version;
- schedule version;
- applicable pause-rule version.

Service hours must support:

- day of week;
- open/closed;
- multiple windows per day if required;
- organization/service relationship;
- IANA timezone;
- explicit 24/7 representation.

Do not implement holiday calendars yet, but do not make later extension impossible.

For DST/local-time ambiguity use a deterministic documented rule:

- ambiguous local time during fall-back: first occurrence;
- nonexistent local time during spring-forward: first valid local time after the gap.

Test these rules.

Store system timestamps as UTC.

---

# 11. AUTHENTICATION

Use Supabase Auth for professional authentication.

Initial model:

- email/password;
- invitation-only;
- password reset;
- session renewal/logout;
- public professional signup disabled.

Use server-side session integration appropriate for Next.js (`@supabase/ssr` unless compatibility review requires another official mechanism).

Do not treat client-side `getSession()` output alone as authoritative identity proof.

Redirect URLs must be allowlisted. Do not allow arbitrary external redirect targets.

Prepare architecture for future MFA/OIDC/SAML, but do not implement them now.

---

# 12. RBAC / AUTHORIZATION

Authentication does not imply authorization.

Every sensitive operation must verify server-side:

1. authenticated identity;
2. active professional profile;
3. active organization membership;
4. required role/capability;
5. service membership where relevant;
6. actual organization of the resource.

Business roles/capabilities must be read from authoritative data, not trusted from user-editable metadata.

Avoid scattered `if role === ...` checks across UI components.

Use centralized capabilities/policies in the backend/domain/application boundary.

Keep the permission set no larger than needed for Phase 2.

---

# 13. RLS / DATABASE SECURITY

RLS is mandatory for tenant-owned/exposed business tables.

Use real PostgreSQL/Supabase policies plus minimal grants.

Do not rely only on application filters such as `organization_id = currentOrg`.

Use separate read/write policies and `USING` / `WITH CHECK` where appropriate.

RLS must prevent changing a row into another organization.

Ordinary professional operations use the authenticated user context so RLS stays effective.

Privileged/service-role access is exceptional, narrowly scoped, server-only, documented, tested and auditable.

Do not expose privileged credentials to the browser.

Functions with elevated privileges must have controlled `search_path`, grants and execution permissions.

---

# 14. PLATFORM ADMIN

Platform super-admin is a separate platform-level concept, not a client `client_admin` variant.

Client users must not be able to self-promote through metadata, profile updates or organization configuration.

Platform-admin mutation must use a distinct privileged procedure and be covered by explicit tests.

---

# 15. PROFESSIONAL INVITATIONS

Professional invitations may require privileged Auth API calls.

Before invoking privileged Auth operations, server-side logic must verify the initiating user, organization, requested role and requested services.

Auth invitation + business database write is not a distributed atomic transaction.

Therefore invitations require:

- explicit state;
- idempotency;
- resumable/recoverable partial failure behavior;
- no rights granted until business membership is valid.

Concurrent or repeated invitations must not create duplicate memberships.

---

# 16. ROUTING FAILURE VS UNCOVERED AREA

These are different concepts and must remain representable separately.

Uncovered area = no contractual organization covers the context.

Routing failure = contractual coverage exists but valid internal routing cannot be resolved due to configuration/system error.

Routing failures must remain observable for future manual handling and super-admin alerting.

Do not implement the citizen routing engine in Phase 2.

---

# 17. AUDIT

Create server-side append-only audit foundations.

Support actor, timestamp, organization where relevant, entity type/id, action, and allowlisted old/new values where appropriate.

Audit should cover later configuration mutations such as:

- roles;
- services;
- contractual scope;
- territories;
- SLA;
- service hours;
- categories/verticals;
- branding.

Do not dump entire database rows blindly into audit events.

Do not store secrets or unnecessary personal data in audit payloads.

Mutation + audit should be transactionally consistent where they belong to the same database transaction.

---

# 18. DEACTIVATION / DELETION

Do not introduce universal soft deletion.

Prefer active/inactive/archived lifecycle where historical references require persistence.

Actual deletion remains governed by retention rules.

No blanket `deleted_at` pattern.

---

# 19. DATABASE INTEGRITY AND MIGRATIONS

All schema changes use versioned Supabase migrations.

RLS protections must accompany table creation rather than being deferred to the end.

Use structural DB safeguards where appropriate:

- FK;
- composite FK for tenant consistency;
- uniqueness;
- CHECK;
- non-null;
- spatial constraints/indexes;
- transactions.

Fresh `db reset` must reproduce the expected Phase 2 state.

Do not manually mutate DB and reverse-engineer migrations afterward.

---

# 20. SEEDS

Expand seeds only for tables available in Phase 2.

Use fictitious data only.

Seed examples should include:

- at least 3 organizations;
- several services;
- agents/supervisors/client admins;
- service memberships;
- nested and overlapping territories;
- contracts/scopes;
- verticals/categories;
- service-hour configurations;
- SLA policies/versions.

No fake citizen reports in Phase 2.

---

# 21. TESTING POLICY

Testing belongs to Phase 2 implementation and is not postponed to later quality phases.

Every discovered bug gets an appropriate regression test.

Critical domain tests must be runnable independently of Next.js/Supabase when they cover pure rules.

Infrastructure adapters and security boundaries are tested separately against real Supabase/PostgreSQL/PostGIS.

## Unit/domain/application tests

At minimum as applicable:

- role/capability resolution;
- no client-admin implicit supervisor inheritance;
- inactive memberships;
- service membership rules;
- priorities/categories validation;
- SLA validation;
- schedule validation;
- 24/7 and multiple windows;
- closed days;
- DST rules;
- pause rules;
- organization invariants.

## Real integration/RLS tests

At minimum:

- same-tenant allowed access;
- cross-tenant read denied/no leakage;
- cross-tenant write denied;
- missing service membership denied;
- illegal role rejected;
- duplicate organization membership rejected;
- tenant-inconsistent service membership rejected by DB;
- client admin cannot modify contractual scope;
- forged Auth metadata has no authorization effect;
- membership deactivation takes effect despite old JWT claims;
- platform admin operations only when explicitly allowed;
- anonymous professional-data access denied;
- failed updates leave data unchanged;
- audit generated for authorized mutation;
- rollback rolls back mutation and audit together.

Remember: an RLS-denied SELECT may return zero rows rather than an HTTP error. Test for absence of leakage, not only status codes.

## Auth/invitation tests

- public signup denied;
- valid invite flow;
- inter-tenant invite denied;
- duplicate/concurrent invite safe;
- partial failure grants no rights;
- expired/reused links denied;
- password reset/session renewal/logout;
- malicious redirect rejected.

## PostGIS tests

- inside;
- outside;
- boundary point using `ST_Covers`;
- polygon hole;
- nested municipality/site;
- overlapping non-nested territories return multiple candidates without invented winner;
- invalid/empty/wrong-SRID geometry rejected;
- invalid parent/cycle rejected;
- spatial index present.

## Reproducibility

- database created from empty state;
- migrations apply cleanly;
- reset succeeds;
- seeds reproduce expected baseline.

Keep all Phase 1 tests green.

---

# 22. DEPENDENCIES

Before adding packages, verify compatibility with the validated lockfile.

Expected additions may include:

- `@supabase/ssr` for Next.js session integration;
- `@js-temporal/polyfill` encapsulated in backend SLA/schedule logic if required by runtime support;
- PostgreSQL `postgis` extension;
- pgTAP or equivalent real SQL test tooling if it materially improves RLS/DB verification.

Do not add:

- ORM without a demonstrated need;
- Redis;
- external permissions engine;
- extra database;
- extra map provider;
- state manager “just in case”;
- generic repository framework.

Every dependency must be justified.

---

# 23. ADR

Create ADRs only for structural decisions.

Likely Phase 2 ADRs:

1. tenancy + authorization + RLS model;
2. PostGIS geography/SRID/boundary semantics;
3. SLA/schedule immutable versioning and DST rules;
4. audit strategy and transaction consistency;
5. pragmatic hexagonal architecture boundaries if not already captured by the product-book decision.

Do not create ADRs for trivial naming or file placement.

---

# 24. OUT OF SCOPE

Do not implement:

- citizen report submission;
- report photos;
- citizen tracking;
- smart agent queue;
- claim/intervention workflow;
- duplicate merge workflow;
- notifications;
- operational analytics UI;
- full supervisor/admin dashboards;
- inter-organization transfers;
- automatic billing;
- CRM;
- AI;
- route optimization;
- plate recognition;
- full PWA offline behavior.

Open questions such as public tracking payload, anti-abuse radius, historical uncovered reports and duplicate-merge semantics remain open.

---

# 25. PHASE 2 ACCEPTANCE CRITERIA

Phase 2 is complete only when the relevant criteria are actually verified.

## Process/release

- `verify` passes;
- `verify:full` passes;
- clean working tree;
- commit SHA recorded;
- same SHA green in GitHub Actions;
- delivered artifact built from that validated commit.

## Database/domain

- clean Supabase local start;
- migrations from empty DB;
- reset + seeds pass;
- PostGIS enabled via migration;
- organizations/services/memberships implemented;
- contractual scopes/territories implemented;
- vertical/category foundations implemented;
- service hours/SLA foundations implemented;
- audit foundations implemented.

## Security

- professional Auth foundations operational;
- public signup disabled;
- RBAC enforced server-side;
- RLS active where required;
- cross-tenant isolation proven by negative tests;
- client admin cannot expand contractual scope;
- platform admin separate from client roles;
- no privileged credential in browser bundle.

## Geography

- PostGIS operational;
- geographic schema documented;
- `ST_Covers` containment verified;
- nested/overlapping candidates represented correctly;
- indexes present.

## Architecture

- business-critical modules respect the pragmatic hexagonal dependency direction;
- critical domain logic is unit-testable without Next.js/Supabase;
- infrastructure adapters are integration-tested separately;
- no business rule is placed in UI/transport entrypoints;
- no ceremonial empty abstractions are created.

## Quality

- lint/typecheck/builds pass;
- unit/domain tests pass;
- real integration/RLS tests pass;
- Phase 1 E2E remain green;
- new minimal Auth E2E pass where introduced;
- no critical accessibility regression;
- dependency/security review complete.

---

# 26. REQUIRED PRE-IMPLEMENTATION RESPONSE

Before writing Phase 2 code, inspect the exact validated Phase 1 repository and return:

## A. Baseline

- commit SHA;
- working-tree state;
- Node/pnpm versions;
- CI state;
- Supabase state;
- current technical debt;
- availability/results of `verify` and `verify:full`.

## B. Updated schema proposal

Describe tables/entities and principal relationships for:

- organizations;
- professional profiles/memberships;
- services/service memberships;
- platform admins;
- invitations;
- verticals/categories;
- contracts/scopes;
- territories;
- service schedules/versions;
- SLA policies/versions/targets/pause rules;
- audit events.

## C. Hexagonal module map

For each Phase 2 business-critical module, state:

- what belongs in domain;
- what belongs in application/use cases;
- what ports are actually needed;
- what infrastructure adapters implement them;
- what Next.js/server entrypoints call the use cases.

Do NOT create layers or ports that are not justified.

## D. PostGIS design

Explain geometry, SRID, indexes, `ST_Covers`, nesting and overlap semantics.

## E. RBAC/RLS model

Explain membership, role/capability resolution, service membership, platform admin, RLS/grants, and example authorized/forbidden scenarios.

## F. SLA model

Explain configuration/versioning, schedule versions, pause rules and DST convention.

## G. Planned migrations

List them in order. Do not execute yet.

## H. Dependencies

List and justify every addition.

## I. ADR

List only structural ADRs.

## J. Test plan

List concrete unit, integration, RLS, Auth, PostGIS and reproducibility tests.

## K. Risks / unresolved questions

Do not resolve open product questions implicitly.

---

# 27. STOP POINT

After presenting the updated Phase 2 architecture proposal:

**STOP.**

Do not modify the repository until the schema, hexagonal boundaries, RLS/RBAC model, PostGIS strategy, SLA model, dependencies, migrations and test plan have been explicitly approved.
