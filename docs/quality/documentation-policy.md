# Politique documentaire et conventions d'ingénierie

Statut : gouvernance 2bis-A, à relire par Patrick. Cette politique formalise l'organisation qu'il a approuvée ; elle n'autorise aucun checkpoint suivant.

## Responsabilités des dossiers

| Chemin                                    | Rôle                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `docs/references/current/`                | Livre v1.4, prompt/checklist v1.2 et index de lancement : contrat courant |
| `docs/references/historical/`             | Références antérieures, contexte daté, aucun nouveau contrat courant      |
| `docs/evidence/phase1/`                   | Clôture Phase 1 et inventaire historique                                  |
| `docs/evidence/phase2/`                   | Attestation finale et documents de preuve Phase 2                         |
| `docs/evidence/phase2/raw/`               | Journaux et relevés bruts conservés sans réécriture                       |
| `docs/architecture-decisions/`            | Décisions structurantes avec statut et liens de succession                |
| `docs/product-decisions/`                 | Décisions explicites et questions réellement ouvertes                     |
| `docs/quality/`                           | Méthode de travail, DoD, checklists et bilans de checkpoint               |
| `docs/kb/business/`, `docs/kb/technical/` | Connaissances vivantes structurées                                        |
| `docs/kb/templates/`                      | Modèles de fiches, pas des preuves ni des fonctionnalités                 |
| `docs/skills/`                            | Catalogue et emplacement canonique des futurs playbooks                   |

Toute nouvelle documentation versionnée vit sous `/docs`, sauf `AGENTS.md`, le README racine et les fichiers racine explicitement prévus. Les README de proximité déjà présents dans `supabase/` ne sont pas déplacés arbitrairement en 2bis-A ; ils restent des pointeurs techniques existants. Aucun dossier concurrent `doc/` n'est recréé. Les journaux/captures historiques préexistants de `docs/quality/` restent indexés à leur emplacement ; pas de rangement supplémentaire non demandé.

## Sources et contradictions

Suivre la hiérarchie de [AGENTS.md](../../AGENTS.md) et l'[index courant](../references/current/ActiCiv_Phase2bis_Launch_Index.md). Une ancienne référence reste historique ; une ADR acceptée n'est pas périmée du seul fait de son âge. Les garanties Phase 2 sont conservées, sans rouvrir leurs arbitrages.

En cas de conflit, arrêter le changement de comportement concerné, exposer les deux sources et obtenir l'arbitrage de Patrick. Les rectifications de liens, statut courant ou version déjà explicitement décidée sont tracées sans inventer de nouvelle décision métier.

## Préservation et mise à jour

- Une modification de comportement, droits, données/API/RPC, audit, analytics/logging, i18n, sécurité ou architecture met à jour les documents concernés dans la même PR.
- Ne pas copier un contrat courant dans plusieurs dossiers. Utiliser des liens relatifs et des IDs stables. Chaque doublon conservé doit avoir une raison et un statut distincts.
- Une nouvelle décision structurante dispose d'une ADR ; une évolution supersède explicitement l'ancienne, sans masquer son contexte.
- Les postmortems conservent leurs conclusions et métriques datées. La clôture ultérieure est attestée séparément. Une réparation de destination de lien après déplacement est permise et tracée ; les résultats ne sont pas réécrits. L'original demeure dans le SHA historique.
- Les preuves brutes, manifestes et livres historiques restent inchangés. Leurs anciens chemins sont des données historiques, pas des liens à actualiser globalement.
- Ne jamais publier de secrets, identifiants de session, tokens Auth ou payloads personnels dans une preuve. Relever commande, date, SHA/contexte et résultat ; expurger avant versionnement.
- Marquer explicitement PASS, FAIL, DEFERRED ou NOT APPLICABLE avec justification. Une preuve manquante n'est pas un PASS.

## Conventions exécutables, déploiement progressif

« Toute convention importante, objectivement vérifiable et raisonnablement automatisable doit devenir un garde-fou exécutable lorsque cela reste simple, maintenable et proportionné au risque. »

Chaîne cible : Prettier → TypeScript strict → ESLint → tests d'architecture/scripts → Quality Gates. Choisir l'outil le plus simple adapté au contrôle ; garder le jugement humain pour UX, architecture, lecteur d'écran et pentest.

| Contrôle                                                          | État / checkpoint                                                |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| Format, TS strict, lint, frontières domain/application et bundles | Existent en Phase 2, à préserver                                 |
| POM, tags, focus/skips, attentes et garde-fous de conventions     | Implémentés en 2bis-B ; voir KB testing et preuves du checkpoint |
| Cohérence locale/catalogues                                       | Cible 2bis-C                                                     |
| Coverage, rapports, snapshots/gates                               | Cible 2bis-D                                                     |
| Scanners, artefacts compilés, mesures/budgets performance         | Cible 2bis-E                                                     |
| Contrats et séparation d'observabilité                            | Cible 2bis-F                                                     |
| Validation approfondie KB/Skills                                  | Cible 2bis-G                                                     |

Un contrôle documentaire ponctuel en 2bis-A n'est pas présenté comme un nouveau gate CI. Aucun plugin, script qualité du produit, budget numérique ou dependency n'est ajouté à ce checkpoint.

## Revue documentaire

Les quatre postmortems/attestation figés explicitement listés dans `.prettierignore` conservent leur mise en forme historique. Les index et les nouveaux rapports restent contrôlés normalement. Cette exemption de format ne dispense ni du contrôle des liens ni de la vérification de conservation du contenu ; elle évite une réécriture massive des preuves lors du rangement.

Vérifier les liens internes et ancres, les destinations externes pertinentes, les versions courantes, les statuts, les doublons et la traçabilité. Distinguer liens actifs, exemples dans les templates, URLs locales de développement et chemins figés dans les preuves. Vérifier le diff et la [DoD](definition-of-done.md). Les corrections documentaires seules ne justifient pas un reset DB ni une campagne destructive.
