---
name: database-migration
description: "Faire évoluer le schéma par migration additive avec upgrade, reprise, seed et reconstruction prouvés."
---

# database-migration

## Objectif et déclencheur

Faire évoluer le schéma par migration additive avec upgrade, reprise, seed et reconstruction prouvés.

## Préconditions et lectures

Changement DB explicitement autorisé, base cible identifiée, données/backup et stratégie de récupération connus. Un reset détruit les données locales : jamais par défaut sur une cible non confirmée. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [database-migrations](../../kb/technical/database-migrations.md) ; [authorization](../../kb/technical/authorization.md) ; [audit](../../kb/technical/audit.md) ; [release-reproducibility](../../kb/technical/release-reproducibility.md).

## Impact map

Schéma/données → compatibilité/backfill → contraintes/tenant → RLS/grants → audit → seed → upgrade/reset → reprise/preuve.

## Procédure

1. Lire migrations publiées, SQL tests, seed et callers. Ne modifier aucun fichier de migration publié/audité ; créer le prochain fichier versionné.
2. Écrire RED des contraintes nouvelles : FK tenant, CHECK, unicité nullable réelle (NULLS NOT DISTINCT ou index partiels), droits et rollback audit.
3. Écrire migration et backfill compatibles ; limiter verrous/coût et expliciter ordre, risques et plan corrective-forward ou restauration.
4. Prouver upgrade d’une DB de baseline, compatibilité des données/seeds puis reset depuis vide sur cible locale autorisée ; conserver les preuves séparées.
5. Exécuter pgTAP, intégration JWT/adaptateurs et release evidence du SHA candidat selon applicability ; documenter récupération et limites.

## Tests et preuves

pgTAP positif/négatif, RLS/grants, mutation+audit atomique, intégration réelle et concurrence si invariant agrégé.

## Documentation

KB données/métier/audit et ADR si structurel ; plan backfill, seed, upgrade, reconstruction et récupération.

## Sécurité et arrêt

Pas de migration destructive automatique ni secrets en logs ; STOP cible douteuse, absence de sauvegarde pour données à conserver, contrat non arbitré.

## Definition of Done

Upgrade et reconstruction prouvés, contraintes tenant/nullable correctes, droits/audit préservés, candidat identifié. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Modifier l’historique, utiliser UNIQUE naïf avec NULL, prétendre rollback par suppression du fichier ou reset PROD.
