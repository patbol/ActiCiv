---
id: "technical.architecture"
title: "Monolithe modulaire et frontières hexagonales"
domain: "architecture"
type: "technical-topic"
status: "active"
introduced_in: "phase-1"
roles: ["developer", "reviewer"]
requirements: ["ADR-001", "ADR-002", "ADR-004"]
related_adrs: ["ADR-001", "ADR-002", "ADR-004"]
related_code:
  [
    "packages/backend/src/",
    "packages/types/src/architecture.test.ts",
    "eslint.config.mjs",
  ]
related_tests:
  [
    "packages/types/src/architecture.test.ts",
    "packages/types/src/conventions.test.ts",
  ]
related_docs:
  [
    "docs/kb/technical/auth.md",
    "docs/kb/technical/authorization.md",
    "docs/kb/technical/analytics.md",
  ]
---

# Monolithe modulaire et frontières hexagonales

## Organisation réelle

Citizen et Pro sont des entrypoints Next distincts d'un monolithe TypeScript. Le backend est server-only ; UI, shared et types restent sans privilèges. Les cas d'usage critiques habitent les modules backend, pas les pages. Aucun microservice, repository universel ou dossier vide requis.

| Module        | Domaine et application                         | Ports/adaptateurs                                                     | Entrée existante           |
| ------------- | ---------------------------------------------- | --------------------------------------------------------------------- | -------------------------- |
| Auth          | redirections, session, invitation              | ProfessionalSession, Invitations, IdentityInviter ; Supabase SSR/Auth | pages/actions Auth Pro     |
| Autorisation  | policy professionnelle et plateforme, contexte | contexte Supabase vérifié                                             | composition serveur Pro    |
| Organisations | transition dernier admin, administration       | Administration, adaptateurs SQL/platform                              | API configuration/platform |
| Couverture    | coordonnées, contrats/territoires, candidats   | CoverageAdministration et lecture Supabase/PostGIS                    | API platform/backend       |
| Horaires      | validation, fenêtres par date, publication     | ZonedTime/Temporal, ScheduleWriter/SQL                                | API configuration          |
| SLA           | cibles, publication                            | SlaWriter/SQL                                                         | API configuration          |
| Locales       | préférences/traductions                        | ports et adaptateurs SQL, résolution SSR                              | API locale/SSR             |

Les compositions `platform/administration.ts`, `configuration.ts` et `platform-administration.ts` adaptent les ports aux RPC. Le domaine ne dépend ni de Next, ni de Supabase, ni de HTTP. L'application orchestre via ports et n'accède pas au réseau. Les logs/analytics composés côté serveur n'introduisent pas de fournisseur dans le domaine ; AuthObserver est un port pur optionnel.

## Contrôles et évolution

ESLint et les tests d'architecture protègent imports/réseau, entrée backend privilégiée et limites client. Ils sont syntaxiques, complétés par l'artefact PROD compilé. Une nouvelle frontière structurelle appelle une ADR, pas chaque fichier trivial. Les tables et RPC restent des garanties actives, non des détails à contourner par l'UI. G ne change aucune frontière applicative.
