---
name: add-audit-event
description: "Étendre l’audit SQL transactionnel d’une mutation auditable sans double écriture applicative."
---

# add-audit-event

## Objectif et déclencheur

Étendre l’audit SQL transactionnel d’une mutation auditable sans double écriture applicative.

## Préconditions et lectures

Mutation et preuve requise identifiées ; vérifier les triggers déjà présents avant de créer un événement. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [audit](../../kb/technical/audit.md) ; [database-migrations](../../kb/technical/database-migrations.md) ; [correlation-errors](../../kb/technical/correlation-errors.md).

## Impact map

Mutation → acteur serveur → tenant/droit → table/trigger → whitelist old/new → correlation → rollback → tests/KB.

## Procédure

1. Inventorier l’audit existant : une mutation déjà couverte ne reçoit pas un second writer.
2. Écrire RED pour acteur dérivé côté serveur, whitelist, append-only, droits de lecture et rollback de mutation si audit échoue.
3. Modifier uniquement la voie transactionnelle SQL par migration additive lorsque nécessaire ; maintenir la corrélation de commande/requête.
4. Tester refus de modification par utilisateur métier, absence de secrets/géométrie brute et différence avec diagnostics non transactionnels.
5. Mettre à jour contrat d’audit et KB métier dans la même PR ; prouver migration/reconstruction si DB changée.

## Tests et preuves

pgTAP rollback/acteur/whitelist/corrélation, RLS de lecture et vrais appels JWT ; intégration si frontière modifiée.

## Documentation

Contrat d’audit, tables/événements concernés, acteurs/droits, invariants et preuves.

## Sécurité et arrêt

STOP si audit hors transaction, actor fourni par client ou données sensibles non nécessaires. Logs techniques ne remplacent pas la preuve.

## Definition of Done

Écriture métier et audit indivisibles, une seule preuve attendue par mécanisme, tests négatifs réels. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Ajouter audit.record asynchrone après commit, copier old/new en entier, permettre UPDATE/DELETE métier.
