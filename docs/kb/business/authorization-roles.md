---
id: "feature.authorization-roles"
title: "Droits professionnels et capacités plateforme"
domain: "authorization"
type: "business-feature"
status: "active"
introduced_in: "phase-2"
roles: ["agent", "supervisor", "client_admin", "platform_admin"]
requirements: ["ADR-004", "ADR-007"]
related_adrs: ["ADR-004", "ADR-007"]
related_code:
  [
    "packages/backend/src/modules/authorization/domain/policy.ts",
    "packages/backend/src/modules/authorization/domain/platform.ts",
    "packages/backend/src/modules/authorization/infrastructure/supabase-context.ts",
  ]
related_tests:
  [
    "packages/backend/src/modules/authorization/domain/policy.test.ts",
    "integration/security.test.mjs",
    "supabase/tests/phase2.sql",
  ]
related_docs:
  [
    "docs/kb/technical/authorization.md",
    "docs/kb/technical/audit.md",
    "docs/kb/technical/analytics.md",
    "docs/kb/technical/logging.md",
  ]
---

# Droits professionnels et capacités plateforme

## Préconditions et règle centrale

Refus par défaut. Auth vérifiée → profil actif → membership actif → organisation active → rôle/capacité → service si requis → tenant et ownership réels. Une identité Auth valide seule ne suffit jamais. La voie plateforme exige administrateur plateforme actif et capacité explicite ; elle n'hérite pas des droits client.

## Acteurs et permissions

| Acteur         | Périmètre autorisé                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Agent          | Son contexte et les services de ses `service_memberships` actifs ; aucune administration ni lecture globale des membres              |
| Supervisor     | Son contexte, ses services et les membres des services supervisés ; aucune administration organisationnelle                          |
| Client admin   | Utilisateurs, services et configuration de son organisation ; lecture contrats et audit de configuration ; aucun héritage supervisor |
| Platform admin | Capacités explicites organisations, catalogue, contrats, territoires et audit global selon sa liste accordée                         |

`context.read` porte sur l'utilisateur courant. Les IDs fournis sont rapprochés de la vraie ressource ; ni email, ni metadata Auth, ni rôle affiché dans l'UI ne sont des autorisations.

## Refus, données et effets

Organisation inactive, profil/membership suspendu, service étranger, capacité absente et ownership incorrect sont rejetés. RLS complète les contrôles application ; les RPC SECURITY DEFINER refont les contrôles nécessaires. Aucun `service_role` dans le chemin métier ordinaire. Les lectures d'autorisation n'ajoutent pas d'événement d'audit ou analytics ; les mutations autorisées suivent le contrat d'audit et les erreurs techniques restent minimisées.

## Preuves et décisions

Unitaires de policy pour chaque rôle et faux contexte ; pgTAP sur grants/RLS ; JWT réels contre IDOR et metadata falsifiées. ADR-004 établit la distinction des rôles, ADR-007 la lecture de l'audit. Cette fiche décrit des capacités backend existantes, pas des workflows opérationnels Phase 3 ni une UI à traduire.

## Capacité quality.read — checkpoint H

La lecture du [Quality Center](quality-center.md) exige administrateur plateforme actif et capability explicite quality.read. Aucun rôle client ni metadata Auth ne l’accorde. Aucun grant automatique ; attribution opérateur/DB auditée par le mécanisme existant.
