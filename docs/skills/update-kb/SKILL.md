---
name: update-kb
description: "Mettre à jour une fiche KB réelle et sa traçabilité dans la même PR que le contrat changé."
---

# update-kb

## Objectif et déclencheur

Mettre à jour une fiche KB réelle et sa traçabilité dans la même PR que le contrat changé.

## Préconditions et lectures

Comportement ou contrat approuvé identifié ; consulter la fiche existante plutôt que créer un doublon. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [knowledge-governance](../../kb/technical/knowledge-governance.md).

## Impact map

Requirement → KB/droits → code/tests → audit/analytics/logs → ADR → index dérivé.

## Procédure

1. Lire source actuelle, décision, ADR et code/tests ; STOP divergence avant de normaliser le comportement.
2. Préserver ID stable ; actualiser titre/phase/statut et listes de références racine. Une fiche active doit avoir code/tests existants.
3. Écrire uniquement les sections applicables : règles, variantes/erreurs, données/droits, effets, privacy/a11y/i18n, preuves et limites.
4. Relier les flux d’observabilité pertinents ; distinguer absence, futur et implémenté. Conserver les preuves historiques.
5. Exécuter docs:generate puis docs:validate, format et secrets ; relire le diff avec la fiche métier.

## Tests et preuves

Tests du validateur si sa logique change ; contrôle liens/ADR/IDs/paths/traceability. Pas de reset DB ou E2E artificiel pour une fiche seule.

## Documentation

Une fiche canonique par comportement, liens d’index ; matrice dérivée, jamais plusieurs copies manuelles.

## Sécurité et arrêt

Pas de credentials/tokens/PII ; Phase 3 et Quality Center absents ne deviennent pas active. STOP conflit de sources.

## Definition of Done

Contrat actuel documenté, références réelles, trace à jour et aucune fonctionnalité fictive. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Une fiche par fonction, longs copiés-collés du code, liens vers une source historique présentée comme courante.
