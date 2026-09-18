# Definition of Done

Applicable aux changements ActiCiv dans le checkpoint explicitement autorisé. Références : [AGENTS.md](../../AGENTS.md), [politique documentaire](documentation-policy.md), [checklist PR](pr-checklist.md).

## Contrat commun

| Dimension                | Preuve attendue si applicable                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| Périmètre et acceptation | Besoin identifié, critères satisfaits, aucun checkpoint/phase non autorisé                             |
| Comportement             | Implémentation complète, erreurs/cas limites traités, contrats maintenus                               |
| TDD / bug                | Test échouant pour la bonne raison avant logique critique/correction reproductible ; exception motivée |
| Régression               | Assertions préservées, aucun test valide supprimé/affaibli/skippé pour verdir                          |
| Types / format / lint    | Contrôles adaptés réellement exécutés, résultats et limites cités                                      |
| Couverture               | Effet sur les scénarios et modules critiques ; métriques/seuils une fois instrumentés et approuvés     |
| Sécurité                 | Droits, ownership, tenancy, RLS, secrets ; tests négatifs/réels selon impact                           |
| Accessibilité            | Clavier, focus, labels, erreurs, axe et lecteur d'écran selon changement                               |
| i18n                     | Texte/format/locale et timezone distincts ; fr-FR/en-GB selon les fondations actuelles                 |
| Observabilité            | Analytics minimisés, audit transactionnel et logs techniques examinés séparément                       |
| Données                  | Migration append-only, contraintes nullable/tenant, seeds, reprise et reconstruction si schéma modifié |
| Connaissances            | KB métier/technique, droits, API et liens mis à jour dans la même PR                                   |
| Architecture             | ADR si décision structurante ; aucun empilement artificiel de couches                                  |
| Validation               | Contrôles/gates applicables satisfaits, pas de PASS anticipé                                           |

Chaque dimension non applicable reçoit une justification courte. Les fondations non encore installées sont identifiées comme cibles de leur checkpoint, pas prétendues exécutées.

## Rigueur proportionnée

| Changement                                         | Minimum pertinent                                                                                                                                         |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation seule                                | Sources/statuts, liens, format, absence de secrets, inventaire, `pnpm docs:validate`, diff et `git diff --check` ; pas de test artificiel miroir du texte |
| Présentation locale                                | Format/lint, revue visuelle et a11y adaptée ; pas d'ADR sans changement structurel                                                                        |
| Composant partagé / interaction                    | Tests comportementaux et régression, a11y/i18n, KB concernée                                                                                              |
| Auth, permissions, tenant, SLA, concurrence, audit | Test-first, cas négatifs, adaptateurs réels/SQL selon risque, documentation et validations ciblées                                                        |
| Migration                                          | Contraintes, RLS/grants, audit atomique, backfill, seed/reset/reconstruction et stratégie de récupération                                                 |

Un test qui passe après retry reste instable et ne constitue pas une preuve propre de release. Les seuils coverage/performance exigent mesure, proposition puis accord explicite de Patrick ; aucun seuil arbitraire ne devient bloquant.

## Checkpoint et release sont distincts

Un checkpoint prêt pour revue n'est ni une phase clôturée ni une autorisation du checkpoint suivant. En G, les preuves concernent documentation, validateurs et outillage ; aucune modification fonctionnelle ni DB.

La clôture finale conserve `verify`, `verify:full` et `release:verify --rebuild-db` lorsqu'applicable : arbre propre, SHA exact, CI observée sur ce SHA, reconstruction si DB modifiée, contrôles humains requis et artefact issu du candidat validé. Tout changement post-validation impose une validation adaptée du nouveau candidat. Une CI écrite ou une ancienne preuve ne suffit pas. Les exigences PROD/pentest futures ne sont pas fabriquées en DEV.

Décision finale : READY FOR PATRICK REVIEW ou NOT READY avec blockers précis ; STOP avant le checkpoint/phase suivant.
