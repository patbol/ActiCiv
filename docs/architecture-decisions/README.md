# ADR — registre des statuts et audit G

Audit ADR-001 à 013 effectué contre KB, code et tests existants. Toutes demeurent applicables. L’approbation récente de Patrick au lancement de G confirme ADR-008 à 013 ; les passages « proposée » dans les textes initiaux sont historiques et leurs décisions ultérieures sont explicitées. Aucune décision acceptée n’est réécrite ni implicitement supersédée.

| ADR                                             | Statut courant            | Relation                                                     | Impact actuel                                                  |
| ----------------------------------------------- | ------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| [ADR-001](001-modular-monolith.md)              | Acceptée, active          | Non supersédée                                               | Frontières du monolithe et backend server-only                 |
| [ADR-002](002-persistence-security.md)          | Acceptée, active          | Réserve PostGIS remplacée par 005 ; autres garanties actives | Persistance JWT/RLS ; réserve PostGIS seule levée par ADR-005  |
| [ADR-003](003-reproducibility-quality.md)       | Acceptée, active          | Non supersédée                                               | Identité exacte release, gates et artefacts                    |
| [ADR-004](004-tenancy-security.md)              | Acceptée, active          | Non supersédée                                               | Chaîne professionnelle, services, dernier admin et invitations |
| [ADR-005](005-contractual-geography.md)         | Acceptée, active          | Complète 002 sur PostGIS                                     | PostGIS, contrats explicites et candidats multiples            |
| [ADR-006](006-sla-schedules.md)                 | Acceptée, active          | Non supersédée                                               | Versionnement SLA/calendriers et DST                           |
| [ADR-007](007-transactional-audit.md)           | Acceptée, active          | Non supersédée                                               | Audit append-only transactionnel                               |
| [ADR-008](008-knowledge-governance.md)          | Acceptée, active          | Non supersédée                                               | Organisation documentaire, Rules et chemins canoniques         |
| [ADR-009](009-e2e-conventions.md)               | Acceptée, active          | Non supersédée                                               | POM/fixtures/tags et conventions exécutables                   |
| [ADR-010](010-internationalisation-locales.md)  | Acceptée, active          | Non supersédée                                               | Résolution locale, préférences et traduction                   |
| [ADR-011](011-quality-evidence.md)              | Acceptée, active          | Non supersédée                                               | Snapshot canonique, provenance et advisory                     |
| [ADR-012](012-security-artifact-performance.md) | Acceptée, active          | Non supersédée                                               | Scanners, PROD/DEMO, budgets mesurés sans gate numérique       |
| [ADR-013](013-observability-separation.md)      | Acceptée, active          | Non supersédée                                               | Analytics/Audit/Logs séparés et privacy                        |
| [ADR-014](014-knowledge-skills-governance.md)   | Acceptée — finalisation G | Complète 008/011 sans supersession                           | Complément G : validation KB/Skills et traçabilité dérivée     |

Les [associations ADR → KB](../kb/traceability.md#adr--kb) sont générées depuis les fiches, sans seconde matrice manuelle. Les liens et statuts sont vérifiés par `pnpm docs:validate` ; la revue humaine a examiné l’applicabilité et l’impact, ce qu’un validateur syntaxique ne prouve pas.

Une nouvelle décision structurelle crée une ADR avec contexte, alternatives, conséquences, sécurité, tests, migration et liens réels. Le numéro 014 était libre et correspond à G ; elle est acceptée explicitement par Patrick lors de la finalisation G. Une approbation de checkpoint n’autorise jamais le suivant.
