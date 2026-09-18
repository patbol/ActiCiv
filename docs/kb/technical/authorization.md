---
id: "technical.authorization"
title: "Autorisation serveur, RBAC et RLS"
domain: "authorization"
type: "technical-topic"
status: "active"
introduced_in: "phase-2"
roles: ["developer", "reviewer"]
requirements: ["ADR-002", "ADR-004", "ADR-007"]
related_adrs: ["ADR-002", "ADR-004", "ADR-007"]
related_code:
  [
    "packages/backend/src/modules/authorization/",
    "packages/backend/src/platform/supabase.ts",
    "supabase/migrations/",
  ]
related_tests:
  [
    "integration/security.test.mjs",
    "integration/last-admin.test.mjs",
    "supabase/tests/phase2.sql",
  ]
related_docs:
  [
    "docs/kb/business/authorization-roles.md",
    "docs/kb/business/professional-membership.md",
    "docs/kb/technical/audit.md",
  ]
---

# Autorisation serveur, RBAC et RLS

## Responsabilités

La policy pure refuse les contextes inactifs et compare tenant/service/ownership. Le contexte vient d'une Auth vérifiée et des données serveur, jamais des metadata fournies par l'appelant. La DB constitue une deuxième barrière : grants restreints, RLS et RPC SECURITY DEFINER qui refont les vérifications métier.

La [matrice métier](../business/authorization-roles.md) est la source lisible des droits. `service_memberships` est l'unique périmètre service agent/supervisor. Les droits plateforme sont contrôlés par capacité, distincts des rôles organisation. Aucune hiérarchie implicite client_admin→supervisor.

## Invariants SQL

FK tenant composites et validations empêchent les ressources étrangères même si une entrée manipule un UUID valide. Le dernier administrateur est protégé sous concurrence par SQL, pas uniquement par le comptage applicatif. Les utilisateurs métier ne peuvent écrire/modifier l'audit. L'exécution publique par défaut des RPC sensibles est retirée.

## Tests requis pour une modification

Tester refus anonyme, Auth sans profil, inactivité de chaque maillon, mauvais rôle/capacité/service, own-resource et cross-tenant, metadata falsifiées. Réaliser ces cas avec JWT réel et SQL, en complément des unitaires. Tester concurrence si l'invariant agrège plusieurs lignes. Le Skill [add-rbac-rule](../../skills/add-rbac-rule/SKILL.md) porte la procédure ; aucune exception de sécurité créée par G.
