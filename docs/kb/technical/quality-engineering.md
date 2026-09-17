---
id: technical.quality-engineering
domain: engineering-quality
type: technical-topic
status: active
roles: [developer, reviewer]
requirements:
  - "Patrick — checkpoint 2bis-D §§1–32"
  - "Livre v1.4 §§56–60"
related_adrs: [ADR-003, ADR-009, ADR-011]
related_code:
  - tooling/quality/model.ts
  - tooling/quality/collect.ts
  - tooling/quality/parsers.ts
  - tooling/quality/snapshot.ts
  - tooling/quality/policy.json
related_tests:
  - tooling/quality/core.test.ts
  - tooling/quality/privacy.test.ts
  - tooling/quality/flakiness.test.ts
  - tooling/quality/reconstruction.test.ts
related_docs:
  - docs/quality/quality-evidence.md
  - docs/quality/phase-2bis-d-report.md
---

# Engineering quality — preuves communes

## Contrat et responsabilités

Les producteurs exécutent les contrôles, les normalisateurs réduisent les résultats, le snapshot fige une identité/provenance, l’évaluateur applique une policy versionnée. La CLI compose ces éléments. Le futur Quality Center n’a pas de logique parallèle à créer. Aucun accès navigateur, droit métier, mutation DB ou événement analytics/audit/log applicatif ajouté.

Une collecte locale est autorisée uniquement sur les services locaux prévus par les tests existants. Ne pas lancer deux campagnes mutantes simultanément. Le snapshot signale `dirty` et une empreinte des sources : un run de développement n’est pas une attestation de release sur un SHA propre. Le contrôle final de provenance détecte une modification pendant le run.

## Sémantique de preuve

- Unitaires : tests Vitest ; architecture/conventions = sous-ensemble nommé, pas un total supplémentaire.
- Coverage : V8 unitaire avec fichiers non exécutés inclus ; zéro n’est pas masqué. Aucun seuil activé. SQL/audit SQL ne sont pas transformés en couverture JS.
- Intégration : Node et Vitest conservent leurs tests réels de sécurité/adaptateurs.
- pgTAP : assertions séquentielles et plan complet requis ; bailout, plan absent ou incomplet échouent.
- Playwright : statut final, tags, durée, retries/flakiness par test. Toute reprise est visible ; une campagne ayant besoin d’un retry échoue au verdict de release.
- Axe : pièces minimisées des analyses effectivement réalisées ; jamais une preuve de VoiceOver/TalkBack.
- Build/format/lint/typecheck : sortie complète de processus, code retour. Erreur de lancement = échec.
- Audit/secrets : findings/statistiques existants ; absence de rapport ou erreur réseau = échec de preuve.

## Erreurs et exploitation

Le rapport invalide devient FAIL avec une raison stable ; les données brutes restent dans les logs restreints du run. Une identité absente ou discordante empêche l’assemblage. La finalisation refuse un identifiant de run déjà présent. Les lecteurs vérifient le digest ; une modification de policy demande un nouveau snapshot.

La policy reste consultative dans D. Les contrôles historiquement bloquants restent bloquants dans `verify`/`verify:full`/`release:verify`. Une baseline n’est jamais acceptée automatiquement. Les répétitions critiques ont leur propre rapport, leurs tentatives et dates, sans remplacer la campagne principale.

Procédures, schema, exclusions et limites : [Quality evidence](../../quality/quality-evidence.md). Décision et alternatives : [ADR-011](../../architecture-decisions/011-quality-evidence.md). Valeurs réellement observées : [rapport D](../../quality/phase-2bis-d-report.md).
