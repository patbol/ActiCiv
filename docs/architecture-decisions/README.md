# ADR — index et statuts

Les ADR 001–007 conservent leur statut existant. Une décision ancienne n'est pas automatiquement obsolète. Les compléments déjà approuvés restent historiques ; en 2bis-A, seul le lien déplacé de l'ADR 001 est réparé.

| ID                                        | Sujet                              | Statut existant / relation                                       |
| ----------------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| [ADR-001](001-modular-monolith.md)        | Monolithe et frontières            | Acceptée, complétée en Phase 2                                   |
| [ADR-002](002-persistence-security.md)    | Persistance et sécurité            | Acceptée pour les fondations ; réserve PostGIS levée par ADR-005 |
| [ADR-003](003-reproducibility-quality.md) | Reproductibilité et release        | Acceptée, renforcée à la clôture Phase 2                         |
| [ADR-004](004-tenancy-security.md)        | Tenancy, autorisation, invitations | Approuvée, applicable                                            |
| [ADR-005](005-contractual-geography.md)   | Géographie contractuelle           | Approuvée ; remplace la réserve PostGIS d'ADR-002                |
| [ADR-006](006-sla-schedules.md)           | SLA, calendriers, DST              | Approuvée, applicable                                            |
| [ADR-007](007-transactional-audit.md)     | Audit transactionnel               | Approuvée, applicable                                            |
| [ADR-008](008-knowledge-governance.md)    | Documentation, KB, playbooks       | Acceptée par validation 2bis-A ; aucune ADR supersédée           |
| [ADR-009](009-e2e-conventions.md)         | E2E et conventions exécutables     | Proposée pour revue 2bis-B                                       |

Une nouvelle ADR expose statut, contexte, décision, alternatives, conséquences, impacts sécurité/tests/migration/exploitation et liens réels. Si une décision change, ajouter une succession explicite et conserver l'ancienne. Les futures ADR E2E, i18n, qualité, sécurité et observabilité seront numérotées lors de leur création autorisée ; aucun numéro futur n'est réservé par l'ancien plan d'audit.
