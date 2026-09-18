---
id: "technical.database-migrations"
title: "Migrations, contraintes et reconstruction"
domain: "database"
type: "technical-topic"
status: "active"
introduced_in: "phase-2"
roles: ["developer", "reviewer"]
requirements: ["ADR-002", "ADR-003", "ADR-004", "ADR-007"]
related_adrs: ["ADR-002", "ADR-003", "ADR-004", "ADR-007"]
related_code:
  ["supabase/migrations/", "supabase/seed.sql", "scripts/reconstruct-db.mjs"]
related_tests:
  [
    "supabase/tests/phase2.sql",
    "supabase/tests/phase2_closure.sql",
    "integration/security.test.mjs",
  ]
related_docs:
  [
    "docs/kb/technical/authorization.md",
    "docs/kb/technical/audit.md",
    "docs/kb/technical/release-reproducibility.md",
  ]
---

# Migrations, contraintes et reconstruction

## Modèle existant

Migrations ordonnées : extensions/PostGIS, organisations/profils, audit, services/invitations, catalogue, couverture, horaires, SLA, hardening Phase 2, locales puis contexte observabilité. Les tables ne contiennent pas de reports Phase 3. Les seeds locaux sont synthétiques et ne sont pas un provisionnement PROD.

## Discipline de changement

Ne jamais éditer une migration publiée. Ajouter une migration et traiter compatibilité des données existantes, backfill, FK tenant, CHECK et unicité nullable (NULLS NOT DISTINCT ou index partiels adaptés), grants/RLS, triggers d'audit et index utiles. Mutation auditable et audit sont une transaction ; aucun writer applicatif secondaire.

Un changement doit être prouvé par upgrade depuis la baseline existante et reconstruction depuis vide avec seed. Le rollback n'est pas une suppression du fichier de migration : privilégier une migration corrective compatible ; documenter sauvegarde/restauration et perte potentielle avant opération. Le script de reconstruction attend l'environnement Supabase local identifié et ne doit pas viser une base utilisateur non autorisée.

## Tests et exploitation

pgTAP prouve contraintes et RLS ; JWT/adaptateurs vérifient les frontières réelles. `pnpm release:verify --rebuild-db` rattache la reconstruction à un SHA propre lorsqu'une release DB le requiert. Aucune DB changée en G : pas de reset exécuté pour corriger des documents. La procédure complète est [database-migration](../../skills/database-migration/SKILL.md).
