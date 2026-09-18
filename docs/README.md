# Documentation ActiCiv

**Phase 2 = CLOSED**. Baseline officielle : `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`.
**Phase 2 bis = CURRENT**, **2bis-A/B/C/D/E APPROVED**, checkpoint actif **2bis-F**.
**Phase 3 = NOT STARTED**. Aucun 2bis-G, Quality Center ni Phase 3 sans validation explicite de Patrick.

## CURRENT — contrat applicable

Les décisions explicites récentes de Patrick priment. Les références courantes vivent dans `docs/references/current/` :

- [Livre Produit & Technique v1.4](references/current/ActiCiv_Livre_Produit_Technique_v1.4_FINAL_A4.docx).
- [Master Prompt Phase 2 bis v1.2](references/current/ActiCiv_Prompt_Astra_Phase2bis_v1.2_Engineering_Quality_i18n_Knowledge.md).
- [Checklist d'exhaustivité v1.2](references/current/ActiCiv_Phase2bis_Exhaustiveness_Checklist_v1.2.md).
- [Index de lancement et rectifications](references/current/ActiCiv_Phase2bis_Launch_Index.md).
- [Règles persistantes AGENTS.md](../AGENTS.md).

Une exigence cible n'est pas une preuve d'implémentation. Les PASS de la checklist comparent les références ; ils ne valident pas les futurs checkpoints.

## HISTORICAL — contexte et décisions antérieures

[Références historiques](references/historical/README.md) : anciens livre/prompt, rapports et référence d'implémentation Phase 2. Leur conservation ne les rend pas courants. Les conclusions sont datées ; ne pas réécrire le passé.

[ADR et statuts](architecture-decisions/README.md) : ADR 001–007 toujours applicables selon leur statut, ADR 008 de gouvernance. Une décision acceptée reste applicable tant qu'elle n'est pas explicitement supersédée. Les droits, contraintes SLA/DST et garanties de Phase 2 ne sont pas rouverts.

## EVIDENCE — résultats réellement observés

[Preuves et provenance](evidence/README.md), dans `docs/evidence/` :

- [Phase 1](evidence/phase1/README.md), clôturée.
- [Phase 2](evidence/phase2/README.md), postmortems datés et attestation finale.
- [Attestation officielle Phase 2](evidence/phase2/ActiCiv_Phase2_Closure_Attestation_fac0fc8.md) : 260 PASS / 0 FAIL / 1 DEFERRED (TalkBack).
- [Bilan et inventaire 2bis-A](quality/phase-2bis-a-report.md).
- [Bilan 2bis-B et conservation des scénarios](quality/phase-2bis-b-report.md).

Les anciens journaux/captures déjà rangés dans `docs/quality/` restent en place et sont indexés comme preuves historiques. Les chemins archivés dans les journaux/manifests décrivent leur époque, pas l'organisation actuelle.

## Gouvernance et connaissances

- [Règles documentaires et conventions exécutables](quality/documentation-policy.md).
- [Definition of Done](quality/definition-of-done.md).
- [Checklist PR / changement](quality/pr-checklist.md).
- [Traçabilité et impact map](quality/traceability.md).
- [KB métier et technique](kb/README.md) : structure et templates ; fiches détaillées à compléter dans leur checkpoint.
- [Skills : structure et catalogue initial](skills/README.md) : playbooks complets non implémentés en 2bis-A.
- [Questions réellement ouvertes](product-decisions/open-questions.md).
- [Composants actuels](ui.md).
- [KB testing : E2E, fixtures et conventions exécutables](kb/technical/testing.md).

La structure documentaire approuvée est conservée. Toute nouvelle documentation vit sous `/docs`, hors exceptions racine explicites. Voir la politique pour les README techniques préexistants et la conservation de l'historique.

- [Internationalisation : politique et architecture](kb/technical/internationalisation.md).
- [Choix de langue : comportement visible](kb/business/language-preferences.md).
- [Rapport 2bis-C](quality/phase-2bis-c-report.md).

2bis-D : [preuves qualité et procédures](quality/quality-evidence.md), [KB](kb/technical/quality-engineering.md), [rapport](quality/phase-2bis-d-report.md).

2bis-E : [rapport](quality/phase-2bis-e-report.md), [Security Assurance](kb/technical/security-assurance.md), [artefacts PROD](kb/technical/artifact-hygiene.md), [performance](kb/technical/performance-hygiene.md), [dépendances](kb/technical/dependency-governance.md).

2bis-F : [rapport](quality/phase-2bis-f-report.md), [ADR-013 proposée](architecture-decisions/013-observability-separation.md), KB [Analytics](kb/technical/analytics.md), [Audit](kb/technical/audit.md), [Logs](kb/technical/logging.md), [Corrélation](kb/technical/correlation-errors.md).
