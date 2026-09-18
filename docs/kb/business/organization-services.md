---
id: "feature.organization-services"
title: "Organisations et services configurables"
domain: "organizations"
type: "business-feature"
status: "active"
introduced_in: "phase-2"
roles: ["client_admin", "platform_admin"]
requirements: ["ADR-004", "ADR-007", "ADR-010"]
related_adrs: ["ADR-004", "ADR-007", "ADR-010"]
related_code:
  [
    "packages/backend/src/modules/organizations/application/administration.ts",
    "packages/backend/src/modules/organizations/application/platform.ts",
    "apps/pro/src/app/api/configuration/route.ts",
    "apps/pro/src/app/api/platform/route.ts",
  ]
related_tests:
  [
    "integration/security.test.mjs",
    "supabase/tests/phase2.sql",
    "supabase/tests/phase2bis_locale.sql",
  ]
related_docs:
  [
    "docs/kb/business/authorization-roles.md",
    "docs/kb/technical/database-migrations.md",
    "docs/kb/technical/audit.md",
    "docs/kb/technical/analytics.md",
    "docs/kb/technical/logging.md",
  ]
---

# Organisations et services configurables

## Objet et droits

La plateforme administre les organisations avec capacité explicite `organizations.manage`. Un `client_admin` actif configure seulement sa propre organisation et ses services via `configuration.write`, et affecte leurs membres via `members.write`. Supervisor conserve un contexte opérationnel sans administration organisationnelle.

## Données et règles

Organisation active, profil actif et membership actif sont requis pour la configuration client. Les services portent code stable, nom et état `active`, `inactive` ou `archived`. Code et nom vides sont refusés. Les affectations de services doivent rester dans le même tenant ; les FK et contrôles SQL empêchent de faire confiance au seul ID présenté dans la requête.

Le changement du défaut de locale d'organisation ne modifie pas les préférences explicites des profils. Les noms propres d'organisation et de service ne sont pas traduits automatiquement. États inactifs retirent le contexte nécessaire aux accès concernés ; aucune suppression physique de masse n'est décrite comme parcours utilisateur.

## Effets, erreurs et observabilité

Les API existantes valident les DTO et autorisent côté serveur, puis passent aux cas d'usage/adaptateurs. Les refus n'accordent aucun accès partiel. Audit SQL atomique pour les données configurées ; diagnostics fixes de commande sans contenu du nom. Aucun événement analytics spécifique à cette administration. La lecture du périmètre contractuel par le client n'autorise pas son édition, réservée à la plateforme.

## Preuves, décisions et limites

Les tests JWT/SQL prouvent cross-tenant, services et capacités ; les tests locale prouvent ownership et audit de configuration. Les ADR-004/007/010 fixent ces garanties. Pas de console d'administration nouvelle : tests a11y de celle-ci non applicables. Les périmètres détaillés sont dans [droits](authorization-roles.md).
