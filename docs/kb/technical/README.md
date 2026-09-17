# KB technique — index de préparation

Structure disponible en 2bis-A, fiches détaillées à compléter selon les checkpoints autorisés. Les sources suivantes décrivent le socle réel :

Fiche active ajoutée en 2bis-B : [testing, POM et conventions exécutables](testing.md).

| Sujet                              | Source existante                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monolithe et séparation hexagonale | [ADR 001](../../architecture-decisions/001-modular-monolith.md)                                                                                   |
| Persistance, tenancy et RLS        | [ADR 002](../../architecture-decisions/002-persistence-security.md), [ADR 004](../../architecture-decisions/004-tenancy-security.md)              |
| Auth/invitations                   | [Modules Auth](../../../packages/backend/src/modules/auth/), [preuve de clôture](../../evidence/phase2/README.md)                                 |
| PostGIS et contrats                | [ADR 005](../../architecture-decisions/005-contractual-geography.md)                                                                              |
| SLA, calendriers et DST            | [ADR 006](../../architecture-decisions/006-sla-schedules.md)                                                                                      |
| Audit/corrélation                  | [ADR 007](../../architecture-decisions/007-transactional-audit.md)                                                                                |
| Tests et release existants         | [ADR 003](../../architecture-decisions/003-reproducibility-quality.md), [scripts](../../../package.json), [CI](../../../.github/workflows/ci.yml) |
| Gouvernance documentaire           | [Politique](../../quality/documentation-policy.md), [ADR 008](../../architecture-decisions/008-knowledge-governance.md)                           |

Les sujets POM/tagging (B), i18n (C), coverage/rapports/gates (D), Security Assurance/artefacts/performance (E), observabilité (F), KB/Skills approfondis (G), Quality Center (H) seront documentés à partir de leur implémentation réelle. Ils ne sont pas implémentés par cet index.

Employer le [modèle technique](../templates/technical-topic.md). Une fiche explique la responsabilité, les frontières, les contrats, les risques et les preuves, plutôt que recopier chaque ligne de code.

Fiche active ajoutée en 2bis-C : [internationalisation, préférences et traductions](internationalisation.md).
