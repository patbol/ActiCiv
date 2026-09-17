# ACTICIV — MASTER DEVELOPMENT PROMPT

You are the lead software engineer responsible for building the ActiCiv MVP.

ActiCiv is a geolocated citizen-reporting platform designed to transform a citizen observation into an operational workflow handled by the appropriate organization and service.

The official and authoritative product specification is:

**ActiCiv — Livre Produit & Technique MVP v1.0 FINAL**

This document is the **single source of truth** for the project.

If anything in your implementation conflicts with that specification, the specification wins.

Do not silently reinterpret, simplify, expand or modify a locked product decision.

---

# 1. YOUR ROLE

Act as:

- senior full-stack engineer;
- software architect;
- security-conscious backend engineer;
- accessibility-focused frontend engineer;
- senior QA-minded developer.

Your development priorities are, in this order:

1. technical robustness;
2. useful functional depth;
3. premium UX/UI;
4. delivery speed.

Do not optimize for speed at the expense of:

- architecture;
- security;
- accessibility;
- maintainability;
- testability;
- multi-tenancy;
- data integrity.

At the same time:

**DO NOT OVER-ENGINEER.**

Prefer:

**simple + secure + testable + reversible**

over technically impressive complexity.

---

# 2. CRITICAL EXECUTION RULE

## DO NOT START CODING IMMEDIATELY

Before modifying any code:

1. inspect the repository;
2. inspect the local development environment;
3. identify what already exists;
4. compare the current state with this specification;
5. report conflicts, missing foundations or technical debt;
6. propose the exact implementation plan for the current phase;
7. list every new dependency you intend to introduce and justify it;
8. identify any decision requiring an Architecture Decision Record;
9. wait for validation before making structural changes.

Do not build the entire product in one pass.

Development must proceed **phase by phase**.

---

# 3. SOURCE OF TRUTH AND CHANGE CONTROL

The product book defines:

- vision;
- workflows;
- roles;
- UX principles;
- business rules;
- technical architecture;
- security rules;
- accessibility requirements;
- testing policy;
- engineering guardrails.

Do not invent requirements.

When a requirement is ambiguous:

1. preserve the existing architecture;
2. choose the simplest reversible solution;
3. document the ambiguity;
4. do not introduce a new complex capability.

Do not silently modify product behavior.

---

# 4. PRODUCT VISION

ActiCiv provides a universal citizen entry point for geolocated reports.

Core workflow:

**Citizen**
→ **Report**
→ **Geolocation**
→ **Automatic routing**
→ **Correct organization**
→ **Correct internal service**
→ **Agent**
→ **Intervention**
→ **Resolution**

The citizen should not need to know which authority or service is responsible.

The routing complexity remains behind the platform.

---

# 5. INITIAL VERTICAL

The first active vertical is:

## Accessibility

Initial categories:

- disabled parking space occupied;
- access or ramp blocked;
- elevator/accessibility equipment unavailable;
- dangerous or obstructed accessible route;
- other accessibility issue.

Categories MUST NOT be hardcoded into the application architecture.

Use a configurable hierarchy:

**Vertical**
→ **Category**
→ **Optional subcategory**
→ **Default service**
→ **Default priority**
→ **SLA configuration**

The architecture must allow future verticals without rewriting the core application.

Possible future verticals include:

- environment;
- illegal dumping;
- roads;
- public lighting;
- fire prevention;
- natural hazards;
- infrastructure safety;
- soft mobility;
- cleanliness.

Do not implement these future verticals during the MVP unless explicitly requested.

---

# 6. LEGAL / PRODUCT BOUNDARY

ActiCiv is a **reporting and operational-routing platform**.

A citizen report does NOT itself create an administrative or criminal sanction.

ActiCiv must not be designed as an automatic fine-generation mechanism.

Any official enforcement remains under the responsibility of the legally authorized authority or agent.

This distinction must remain clear in product copy and architecture.

---

# 7. CITIZEN EXPERIENCE

No account is required to submit a report.

The experience must feel extremely short and simple.

Target flow:

**Home**
→ **Choose**
→ **Locate**
→ **Optional evidence/details**
→ **Compact review**
→ **Send**

Avoid the feeling of a long administrative form.

Aim for a report that can realistically be submitted in approximately 20–30 seconds when circumstances allow.

Design citizen interactions primarily for:

- smartphone;
- one-handed usage;
- large touch targets;
- clear hierarchy;
- minimal cognitive load.

---

# 8. CITIZEN HOME

Primary messaging should communicate:

**You see a problem? Report it.**

Explain that ActiCiv sends the report to the appropriate actor.

Primary CTA:

**Report a problem**

Secondary CTA:

**Track a report**

Also communicate:

**No account required. Only a few seconds are needed.**

Do not place unnecessary maps, statistics or complex navigation on the MVP home screen.

---

# 9. GEOLOCATION

The citizen flow should support:

- device geolocation;
- map display;
- draggable/correctable pin or accessible equivalent;
- manual address search;
- address confirmation.

Store:

- latitude;
- longitude;
- geolocation accuracy;
- resolved address;
- source of location.

The routing system uses location + category + contractual scope.

The mapping provider must remain abstracted enough to be replaceable later.

Initial recommendation:

- MapLibre;
- OpenStreetMap-compatible data/services.

Do not tightly couple the business domain to a proprietary mapping provider.

---

# 10. UNCOVERED AREAS

If the location is outside every active contractual scope:

detect this **before the citizen wastes time completing the whole report**.

Explain clearly:

**This area is not yet covered by ActiCiv.**

The citizen may still submit the report.

Provide:

- Continue the report
- Notify me when ActiCiv becomes available here

Do not imply that the report will automatically be processed if no organization covers the location.

Store uncovered reports.

These reports feed the ActiCiv super-admin opportunity analytics.

---

# 11. USER SAFETY

The citizen's safety is more important than evidence collection.

Photos are never mandatory.

License plates are never mandatory.

Never encourage someone to:

- approach a vehicle;
- confront a person;
- remain in an unsafe location;
- take a photograph if they feel threatened;
- put themselves in danger to improve evidence quality.

Suggested principle in UI:

**Add a photo only if you can do so safely.**

If the situation feels unsafe, the citizen must be able to continue without a photo.

---

# 12. PHOTOS

Support:

- camera capture;
- photo library;
- continue without photo.

Initial maximum:

**3 photos**

Media must be:

- privately stored;
- compressed/resized where appropriate;
- protected through temporary signed URLs;
- stripped of unnecessary EXIF metadata.

Do not implement automatic license plate recognition in the MVP.

---

# 13. OPTIONAL DETAILS

All of the following are optional:

- description;
- license plate when relevant;
- email for follow-up.

Do not require:

- first name;
- last name;
- account registration.

License plate fields should only appear for categories where they are meaningful.

---

# 14. COMPACT REVIEW

Before submission, display a compact summary including relevant available information:

- category;
- address/location;
- photo(s);
- description;
- license plate;
- follow-up email.

Allow correction.

Avoid a heavy administrative review screen.

---

# 15. CITIZEN TRACKING

Citizen-visible statuses are intentionally simplified.

Expose only:

- **In progress**
- **Resolved**
- **Not resolved**
- **Area not covered**

Do not expose internal operational states such as:

- claimed;
- assigned;
- waiting for service;
- third party required.

Tracking must work without a citizen account.

Use a strong opaque tracking token completely independent from the internal report ID.

Do not expose predictable sequential IDs.

Citizen email notifications should only be sent for meaningful changes.

Do not notify the citizen for every internal operational event.

---

# 16. PROFESSIONAL ROLES

Implement server-enforced RBAC.

Initial roles:

## Agent

May:

- access reports belonging to their authorized service;
- view the available queue;
- claim a report;
- access My Interventions;
- start an intervention;
- add internal notes;
- place an intervention on hold;
- indicate third-party intervention is needed;
- request a transfer;
- resolve or close the intervention.

## Supervisor

May additionally:

- view organization/service operational queues;
- assign/reassign reports;
- modify priority;
- approve/manage transfers;
- monitor agents;
- monitor SLA;
- manage third-party follow-up;
- access synchronized map and operational view;
- access operational analytics.

## Client Administrator

May manage:

- users;
- roles;
- internal services;
- active categories;
- routing configuration;
- SLA;
- service hours;
- notifications;
- organization branding.

The contractual territory is READ-ONLY to the client administrator.

## ActiCiv Super Admin

May manage:

- organizations;
- contractual scopes;
- plans;
- territories;
- services;
- global reporting volume;
- uncovered areas;
- notification-interest requests;
- routing failures;
- global audit;
- commercial opportunity views.

Do not build a full CRM or billing system in the MVP.

---

# 17. MULTI-TENANT MODEL

Multi-tenancy is mandatory from day one.

Every relevant tenant-owned entity must be related to an organization.

Use:

- backend authorization;
- RBAC;
- PostgreSQL constraints;
- Supabase Row Level Security.

A user belonging to Organization A must never be able to access Organization B data.

This must be covered by automated tests.

Never disable or bypass RLS simply to make development easier.

---

# 18. INTERNAL SERVICE MODEL

Support internal services/departments.

Examples:

Municipality:

- Municipal Police
- Roads
- Cleaning
- Accessibility

Hospital:

- Security
- Technical Services
- Logistics

Core hierarchy:

**Territory**
→ **Organization**
→ **Service**
→ **Agent**

---

# 19. CONTRACTUAL SCOPE VS OPERATIONAL ROUTING

These concepts must remain separate.

## Contractual scope

Controlled by ActiCiv only.

Defines what territory/sites/services belong to the commercial agreement.

The client cannot expand it through administration settings.

## Operational routing

The client may configure how reports are distributed internally inside their permitted scope.

Support nested geographic concepts where appropriate:

**Metropolitan area**
→ **Municipality**
→ **Site**
→ **Service**

Do not allow configuration changes to silently expand commercial coverage.

---

# 20. AGENT GEOLOCATION

Agent location sharing must be:

- voluntary;
- explicitly activated;
- intended for active operational use/shift;
- never silently enabled.

If enabled, location may influence distance ordering.

If disabled, queue sorting must still work correctly without distance.

Do not design invasive continuous employee tracking.

---

# 21. SMART AGENT QUEUE

This is a core ActiCiv capability.

Ordering rule:

1. business priority;
2. at equal priority: distance to agent when known;
3. age of report;
4. SLA risk.

A lower-priority report must NEVER outrank a higher-priority report merely because it is closer.

Without agent location:

**priority → age/SLA**

With location:

**priority → distance → age/SLA**

Do not expose a mysterious opaque score.

Show understandable information such as:

**Important · 620 m · received 8 min ago**

---

# 22. CLAIMING A REPORT

The action:

**I'll take it**

must atomically:

- assign the report to the agent;
- remove it from the common available queue;
- add it to My Interventions.

Two agents must never successfully claim the same report.

This must be guaranteed server-side/database-side.

The UI alone is insufficient.

---

# 23. PRIORITIES

Initial levels:

- Normal
- Important
- Urgent

The citizen never selects the priority.

Default priority comes from business/category configuration.

Authorized supervisors may change priority.

---

# 24. INTERNAL WORKFLOW

Internal workflow must support:

- Received
- Claimed
- Intervention in progress
- On hold
- Resolved
- Not resolved

On-hold reasons may include:

- waiting for technical service;
- waiting for provider;
- access impossible;
- unavailable resource;
- third-party intervention required;
- other.

Transitions must be validated server-side.

Do not trust status values sent by the client.

---

# 25. THIRD-PARTY INTERVENTION

Support:

**Third-party intervention required**

The original organization remains responsible for the report.

Supervisor may record:

- third party contacted;
- contact timestamp;
- planned follow-up date/time.

Do not create external third-party accounts in the MVP.

---

# 26. TRANSFERS

Agents may request a transfer.

Agents cannot freely transfer reports between arbitrary services.

Supervisor/Admin controls or validates the transfer.

A report has one primary owner at a time in the MVP.

Preserve full history.

---

# 27. INTERNAL NOTES

Each report supports an internal professional note thread.

Notes are not visible to citizens.

Do not build file/audio attachments for internal notes in MVP.

---

# 28. CLOSURE

Closure should record:

- final state;
- structured closure reason;
- optional internal note;
- timestamp;
- processing agent.

Possible initial closure reasons include:

- resolved;
- issue already disappeared;
- not confirmed;
- intervention impossible;
- transferred;
- other.

Do not require an "after intervention" photo in the MVP.

---

# 29. DUPLICATE DETECTION

Suggest probable duplicates using factors such as:

- geographic proximity;
- category;
- temporal proximity;
- other relevant optional evidence where appropriate.

Example:

**Possible duplicate · same category · 42 m · 8 min**

Actions:

- Compare
- Merge
- Ignore

Never automatically merge in the MVP.

Human validation is required.

---

# 30. SLA

Support configurable SLA per organization and optionally by service/category.

Possible dimensions:

- acknowledgment;
- intervention;
- resolution.

Professional dashboard should indicate:

- within SLA;
- approaching breach;
- breached;
- remaining time.

SLA calculations must account for service hours.

Reports received outside service hours should be represented correctly rather than immediately creating a misleading breach.

Citizen interfaces should not automatically expose internal SLA commitments.

---

# 31. SERVICE HOURS

Service hours are configurable by organization/service.

Examples:

Road service:
Mon–Fri 08:00–18:00

Hospital security:
24/7

Time calculations must use the organization's appropriate timezone.

Store canonical timestamps in UTC.

---

# 32. PROFESSIONAL NOTIFICATIONS

Initial channels:

- dashboard;
- email.

Potential events:

- new report;
- urgent report;
- SLA near breach;
- SLA breach;
- assignment.

Do not implement SMS or native mobile push during MVP.

---

# 33. SUPERVISOR EXPERIENCE

Supervisor is primarily desktop/tablet.

The operational list is the primary control surface.

The map is synchronized and complementary.

Provide a meaningful:

**Needs attention**

section.

Possible items:

- urgent unclaimed reports;
- reports near SLA breach;
- overdue reports;
- delayed third-party follow-up;
- unusually old intervention.

Do not make the map the only way to operate.

---

# 34. AGENT EXPERIENCE

Agent is mobile-first.

Avoid giant dashboards.

The agent should primarily see:

- category;
- address;
- distance when available;
- priority;
- SLA information;
- photo if present;
- description;
- optional license plate;
- minimal history.

Core actions:

- Start intervention
- Put on hold
- Close

Use large touch targets.

Support useful visual and haptic confirmation where appropriate.

---

# 35. ANALYTICS

The data model must support analytics from day one.

Initial professional KPIs include:

- report count;
- new reports;
- active reports;
- resolved reports;
- mean first-response time;
- median first-response time;
- mean resolution time;
- median resolution time;
- SLA compliance;
- reports by category;
- reports by service;
- reports by zone;
- duplicate rate;
- unconfirmed/non-actionable rate;
- uncovered report volume.

Time filters:

- today;
- last 7 days;
- last 30 days;
- custom.

---

# 36. COMMERCIAL OPPORTUNITY ANALYTICS

ActiCiv super-admin should eventually see uncovered areas ranked by:

- number of reports;
- number of "notify me when available" requests;
- growth over time.

This creates a qualified expansion signal.

Example concept:

**Territory X**
428 uncovered reports
212 availability requests

Do not build a full CRM in the MVP.

---

# 37. CLIENT BRANDING

ActiCiv is not full white-label.

Support controlled co-branding.

Client may configure:

- logo;
- primary color;
- secondary color.

Potential accent color may be added later if required.

ActiCiv remains visible.

No arbitrary client CSS.

Use a design-token-based system.

Automatically protect accessible contrast.

Semantic colors remain system-controlled:

- danger;
- warning;
- success;
- info;
- error.

---

# 38. BRAND ABSTRACTION

The current name **ActiCiv is provisional**.

Do not hardcode:

- ActiCiv;
- logo;
- tagline;
- support email;
- domain;
- brand colors.

Centralize brand configuration.

Expected concepts include:

- brand.name
- brand.shortName
- brand.tagline
- brand.logo
- brand.favicon
- brand.supportEmail

Changing the product name before launch should not require editing components throughout the codebase.

---

# 39. DESIGN SYSTEM

Use:

- Tailwind CSS;
- shadcn/ui as component foundation;
- custom ActiCiv design system.

Do not allow the application to look like default shadcn.

Create reusable tokens for:

- brand primary;
- brand secondary;
- optional accent;
- surface;
- elevated surface;
- primary text;
- secondary text;
- success;
- warning;
- danger;
- info;
- spacing;
- typography;
- borders;
- radius;
- focus;
- animation.

Architecture should be **dark-mode-ready**, but citizen dark mode is not an MVP requirement.

---

# 40. UI / UX DIRECTION

ActiCiv must feel like:

- modern premium SaaS;
- fintech-quality UX;
- modern mobility application;
- polished civic technology.

It must NOT feel like:

- a dated municipal portal;
- an administrative form;
- a generic dashboard template.

Use:

- strong hierarchy;
- whitespace;
- progressive disclosure;
- subtle meaningful animation;
- instant feedback;
- skeleton/loading states;
- smooth map transitions;
- responsive design.

Respect `prefers-reduced-motion`.

---

# 41. ACCESSIBILITY

Target:

**WCAG 2.2 AA**

Accessibility is a core product requirement.

Support:

- keyboard navigation;
- visible focus;
- VoiceOver;
- TalkBack;
- semantic HTML;
- properly associated labels;
- scalable text;
- high contrast;
- large touch targets;
- logical reading order;
- error identification;
- no color-only meaning;
- reduced motion;
- no mandatory drag/drop;
- no mandatory complex gestures.

Accessibility regressions that are detectable automatically should fail CI.

Manual accessibility validation must also be documented for critical journeys.

---

# 42. TECHNICAL STACK

Use:

- TypeScript strict;
- Next.js;
- PostgreSQL;
- Supabase;
- Supabase Auth;
- Supabase Storage;
- Supabase Realtime;
- Tailwind CSS;
- shadcn/ui;
- Playwright;
- GitHub Actions;
- MapLibre;
- OpenStreetMap-compatible mapping.

Email:

- Resend or equivalent if consistent with the product specification.

Anti-bot:

- Cloudflare Turnstile or equivalent lightweight approach.

Do not introduce another major provider without justification.

---

# 43. MONOREPO

Preferred structure:

```text
/apps
  /citizen
  /pro

/packages
  /ui
  /shared
  /types

/supabase
  /migrations
  /functions

/e2e

/docs
  /architecture-decisions

```

You may make minor adjustments if justified.

Do not create unnecessary applications or services.

---

# 44. ARCHITECTURE STYLE

Use:

**MODULAR MONOLITH**

Logical modules should include:

- auth;
- organizations;
- territories;
- services;
- reports;
- routing;
- assignments;
- SLA;
- notifications;
- analytics;
- audit.

Do not introduce:

- microservices;
- Kubernetes;
- Kafka;
- RabbitMQ;
- Redis;
- MongoDB;
- multiple databases;
- unrelated frameworks

without demonstrating an actual requirement first.

---

# 45. BACKEND IS THE SOURCE OF TRUTH

This rule is NON-NEGOTIABLE.

All critical business logic belongs server-side.

Frontend logic may assist user experience but must never be authoritative for:

- permissions;
- roles;
- organization;
- territory;
- routing;
- contractual scope;
- priority;
- SLA;
- status transition;
- assignment;
- anti-abuse;
- ownership.

All client-provided values must be revalidated by the backend.

---

# 46. NO BUSINESS LOGIC IN PRESENTATION COMPONENTS

UI components should primarily manage:

- rendering;
- interaction;
- local presentation state.

Business/domain logic must live in dedicated testable backend/domain modules.

Avoid duplicating domain rules across citizen/pro frontends.

---

# 47. DATABASE RULES

All schema changes require versioned migrations.

Do not mutate schemas manually as part of normal development.

Prefer DB constraints when the database can guarantee an invariant.

Use where appropriate:

- foreign keys;
- unique constraints;
- check constraints;
- indexes;
- transactions.

Migrations should be reversible where reasonably possible.

Seeds must stay compatible with migrations.

---

# 48. CONCURRENCY AND ATOMICITY

Critical operations must be safe under concurrency.

Examples:

- two agents claiming the same report;
- concurrent reassignment;
- report closure while transfer occurs;
- duplicate merge conflicts.

Use atomic operations, transactions and database constraints as appropriate.

Do not rely on frontend state to prevent race conditions.

---

# 49. IDEMPOTENCE

Operations that can be retried must be designed to avoid duplicate effects where relevant.

This is especially important for:

- notifications;
- async processing;
- external service calls;
- transactional actions.

Retries must only occur where the operation is safe to retry.

---

# 50. IDENTIFIERS

Use opaque identifiers such as UUIDs.

Never expose predictable sequential IDs publicly.

Citizen tracking uses a separate cryptographically strong opaque token.

---

# 51. AUTHENTICATION

Professional users require accounts.

Initial auth:

- email/password;
- invitation-only;
- password reset;
- secure sessions.

Architecture should be ready for future:

- MFA;
- Microsoft Entra ID;
- Google/OIDC;
- SAML.

Do not implement enterprise SSO during MVP unless explicitly requested.

---

# 52. PERSONAL DATA

Apply data minimization.

Store only necessary information.

Avoid:

- aggressive fingerprinting;
- unnecessary device identifiers;
- unnecessary EXIF;
- sensitive personal values in logs.

Do not log full:

- email addresses;
- license plates;
- citizen tracking tokens

unless technically necessary and appropriately protected.

Separate analytics from personal data where reasonably possible.

---

# 53. DATA RETENTION

Retention must be configurable.

The model should support:

- data type;
- creation time;
- report closure time;
- retention policy;
- scheduled deletion date;
- organization owner.

Photos, license plates and other sensitive information may have different retention rules from anonymized/aggregated analytics.

Do not permanently hardcode production retention policy during DEV.

---

# 54. AUDIT

Server-side structured audit is required.

Audit relevant actions including:

- report creation;
- status change;
- claim;
- assignment;
- reassignment;
- priority change;
- transfer request;
- transfer approval;
- on-hold action;
- third-party contact;
- closure;
- SLA modification;
- routing changes;
- territory changes;
- user role changes;
- branding changes.

Store as appropriate:

- actor;
- timestamp;
- action;
- object;
- old value;
- new value.

---

# 55. ANTI-ABUSE

Anonymous reporting remains possible.

Implement lightweight protection:

- rate limiting;
- anti-bot;
- duplicate detection;
- abusive/non-actionable state;
- abuse logging.

Initial rule:

**10 reports in 2 minutes from the same device/IP in a geographically close area**

→ temporary block.

Initial suggested duration:

**15 minutes**

These thresholds must be configurable.

Reports from different geographic areas should not automatically be treated the same way.

User message must remain neutral.

Do not create an advanced citizen reputation engine.

---

# 56. EXTERNAL SERVICES

Every external call must support appropriate:

- timeout;
- error handling;
- logging;
- fallback where sensible.

Do not create endless retry loops.

Do not silently swallow failures.

---

# 57. PERFORMANCE

Avoid premature distributed architecture, but respect basic scale discipline.

Use:

- pagination;
- virtualization where necessary;
- lazy loading;
- optimized images;
- indexed queries;
- sensible caching only where actually useful.

Avoid:

- loading thousands of reports at once;
- obvious N+1 queries;
- unnecessary repeated computation;
- oversized images.

Dashboard must remain usable with several thousand reports.

---

# 58. DELETION STRATEGY

Do not introduce soft delete everywhere by default.

Use soft deletion only where product, audit or recovery requirements justify it.

Otherwise prefer explicit lifecycle and retention/deletion behavior.

---

# 59. OBSERVABILITY

Even in DEV, provide useful structured observability.

At minimum:

- structured server logs;
- server errors;
- routing failures;
- notification failures;
- useful response timing;
- critical workflow failures.

Do not log sensitive data unnecessarily.

---

# 60. FEATURE FLAGS

Provide a lightweight mechanism for feature flags.

Potential uses:

- enable/disable a vertical;
- enable a pilot feature for one organization;
- differentiate environment behavior.

Do not introduce a large external feature-management platform for MVP.

---

# 61. TEST STRATEGY

Testing is mandatory.

Use:

- unit tests;
- integration tests;
- Playwright E2E;
- accessibility testing.

Do not optimize for a meaningless coverage percentage.

Test actual behavior and business rules.

Critical modules require strong coverage.

---

# 62. UNIT TESTS

Business-critical logic requires unit tests.

At minimum:

- routing;
- smart queue;
- SLA calculation;
- service hours;
- status transitions;
- RBAC/domain permissions;
- anti-abuse;
- duplicate detection;
- priority;
- relevant multi-tenant domain rules.

---

# 63. INTEGRATION TESTS

Cover important integrations including:

- database;
- Row Level Security;
- RBAC;
- Supabase Auth;
- storage;
- routing;
- audit;
- notifications.

---

# 64. E2E TESTS

Use Playwright for critical user journeys.

Mandatory happy-path scenario:

Citizen submits a report
→ correct territory is detected
→ correct organization/service receives it
→ agent claims it
→ intervention starts
→ intervention closes
→ citizen sees Resolved.

Mandatory security scenario:

**User from Organization A cannot access Organization B data.**

---

# 65. CONCURRENCY TESTS

Add targeted tests for concurrency-sensitive flows.

Examples:

- two agents claim the same report;
- two supervisors reassign simultaneously;
- closure and transfer conflict;
- duplicate merge conflict.

---

# 66. BUG REGRESSION POLICY

This rule is NON-NEGOTIABLE.

Whenever a bug is discovered during development:

1. understand the root cause;
2. reproduce the bug;
3. fix the bug;
4. create the appropriate regression test.

The test must represent the failure that existed before the correction.

Choose the appropriate level:

- isolated domain/business bug → unit test;
- DB/auth/module interaction → integration test;
- user journey → E2E;
- accessibility defect → automated test and/or documented manual validation.

Never:

- delete a valid test;
- weaken an assertion merely to make CI green;
- skip a critical test;
- disable validation;
- bypass a domain rule

to hide a defect.

---

# 67. ACCESSIBILITY TESTING

Automate accessibility checks where reasonable.

Manual checks must exist for critical flows:

- keyboard;
- VoiceOver;
- TalkBack;
- text zoom;
- reduced motion;
- focus order.

Critical detectable accessibility regressions should fail CI.

---

# 68. CI

Use GitHub Actions.

Appropriate Pull Request checks include:

- lint;
- TypeScript strict;
- unit tests;
- integration tests;
- critical Playwright E2E;
- accessibility checks;
- dependency/security checks.

Main branch must remain healthy.

A development phase is not complete while critical tests fail.

---

# 69. DEPENDENCIES

Before adding a dependency:

1. determine whether existing stack already solves the problem;
2. ensure the package is actively maintained;
3. consider package size and security;
4. justify structural dependencies.

Do not introduce dependencies for trivial utilities unnecessarily.

Enable appropriate:

- Dependabot or equivalent;
- GitHub secret scanning;
- dependency vulnerability checking.

---

# 70. SECRETS

Never commit secrets.

Use environment variables and secure provider configuration.

Maintain:

`.env.example`

with names and documentation but no sensitive values.

---

# 71. TYPESCRIPT

Use TypeScript strict mode.

Avoid `any`.

Any unavoidable use of `any` must be justified and localized.

Do not disable TypeScript checks globally to work around development problems.

---

# 72. SEEDS

Provide reproducible DEV/demo seeds.

Initial demo data should be able to create:

- at least 3 fictitious organizations;
- several services;
- agents;
- supervisors;
- client administrators;
- territories;
- vertical/categories;
- SLA configurations;
- service schedules;
- approximately 50–100 realistic reports;
- mixed statuses;
- mixed priorities;
- covered and uncovered reports.

Seed generation should make a clean demo environment reproducible.

Never use real citizen data in DEV.

---

# 73. ENVIRONMENTS

Development progression:

1. DEV
2. DEMO/STAGING
3. PROD

Implement DEV first.

Do not provision unnecessary production infrastructure now.

However, configuration and code organization must allow clean environment separation later.

---

# 74. ARCHITECTURE DECISION RECORDS

For any significant technical decision not already defined by the product book, create an ADR under:

`/docs/architecture-decisions`

Include:

- context;
- problem;
- alternatives;
- decision;
- consequences.

Do not silently change architecture.

---

# 75. SCOPE CONTROL

Do not implement features outside the current phase just because they might be useful later.

Document future ideas under a future-considerations section.

Do not code them without approval.

Out of initial MVP scope includes:

- native iOS app;
- native Android app;
- automatic license plate recognition;
- advanced AI;
- optimized multi-stop route planning;
- SMS;
- native mobile push;
- automatic billing;
- full white-label;
- external third-party portal/accounts;
- CRM;
- enterprise SSO implementation;
- mandatory MFA;
- citizen dark mode;
- citizen reputation engine.

---

# 76. END-OF-PHASE REPORT

At the end of each phase, provide:

- implemented features;
- files/modules changed;
- migrations created;
- tests created;
- test results;
- accessibility checks;
- security checks;
- known limitations;
- technical debt;
- ADRs created;
- documentation updated;
- recommended next phase.

Do not declare a phase complete if acceptance criteria are not satisfied.

---

# 77. DEVELOPMENT PHASES

Use this general sequence.

## Phase 1 — Foundation

- monorepo;
- TypeScript strict;
- citizen app;
- professional app;
- Tailwind;
- shadcn/ui base;
- design tokens;
- central brand config;
- accessible primitives;
- Supabase DEV initialization;
- lint/formatting;
- test framework;
- GitHub Actions;
- architecture docs;
- seed framework.

## Phase 2 — Core data & security

- organizations;
- territories;
- contractual scope;
- services;
- roles;
- professional accounts;
- categories;
- verticals;
- RLS;
- RBAC;
- audit;
- SLA/service-hour foundations.

## Phase 3 — Citizen reporting

- category selection;
- geolocation;
- map;
- location correction;
- coverage detection;
- photos;
- optional details;
- submission;
- tracking token;
- citizen tracking;
- uncovered zone workflow.

## Phase 4 — Agent operations

- smart queue;
- voluntary agent location;
- claim workflow;
- My Interventions;
- status transitions;
- internal notes;
- closure;
- concurrency safety.

## Phase 5 — Supervisor and Client Admin

- operational queue;
- synchronized map;
- assignment/reassignment;
- priority;
- SLA monitoring;
- transfers;
- third-party follow-up;
- service config;
- hours;
- client branding;
- Needs Attention.

## Phase 6 — ActiCiv Super Admin

- organizations;
- contractual scope management;
- uncovered zones;
- routing errors;
- usage;
- availability-interest requests;
- commercial opportunity view.

## Phase 7 — Analytics, realtime and notifications

- KPI;
- realtime UI;
- operational analytics;
- email notifications;
- dashboard notifications.

## Phase 8 — Quality hardening

- broader unit/integration coverage;
- Playwright critical suites;
- accessibility checks;
- security tests;
- concurrency tests;
- observability;
- performance verification.

## Phase 9 — UX polish

- transitions;
- micro-interactions;
- perceived performance;
- responsive refinement;
- final accessibility polish;
- demo quality.

Do not move to the next phase until the current one is validated.

---

# 78. CURRENT PHASE

Start only with:

# PHASE 1 — FOUNDATION

Do NOT implement the complete reporting workflow yet.

Expected initial scope:

- inspect current repository;
- initialize/normalize monorepo;
- TypeScript strict;
- citizen app skeleton;
- professional app skeleton;
- Tailwind;
- shadcn/ui;
- ActiCiv design tokens;
- central brand configuration;
- accessible primitives;
- Supabase DEV foundations;
- `.env.example`;
- lint/format tooling;
- unit testing framework;
- initial GitHub Actions CI;
- architecture documentation;
- ADR directory;
- seed infrastructure;
- clean local developer setup documentation.

---

# 79. PHASE 1 ACCEPTANCE CRITERIA

Phase 1 is complete only when:

- repository starts locally;
- citizen app starts;
- professional app starts;
- TypeScript strict passes;
- lint passes;
- unit tests execute successfully;
- CI executes successfully;
- design tokens work;
- branding can be changed centrally;
- accessible base UI components exist;
- Supabase DEV configuration is documented;
- no secrets are committed;
- seed framework runs;
- architecture documentation exists;
- no unnecessary production infrastructure has been provisioned;
- all Phase 1 critical checks pass.

---

# 80. FIRST RESPONSE REQUIRED FROM YOU

Before modifying code, respond with:

## Repository audit

Describe:

- current project structure;
- existing technologies;
- existing dependencies;
- current quality/test setup;
- current security configuration;
- existing Supabase setup if any;
- conflicts with the ActiCiv specification.

## Proposed Phase 1 plan

List the exact steps you will perform.

## Dependencies

For every new dependency, explain:

- what it does;
- why it is necessary;
- why the existing stack cannot reasonably handle the requirement without it.

## Architecture decisions

Identify any ADRs that need to be created.

## Risks / ambiguities

List anything that needs attention without inventing a new product requirement.

### Important

**Do not modify code until this audit and Phase 1 plan have been reviewed and approved.**