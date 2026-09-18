---
name: prepare-release
description: "Préparer les preuves du SHA exact avec gates, CI et artefacts vérifiés sans auto-accepter la release."
---

# prepare-release

## Objectif et déclencheur

Préparer les preuves du SHA exact avec gates, CI et artefacts vérifiés sans auto-accepter la release.

## Préconditions et lectures

Candidat et périmètre autorisés, nvm/.nvmrc chargés dans chaque shell, environnement local identifié et opérations destructives autorisées si requises. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [release-reproducibility](../../kb/technical/release-reproducibility.md) ; [quality-engineering](../../kb/technical/quality-engineering.md) ; [artifact-hygiene](../../kb/technical/artifact-hygiene.md).

## Impact map

Candidat → SHA/source digest → tests/gates → migrations → build/artefact → CI même SHA → preuves humaines → revue.

## Procédure

1. Vérifier dépôt/remote/branche/HEAD, git status et diff --check ; figer uniquement des changements compris. Exiger clean tree pour release.
2. Exécuter verify et verify:full selon contrat de release ; release:verify --rebuild-db lorsque reconstruction applicable. Aucun reset pour docs seules ; ne pas substituer ce raccourci à une release DB.
3. Collecter snapshot canonique et evaluate, puis Gitleaks et artifact hygiene du vrai PROD. Conserver run_id, environment, source/policy/snapshot digests et statuts.
4. Pousser lorsque autorisé, observer la vraie CI sur ce SHA exact, vérifier jobs/upload, télécharger artefacts et contrôler digests/contenu minimisé.
5. Rassembler preuves manuelles applicables et FAIL/DEFERRED/N/A. Marquer baseline CANDIDATE, jamais ACCEPTED sans Patrick. Toute modification après validation : STOP et nouveau candidat.

## Tests et preuves

Retries zéro ; aucun retry ne masque un défaut. Migrations/seed/reconstruction si DB ; smoke/a11y/sécurité selon surface. Les preuves d’un autre SHA ne suffisent pas.

## Documentation

Bilan de release précis, références de run/artefact et limites ; ne pas réécrire postmortem historique pour déclarer des contrôles après coup.

## Sécurité et arrêt

Inspecter upload pour secrets bruts ; aucune promotion automatique, force push ou reset destructif non autorisé. STOP gate requis absent ou CI autre SHA.

## Definition of Done

Arbre propre, même SHA local/CI, artefact vérifié, preuves complètes et validation humaine encore distincte. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Confondre branche et release, ancienne CI verte et candidat, snapshot dirty et release propre, candidate et acceptation.
