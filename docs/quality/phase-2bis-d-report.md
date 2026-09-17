# Phase 2 bis — checkpoint 2bis-D

Verdict : **READY FOR PATRICK REVIEW**. Aucun 2bis-E ni Phase 3 commencé. D reste soumis à la revue explicite de Patrick.

## 1–2. Entrée et état Git

Entrée : `7d43c1b8b3ece14cb6df03f4a445030cbbec326b`, branche `phase-2bis-engineering-foundations`, remote `https://github.com/patbol/ActiCiv.git`. Les sources C validées étaient non commitées ; leur empreinte a été comparée au candidat VoiceOver, identique. Elles ont été figées, conformément au prérequis D, au commit **`1e067b35a148c6a2da9be3857b1ca4170e91bf60`**, puis arbre propre vérifié avant D. Les six lignes de progression avec retours chariot dans le journal brut C produisaient des avertissements de whitespace lors de l’indexation ; le journal historique a été conservé sans réécriture. Aucune modification utilisateur inconnue écrasée.

A/B/C et ADR-008/009/010 sont approuvés par l’autorisation D. Les sources actuelles, le livre v1.4, les sections qualité du Master Prompt, la checklist, la gouvernance et les KB testing/i18n ont été relus. Cette instruction récente prime sur le statut C encore inscrit dans AGENTS ; aucune règle persistante nouvelle ne justifie sa réécriture dans D.

Runtime réellement utilisé : Node `24.21.0` via nvm dans les shells, pnpm `11.19.0`. Aucun E/Phase 3 trouvé ou commencé. Les preuves de préparation ci-dessous ont été produites sur l’arbre de travail identifié par SHA parent **et digest de sources**. Le candidat est ensuite figé localement pour produire un snapshot sur SHA propre ; son identité exacte est portée par ce snapshot et le compte rendu de livraison. Aucune preuve CI distante ni release PROD n’est revendiquée.

## 3–5. Dépendance et architecture

Une seule dépendance directe ajoutée : `@vitest/coverage-v8` **4.1.11**, devDependency exacte alignée sur Vitest installé/peerDependency, compatibilité vérifiée par le registre et l’exécution réelle. Aucun coût runtime PROD, aucune autre plateforme ni outil de coverage.

Architecture : producteurs → rapports minimisés → normalisateurs → snapshot versionné → évaluateur unique → CLI/artefacts/futur Quality Center. [ADR-011](../architecture-decisions/011-quality-evidence.md), [KB qualité](../kb/technical/quality-engineering.md), [contrat/procédures](quality-evidence.md).

Formats : JSON natif Vitest/Playwright minimisé ; événements natifs Node test ; TAP pgTAP avec plan ; JSON-summary/JSON détaillé/LCOV V8 ; comptes pnpm audit ; findings Gitleaks expurgés ; statuts de processus pour builds/format/lint/types/bundles. Sorties humaines conservées dans les logs locaux restreints. Les snapshots publiables excluent secrets, config Playwright, stdout/erreurs brutes, traces, captures, HTML et données Auth.

## 6–7. Couverture et exclusions

Mesure V8 du code stabilisé : statements **617/1540**, branches **501/1134**, functions **166/346**, lines **570/1409**.

| Périmètre              | Statements | Branches | Functions |   Lines |
| ---------------------- | ---------: | -------: | --------: | ------: |
| global                 |    40,06 % |  44,17 % |   47,97 % | 40,45 % |
| backend-critical       |    38,46 % |  49,65 % |   39,00 % | 40,00 % |
| auth                   |    32,94 % |  39,06 % |   28,00 % | 36,23 % |
| authorization-rbac     |    50,00 % |  58,13 % |   42,85 % | 48,14 % |
| organizations-services |    29,16 % |  63,63 % |   33,33 % | 29,16 % |
| coverage-geography     |    42,30 % |  44,82 % |   30,76 % | 44,00 % |
| schedules              |    81,39 % |  86,84 % |   90,90 % | 82,92 % |
| sla                    |    75,00 % | 100,00 % |   75,00 % | 72,72 % |
| audit                  |        N/A |      N/A |       N/A |     N/A |
| i18n                   |    57,77 % |  62,33 % |   64,28 % | 62,33 % |
| shared-ui              |    58,18 % |  77,27 % |   59,09 % | 57,40 % |
| citizen                |     0,00 % |   0,00 % |    0,00 % |  0,00 % |
| pro                    |     0,00 % |   0,00 % |    0,00 % |  0,00 % |
| tooling-conventions    |    48,80 % |  47,91 % |   68,67 % | 49,34 % |

Trous significatifs : UI/entrypoints Citizen et Pro non instrumentés par les tests unitaires ; nombreux adaptateurs vérifiés par intégration réelle mais absents de cette mesure ; scripts de lancement testés par exécution réelle plutôt que tests unitaires. Ces fichiers restent inclus. Les pourcentages ne remplacent pas les preuves SQL, intégration et E2E distinctes.

Coverage V8 **unitaire**, incluant les sources non importées : packages/apps/tooling/scripts. Tests `.test.ts` et déclarations `.d.ts` exclus, rien d’autre à l’intérieur de ces globs. Les builds/configs racine/fixtures/données CSS/JSON/SQL sont hors périmètre source JS, explicitement documenté. Les entrypoints/UI/adaptateurs non exercés restent visibles à zéro ; pgTAP, intégration et E2E sont séparés. Groupes recouvrants, non additionnables. Audit purement SQL : pas de module JS inventé, valeur N/A.

## 8–15. Snapshot, gates et baseline

Contrat v1 typé et validé à l’exécution : identité Git/run/environnement/versions/dirty/source_digest, checks détaillés, quatre métriques coverage globales et par module, provenance et digests, preuves manuelles séparées, policy/digest et résultats de gates. Chaque rapport appartient au même run/SHA/environnement ; identités discordantes refusées. Les références de fichiers sont contrôlées. Création exclusive et digests empêchent l’écrasement silencieux ; nouvelle preuve → nouveau run. Pas de promesse de signature indépendante/WORM.

Policy **`2bis-D.v1`, advisory** : contrôles existants et complétude objectivement nécessaires, aucun seuil numérique coverage/performance, aucun waiver. Une preuve obligatoire absente/invalide/partielle échoue ; reconstruction non exécutée est DEFERRED explicite ; contrôles E/PROD hors périmètre sont NOT_APPLICABLE, jamais PASS. Le résultat global conserve les raisons/références par règle.

Retries/skips/flaky restent visibles et empêchent un PASS propre. Les tags Playwright natifs sont normalisés avec `@`. Les répétitions critiques sont séparées, séquentielles, à zéro retry, sans fréquence CI inventée. Baseline candidate uniquement : aucune acceptation Patrick fabriquée. Comparaison avec baseline acceptée vérifie digest, identité, policy et environnement ; sans baseline, NO_BASELINE. Deltas tests/fails/skips/retries/durée, coverage globale/modules et métriques numériques sécurité/a11y/bundles ; pas de verdict de régression sans budget.

## 16–19. Persistance, commandes, CI et documentation

Fichiers/artefacts suffisants ; **aucune migration ni DB qualité**, aucun endpoint navigateur ni Quality Center. Commandes `quality:collect`, `quality:snapshot`, `quality:evaluate`, `quality:report`, `quality:compare`, `quality:flakiness`, `test:coverage`. Les commandes historiques restent disponibles. Le script de reconstruction compare désormais les versions des migrations appliquées aux fichiers réels, au lieu d’attendre neuf migrations après l’ajout de la dixième en C ; régression dédiée.

CI : deux jobs existants conservés, ajout d’une collecte consultative au job DB et upload des seuls snapshots/rapports minimisés, rétention 14 jours. Aucun secret ajouté ni déploiement. Le coût est un rejeu des contrôles ; cette duplication temporaire garde les contrôles historiques intacts. Le comportement n’est pas rendu bloquant avant revue de la policy.

Documentation : ADR-011 proposée ; acceptation ADR-010 tracée dans l’index sans réécriture de son contenu ; KB qualité, contrat/procédures coverage/snapshot/baseline/flakiness/release ; index et traçabilité à jour. Aucune nouvelle UI ni validation manuelle fictive. Référence historique VoiceOver C PASS, TalkBack DEFERRED distinct.

## 20–26. Validation, limites et arrêt

Validations réellement exécutées avant gel :

| Contrôle                             | Résultat                                                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `pnpm verify:full` (inclut `verify`) | PASS, code sortie 0                                                                                                  |
| Format/lint/typecheck                | PASS ; format du module métier coverage vérifié explicitement                                                        |
| Unitaires + architecture/conventions | PASS, **135 tests**, dont **37 nouveaux tests qualité**                                                              |
| V8 JSON/JSON-summary/LCOV/texte      | PASS, métriques ci-dessus ; aucun seuil                                                                              |
| Reconstruction depuis zéro + seed    | PASS, dix versions de migration exactes et cardinalités du seed                                                      |
| pgTAP                                | PASS, **126 assertions** dans 4 suites                                                                               |
| Intégration réelle                   | PASS, **16 tests** : 8 Node et 8 Vitest                                                                              |
| Builds/bundles                       | PASS Citizen et Pro ; frontières préservées                                                                          |
| Playwright / axe                     | PASS, **38 exécutions**, zéro retry/skip ; **58 analyses**, zéro violation                                           |
| Répétitions critiques séparées       | PASS, **2 × 16**, aucune instabilité observée ; ce petit échantillon ne prouve pas une absence générale de flakiness |
| Dependency audit / Gitleaks          | PASS, aucune vulnérabilité connue renvoyée ; historique et sources candidates sans finding                           |
| Snapshot / gates / lecture digest    | PASS sur vraie collecte ; 19 gates applicables PASS, 5 NOT_APPLICABLE                                                |
| Contrôles négatifs CLI               | PASS : collecte incomplète refusée (exit 1), doublon refusé (exit 1), snapshot original relu intact                  |
| Baseline absente                     | NO_BASELINE ; comparaison avec baseline acceptée testée sur fixtures                                                 |
| CI YAML                              | Syntaxe vérifiée avec Psych ; deux jobs historiques conservés                                                        |
| Documentation                        | 59 Markdown / 298 liens locaux contrôlés sans lien cassé                                                             |
| Diff-check                           | PASS sur les changements D                                                                                           |

Les 54 résultats axe `incomplete` sont reportés séparément : ils demandent une appréciation humaine et ne sont pas présentés comme des règles automatiquement validées. Les confirmations VoiceOver historiques C restent séparées.

Exemple réel avant gel : run `2026-09-17T22-44-41-394Z-34d18d42`, parent SHA `1e067b35a148c6a2da9be3857b1ca4170e91bf60`, environnement local, arbre dirty explicitement déclaré, verdict consultatif PASS. Snapshot complet, rapports minimisés, JSON détaillé coverage, LCOV et candidat baseline sont dans `.quality/snapshots/<run-id>/` ; ils sont ignorés par Git et destinés aux artefacts. L’étape CI upload uniquement ce répertoire finalisé. Le snapshot final sur commit propre est généré après gel, sans retoucher cet exemple historique. La collecte exploratoire a correctement refusé les preuves SQL incomplètes et une modification de sources pendant l’exécution ; ses résultats ne sont pas présentés comme baseline verte. Les défauts de collecte ont leurs tests ou replays réels : noms `e2e` contenant un chiffre, tags natifs sans `@`, rapports TAP longs, disponibilité de pgTAP, rapport altéré après finalisation.

- **FAIL restant : 0** dans les validations réalisées.
- **DEFERRED : exécution du workflow modifié sur GitHub Actions**, aucun push ni run distant D revendiqué.
- **DEFERRED : TalkBack**, aucun Android compatible connecté ; aucune nouvelle UI dans D.
- **Décisions en attente :** revue ADR-011/policy et acceptation d’une baseline ; aucune acceptation humaine fabriquée.
- **NOT APPLICABLE** : nouvelle migration, Quality Center UI/DB, Semgrep/ZAP/pentest, scanner artefact avancé, budgets performance, nouveaux événements métier, nouvelle validation VoiceOver (aucune UI modifiée).
- **Seuils coverage proposés, non activés :** planchers de non-régression dérivés de cette mesure, arrondis à l’entier inférieur : global **S 40 / B 44 / F 47 / L 40 %** ; schedules **81 / 86 / 90 / 82 %** ; SLA **75 / 100 / 75 / 72 %** ; authorization/RBAC **50 / 58 / 42 / 48 %** ; i18n **57 / 62 / 64 / 62 %**. Ils protègent le niveau observé sans prétendre être des objectifs de maturité suffisants. Soumettre ces planchers et la baseline propre à Patrick avant toute activation. Aucun seuil UI à zéro proposé ; améliorer la mesure multi-processus avant de proposer un objectif UI chiffré.
- **Limites** : V8 unitaire ne mesure pas les autres processus ; faible couverture UI/adaptateurs visible ; artefacts locaux reposent sur la confiance opérateur/CI ; baseline acceptée absente ; les champs futurs ne valent pas preuves.

**STOP après D pour revue. Aucun 2bis-E ni Phase 3 commencé.**

Les mesures gzip D utilisent explicitement le niveau 9, comme le relevé C. Les valeurs historiques C restent conservées dans son rapport : Citizen +9,59 %, Pro +9,40 % par rapport à B. Aucun budget ou verdict de régression inventé. Les tailles exactes du candidat D et ses BUILD_ID figurent dans le check `bundles` du snapshot.
