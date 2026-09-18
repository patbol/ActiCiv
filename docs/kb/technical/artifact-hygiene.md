---
id: technical.artifact-hygiene
domain: engineering-quality
type: technical-topic
status: active
roles: [developer, reviewer]
requirements: ["Patrick — checkpoint 2bis-E uniquement"]
related_adrs: [ADR-011, ADR-012]
related_code: [tooling/quality/artifact.ts, scripts/check-secrets.mjs]
related_tests: [tooling/quality/assurance.test.ts, e2e/artifact-prod.spec.ts]
related_docs: [docs/quality/phase-2bis-e-report.md]
---

# Hygiène de l'artefact PROD

`pnpm build` produit `.next` sans dialogue démonstratif. `pnpm build:demo` produit `.next-demo` pour `pnpm test:e2e` et les contrôles du dialogue. La page de fondation est conservée comme page d'attente actuelle, sans fausse fonctionnalité ; le formulaire de démonstration, son CSS et ses traductions sont DEMO-only. Les fichiers générés next-env sont exclus de Git ; typegen les recrée.

`pnpm artifact:check` inspecte le vrai build, jamais une déduction depuis les sources seules : JS/CSS/HTML/RSC, routes/manifests, traces NFT, BUILD_ID/digest. Tests synthétiques prouvent fixtures/fake users/debug routes/console/secrets/bypass/maps/client-server. Les hooks data-test sont détectés ; aucun hook nécessaire actuellement, aucune transformation fragile de suppression.

Les règles sont syntaxiques et fondées sur motifs connus, pas une preuve d'absence de tout code obfusqué. ESLint/architecture, Gitleaks et tests réels complètent le contrôle. Quatre exceptions console vendor sont décrites dans `artifact-allowlist.json` : source précise et contenu SHA-256, jamais une exception globale. Les logs application restent interdits.

Les maps navigateur sont désactivées. Les maps serveur restent privées pour diagnostic ; aucun chemin server n'est servi comme public. Gitleaks inspecte source et artefact quand `ACTICIV_SCAN_ARTIFACTS=1`. Les IDs d'actions Next et sa clé de chiffrement de build serveur sont qualifiés par correspondance au manifest, jamais par un motif générique de secret autorisé. Aucun secret métier/client admis. Ne jamais publier les manifests serveur, les clés ou les rapports bruts dans les artefacts publics.

Les erreurs des API existantes sont testées via HTTP réel ; aucune route de panne/debug créée pour fabriquer la preuve. Les erreurs techniques restent derrière les adaptateurs existants ; aucune refonte logger F.

Voir [ADR-012](../../architecture-decisions/012-security-artifact-performance.md) et [rapport E](../../quality/phase-2bis-e-report.md). PROD et DEMO sont des artefacts différents : valider l'artefact exact destiné à être promu, pas remplacer PROD par DEMO après contrôle.
