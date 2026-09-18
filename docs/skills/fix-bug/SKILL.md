---
name: fix-bug
description: "Reproduire et corriger un défaut avec test de non-régression, sans réécrire le contrat pour justifier le bug."
---

# fix-bug

## Objectif et déclencheur

Reproduire et corriger un défaut avec test de non-régression, sans réécrire le contrat pour justifier le bug.

## Préconditions et lectures

Un symptôme et un attendu sont fournis ou reproductibles ; chercher l’attendu dans les sources, pas dans l’intuition. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [testing](../../kb/technical/testing.md) ; [README](../../kb/business/README.md).

## Impact map

Symptôme → attendu/KB → frontière fautive → rôles/données → régression → effets/observabilité → preuve.

## Procédure

1. Reproduire et relever contexte/entrée minimisée ; comparer l’attendu aux KB/ADR.
2. Écrire un test de régression qui échoue pour la bonne raison lorsque faisable ; documenter pourquoi une reproduction automatisée serait impossible.
3. Corriger la cause au niveau responsable, puis GREEN et refactor sans changement de périmètre.
4. Exécuter la régression ciblée puis élargir selon risque ; un test après retry ne clôture pas le défaut.
5. Mettre à jour la KB seulement si le comportement attendu a réellement changé et a été approuvé ; consigner le défaut/preuve dans le bilan.

## Tests et preuves

Test observable du cas défectueux et voisin négatif ; vrais adaptateurs/SQL pour bug Auth/RLS/concurrence. Ne pas créer de test miroir pour une correction de lien.

## Documentation

Lien du test de non-régression, commande RED/GREEN et limites ; ADR seulement si choix structurel change.

## Sécurité et arrêt

Expurger reproduction et journaux ; arrêter si comportement attendu contradictoire, données réelles menacées ou correction exige phase non autorisée.

## Definition of Done

Cause corrigée, régression passe sans masquer les assertions, contrôles adaptés satisfaits. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Supprimer un test valide, ajouter un sleep/retry, ou changer la documentation pour déclarer le bug normal.
