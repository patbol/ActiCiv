---
id: "technical.release-reproducibility"
title: "Release et preuves du candidat exact"
domain: "engineering-quality"
type: "technical-topic"
status: "active"
introduced_in: "phase-1"
roles: ["developer", "reviewer"]
requirements: ["ADR-003", "ADR-011", "ADR-012", "ADR-013"]
related_adrs: ["ADR-003", "ADR-011", "ADR-012", "ADR-013"]
related_code:
  [
    "scripts/verify-release.mjs",
    "tooling/quality/cli.ts",
    ".github/workflows/ci.yml",
  ]
related_tests:
  ["tooling/quality/core.test.ts", "tooling/quality/assurance.test.ts"]
related_docs:
  [
    "docs/kb/technical/quality-engineering.md",
    "docs/kb/technical/artifact-hygiene.md",
    "docs/quality/definition-of-done.md",
  ]
---

# Release et preuves du candidat exact

## Identité et séquence

Charger nvm puis `.nvmrc` dans chaque shell ; ne pas réinstaller pnpm pour contourner le runtime. Identifier remote/branche/HEAD et arbre propre. `verify` conserve format, lint, typecheck, tests, builds/bundles et ajoute la validation documentaire G. `verify:full` préserve SQL, intégration, E2E DEMO/PROD, sécurité et audit de dépendances.

`release:verify --rebuild-db` s'applique aux candidats nécessitant reconstruction. Le reset local détruit les données de la cible de développement : identifier celle-ci et son autorisation avant lancement. Pas de reset pour un changement uniquement documentaire.

## Preuves et promotion

Collecter le snapshot canonique avec SHA, dirty, environnement, source_digest, provenance et policy digest ; évaluer les gates. Une preuve depuis un arbre modifié peut aider la revue, mais n'est pas une release propre. Un candidat de baseline n'est pas une acceptation. Garder distincts recommandations coverage/performance et seuils explicitement approuvés.

Observer une vraie CI sur le même SHA, télécharger/vérifier l'artefact et ses digests, inspecter les contenus minimisés. Un workflow écrit, un ancien run, un retry vert ou un autre SHA ne prouvent rien sur le candidat. Toute modification après validation invalide les preuves concernées et exige un nouveau candidat.

## Limites et décision humaine

Reporter PASS/FAIL/DEFERRED/NOT_APPLICABLE et preuves manuelles pertinentes. VoiceOver historique n'est pas une validation d'une nouvelle interaction ; TalkBack requiert un environnement réel. Pentest avant première vraie PROD/pilote significatif, jamais fabriqué. Le Skill [prepare-release](../../skills/prepare-release/SKILL.md) donne les étapes. READY FOR PATRICK REVIEW ne ferme pas le checkpoint et n'autorise pas le suivant.

## Éligibilité I2, sans déploiement

`packages/quality/src/promotion.ts` évalue candidate → validated → eligible ; promoted exige un reçu externe exact. Un candidat propre et sa réévaluation canonique doivent coïncider. L’éligibilité exige acceptation humaine de ce candidat baseline, approbation du digest de policy, mêmes digests de tous les artefacts et conditions supplémentaires configurées par cette policy. Aucune branche mouvante ni acceptance implicite. Les environnements d’exécution local/ci-local du snapshot restent distincts des étapes dev/demo/prod de promotion.

`pnpm quality:evaluate` vérifie les policies historiques ; `node tooling/quality/cli.ts promotion <requête.json>` charge `snapshot_path` avec contrôle des pièces puis évalue la requête opérateur. La requête contient policy, baseline acceptée, policy_approval, source_environment, target_environment, artifacts, at et éventuellement receipt. Ce modèle ne réalise aucune promotion et n’authentifie pas à lui seul un opérateur : stockage/import et exécution CLI restent la frontière de confiance.

La policy I demande des preuves explicites supplémentaires avant PROD (régression, même artefact DEMO, migration, défauts, sécurité, backup/rollback, notes, pentest et manuel actuel). Elles restent absentes tant que non produites : aucune éligibilité PROD artificielle. Les attestations historiques ne sont pas converties en nouvelles validations.
