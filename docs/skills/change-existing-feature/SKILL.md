---
name: change-existing-feature
description: "Modifier un comportement existant après lecture des contrats et impact map complète."
---

# change-existing-feature

## Objectif et déclencheur

Modifier un comportement existant après lecture des contrats et impact map complète.

## Préconditions et lectures

Le comportement actuel et le changement demandé sont identifiés ; ne pas commencer par patcher la première occurrence. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [README](../../kb/business/README.md) ; [architecture](../../kb/technical/architecture.md) ; [testing](../../kb/technical/testing.md).

## Impact map

Feature → rules → roles → DB → RLS → API/RPC → UI/routes → E2E → i18n/a11y → analytics → audit → logs → docs.

## Procédure

1. Lire la KB métier, la KB technique et les ADR ; retrouver le code et les tests reliés par la traçabilité.
2. Écrire l’impact map avant modification avec règles conservées, règles approuvées modifiées et risques. Contradiction KB/code : STOP et présenter les deux sources.
3. Ajouter le test RED des nouveaux critères critiques ; conserver les assertions de comportements inchangés.
4. Modifier le minimum, vérifier la compatibilité des contrats/données et faire passer régressions ciblées puis gates selon risque.
5. Actualiser les KB et contrats d’observabilité dans la même PR ; créer une nouvelle ADR si une décision acceptée change.

## Tests et preuves

Négatifs tenant/ownership si droits touchés, intégration réelle si adaptateur/DB ; axe et locales si interaction modifiée.

## Documentation

IDs KB impactés, décision d’évolution, nouveaux chemins/tests et effets dans la PR ; ne pas réécrire les preuves historiques.

## Sécurité et arrêt

Aucune escalation implicite de droits, aucun reset DB pour du wording ; arrêter si changement hors checkpoint ou contrat ambigu.

## Definition of Done

Impact map réalisée avant edits, régressions conservées, documentation cohérente et validations réelles rapportées. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Adapter la KB à un bug pour éviter l’arbitrage ; changer un comportement collatéral silencieusement.
