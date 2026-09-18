# Traçabilité et impact map

La chaîne cible est bidirectionnelle : exigence ↔ KB ↔ droits ↔ code/DB/API ↔ tests ↔ Analytics/Audit/Logs ↔ ADR. Elle décrit des comportements réels ; une fonctionnalité future n'est jamais marquée active.

## Identifiants et références

Les fiches ont un `id` stable, indépendant de leur chemin et d'un libellé traduit. Préfixes : `feature.` pour le métier, `technical.` pour la technique ; les ADR utilisent `ADR-001` et suivants. Un ID n'est pas recyclé si une fiche est retirée. Les codes/UUID métier restent ceux du modèle, jamais les labels traduits.

Les frontmatters utilisent des chemins relatifs à la racine du dépôt pour les listes machine-readable (`related_code`, `related_tests`, `related_docs`). Le corps Markdown emploie des liens relatifs au fichier. `related_adrs` contient les IDs de l'[index ADR](../architecture-decisions/README.md). `requirements` cite une source versionnée et sa section stable ; une décision conversationnelle est d'abord tracée dans le document approprié.

Ne pas utiliser de placeholders dans une fiche active. Les modèles sont explicitement `status: template`. Les statuts de connaissance sont `draft`, `active`, `historical`, `superseded` ; ils ne sont pas des résultats de test.

## Avant de modifier une fonctionnalité

Lire KB métier, KB technique, ADR, exigences et code/tests concernés. Si une fiche n'existe pas encore, le noter et consulter les références/ADR effectivement disponibles ; ne pas inventer une KB ou une règle manquante. Identifier les impacts ci-dessous avant les edits :

| Dimension              | Questions de revue                                                          |
| ---------------------- | --------------------------------------------------------------------------- |
| Règle                  | Invariant, nominal, variantes, erreurs, statuts/transitions, idempotence ?  |
| Acteurs                | Rôle/capacité explicite, périmètre service, tenant et ownership réels ?     |
| Persistance            | Tables, FK/unique/CHECK, RLS/grants, transaction et concurrence ?           |
| Contrats               | Cas d'usage, API/RPC, UI/routes, adaptateurs et frontières ?                |
| Tests                  | Scénarios actuels, régression à écrire, données synthétiques et isolation ? |
| Accessibilité / locale | Focus, erreurs, labels, formats, persistance et fuseau ?                    |
| Analytics              | Événement, propriétés minimisées, consentement/statut actuel ?              |
| Audit                  | Acteur, atomicité, whitelist, corrélation et lecture autorisée ?            |
| Logs                   | Niveau, contexte autorisé, diagnostic sans PII/secrets ?                    |
| Documentation          | Fiches, ADR, exigences, preuve de validation et index à mettre à jour ?     |

## Maintien du lien retour

La fiche référence les fichiers/tests précis ; le bilan PR identifie les IDs des fiches impactées et les preuves. L'index de domaine permet de retrouver la fiche depuis les chemins de code/tests. Ne pas ajouter un commentaire mécanique à chaque fonction ; documenter le lien retour au niveau utile.

Pour un bug : reproduire → retrouver le contrat → test de régression si faisable → correction minimale → tests ciblés → validations pertinentes. Modifier le contrat documentaire uniquement si le comportement attendu change réellement et a été approuvé.

## Vue unique et mise à jour

La [matrice générée](../kb/traceability.md) est dérivée des métadonnées KB. Les index thématiques et le registre de statut ADR sont des entrées complémentaires, pas d’autres matrices code/tests à synchroniser. `pnpm docs:generate` puis `pnpm docs:validate` sont requis après modification des liens.

La [KB gouvernance](../kb/technical/knowledge-governance.md) définit types/statuts/phases et limites des checks. `title` et `introduced_in` sont requis ; IDs antérieurs conservés. Les contrats Analytics/Audit/Logs de F ont remplacé l’absence d’instrumentation des preuves C : les anciens rapports restent datés.
