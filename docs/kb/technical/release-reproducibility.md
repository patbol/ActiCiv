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
