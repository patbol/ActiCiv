---
name: add-business-rule
description: "Ajouter un invariant métier approuvé côté domaine/serveur et SQL lorsque nécessaire."
---

# add-business-rule

## Objectif et déclencheur

Ajouter un invariant métier approuvé côté domaine/serveur et SQL lorsque nécessaire.

## Préconditions et lectures

La règle, acteurs, limites et erreurs sont décidés ; déterminer si la DB doit résister à une autre voie d’accès. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [architecture](../../kb/technical/architecture.md) ; [database-migrations](../../kb/technical/database-migrations.md) ; [authorization-roles](../../kb/business/authorization-roles.md).

## Impact map

Invariant → états/transitions → rôles → agrégat/tenant → concurrence/SQL → tests → audit → KB.

## Procédure

1. Écrire exemples nominal, limites et violations ; identifier l’emplacement serveur et le port éventuel.
2. Écrire un test RED, dont contournement et concurrence si plusieurs lignes sont concernées.
3. Implémenter le domaine pur ; renforcer SQL via nouvelle migration si contrainte persistée. Ne pas placer la seule garantie dans l’UI.
4. Valider GREEN, invariants voisins et atomicité mutation/audit ; vérifier coût et simplicité.
5. Décrire invariant, erreurs et tests dans la KB ; ADR uniquement si décision structurante.

## Tests et preuves

Unitaires, pgTAP pour invariants SQL, intégration/concurrence réelle si applicable.

## Documentation

KB métier et technique mises à jour avec droits et effets, traceability régénérée.

## Sécurité et arrêt

Arrêter si règle non arbitrée ; contrôler cross-tenant, ownership et whitelist d’audit.

## Definition of Done

Invariant protégé aux frontières pertinentes, preuves négatives et nominales présentes. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Confondre pré-validation UI et autorité ; croire qu’un test mock prouve un verrou SQL.
