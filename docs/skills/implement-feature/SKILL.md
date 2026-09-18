---
name: implement-feature
description: "Implémenter un besoin explicitement autorisé avec preuves proportionnées, KB et limites de phase respectées."
---

# implement-feature

## Objectif et déclencheur

Implémenter un besoin explicitement autorisé avec preuves proportionnées, KB et limites de phase respectées.

## Préconditions et lectures

Une demande produit approuvée et ses critères observables existent ; aucune autorisation du checkpoint suivant ne se déduit du mot feature. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [README](../../kb/business/README.md) ; [architecture](../../kb/technical/architecture.md).

## Impact map

Besoin → règles → acteurs/droits → données/RLS → API/UI → tests → i18n/a11y → analytics/audit/logs → KB/ADR.

## Procédure

1. Retrouver la décision courante et les KB/ADR ; expliciter les critères de succès et les erreurs, sans inventer une règle manquante.
2. Qualifier le risque. Écrire les tests d’acceptation et un test RED avant toute règle critique ; justifier une exception réellement non applicable.
3. Implémenter le minimum dans les frontières existantes ; ajouter un port seulement si une frontière technique le nécessite.
4. Valider GREEN puis refactor, tests ciblés et gates pertinentes. Examiner séparément audit atomique, analytics et logs ; ne pas instrumenter sans finalité.
5. Mettre à jour KB/droits/contrats et ADR si structurel, puis rapporter preuves et limites avant revue.

## Tests et preuves

Unitaires pour règles ; SQL/JWT/adaptateurs réels pour sécurité et persistance ; E2E/a11y/i18n pour interaction importante. Pas de test miroir du code trivial.

## Documentation

Besoin, critères satisfaits, liens de code/tests et preuves dans la KB concernée et la PR.

## Sécurité et arrêt

Arrêter si scope futur, arbitrage produit manquant ou contradiction. Refus par défaut et absence de données personnelles dans les preuves.

## Definition of Done

Critères observables et gates applicables passent ; aucun skip/retry masqué ; docs dans la même PR ; verdict humain attendu. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Créer des dossiers vides, un repository générique ou un moteur Phase 3 ; confondre compilation et acceptation.
