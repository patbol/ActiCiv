---
id: template.technical-topic
title: "Modèle de fiche technique"
introduced_in: phase-2bis-a
domain: governance
type: technical-topic-template
status: template
roles: []
requirements: []
related_adrs: []
related_code: []
related_tests: []
related_docs: []
---

# Modèle de fiche technique

Modèle uniquement. Créer un ID `technical.*`, renseigner les liens réels puis choisir le statut selon la [traçabilité](../../quality/traceability.md). Aucun placeholder dans une fiche active.

## Contexte, responsabilité et état

Besoin, périmètre/checkpoint, comportement existant et limites. Distinguer implémenté, proposé et non applicable.

## Architecture et contrats

Modules, dépendances permises, domaine/application/ports/adaptateurs/entrées lorsque pertinents. Décrire données, API/RPC, validation et codes d'erreur utiles ; éviter des couches sans responsabilité.

## Sécurité et exploitation

Identité, rôles/capacités, RLS/grants, secrets, atomicité d'audit, reprise/idempotence, configuration, migrations/seed/backfill et récupération si concernés. Aucune donnée sensible dans les exemples.

## Interfaces et observabilité

Frontières serveur/client, impact accessibilité/i18n, Analytics/Audit/Logs distincts et corrélation. Dépendances : besoin, alternatives, coût runtime et maintenance. Mesures et budgets seulement lorsqu'ils existent et sont approuvés.

## Vérification et traçabilité

Tests comportementaux et négatifs, chemins réels, commandes pertinentes, preuves avec SHA/environnement, contrôles humains, sources/ADR et liens vers fiches métier. Les exigences futures restent identifiées comme telles.

## Conséquences et limites

Alternatives et tradeoffs (via ADR si structurels), dettes réelles, décisions ouvertes, propriétaire/échéance lorsque connus et historique de changement.
