---
id: "feature.professional-membership"
title: "Appartenance professionnelle et dernier administrateur"
domain: "organizations"
type: "business-feature"
status: "active"
introduced_in: "phase-2"
roles: ["client_admin", "platform_admin"]
requirements: ["ADR-004", "ADR-007"]
related_adrs: ["ADR-004", "ADR-007"]
related_code:
  [
    "packages/backend/src/modules/organizations/application/administration.ts",
    "packages/backend/src/modules/organizations/domain/membership.ts",
    "packages/backend/src/platform/administration.ts",
  ]
related_tests:
  [
    "integration/last-admin.test.mjs",
    "integration/security.test.mjs",
    "supabase/tests/phase2.sql",
  ]
related_docs:
  [
    "docs/kb/business/authorization-roles.md",
    "docs/kb/technical/authorization.md",
    "docs/kb/technical/audit.md",
    "docs/kb/technical/analytics.md",
    "docs/kb/technical/logging.md",
  ]
---

# Appartenance professionnelle et dernier administrateur

## Objet, acteurs et préconditions

Le membership relie un profil professionnel à son organisation et à un rôle exclusif. Le MVP ne permet pas plusieurs organisations actives par professionnel. Un `client_admin` gère les membres de son organisation, sans acquérir le rôle supervisor. Les opérations plateforme ont leurs capacités distinctes, décrites dans [droits](authorization-roles.md).

## Règles et transitions

Un changement de rôle ou d'activité exige la chaîne d'autorisation complète et l'ownership de la ressource lue. Les memberships service définissent les services d'opération de l'agent et de supervision du supervisor. Aucun second modèle de supervision.

Le dernier `client_admin` actif doit être conservé : la désactivation ou rétrogradation ne peut supprimer le dernier administrateur effectif, y compris par désactivation de son profil. Le contrôle applicatif facilite le rejet mais la garantie de concurrence est SQL avec verrouillage. Deux requêtes simultanées ne peuvent chacune considérer l'autre administrateur comme restant.

## Données, erreurs et effets

Profils, memberships organisation et service restent distincts ; un profil suspendu ne peut pas exploiter un ancien membership actif. Refus cross-tenant, rôle inconnu ou transition dernier admin n'entraînent aucun changement partiel. Les mutations auditées ont acteur serveur, whitelist et corrélation dans la même transaction. Pas d'analytics propre au membership ; le logger configuration émet seulement un résultat technique minimisé.

## Preuves et limites

`integration/last-admin.test.mjs` couvre les courses rôle/rôle, rôle/profil et profil/profil avec vraies connexions ; pgTAP et tests JWT couvrent tenant et droits. Cette fondation expose des commandes/API, pas une nouvelle UI de gestion des membres : a11y d'un tel écran non applicable. Codes de rôles stables indépendants de la locale. Invariants fixés par ADR-004/007 ; aucun arbitrage supplémentaire ouvert.
