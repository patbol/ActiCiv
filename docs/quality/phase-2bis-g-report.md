# Checkpoint 2bis-G — rapport de revue

Statut : **READY FOR PATRICK REVIEW**. Architecture G et ADR-014 approuvées depuis par Patrick ; la clôture attend les preuves du commit propre et de sa CI. Périmètre : Knowledge Base, Skills & Documentation Governance uniquement. H/Quality Center/Phase 3 non commencés.

## Baseline et audit initial

HEAD `ebab16c5c5c3133dda5afa5061263da5c3bcf25e`, branche `phase-2bis-engineering-foundations`, remote `https://github.com/patbol/ActiCiv.git`, arbre propre et diff --check sans anomalie avant modification. Node 24.21.0 et pnpm 11.19.0 chargés avec nvm. F et ADR-008 à 013 approuvés explicitement par Patrick.

L’audit a retrouvé douze fiches actives (une métier, onze techniques), des templates et un catalogue Skills sans playbooks complets. Statuts courants et textes C–F contenaient des descriptions temporelles devenues anciennes. Aucun domaine reports/routing/intervention ni écran Quality Center présent. Les ADR 001–013 restent actives ; seule la réserve PostGIS d’ADR-002 a été remplacée par ADR-005.

## Réalisation

Neuf fiches métier ajoutées aux préférences de langue : authentication, invitations, membership, organisations/services, droits, contrats/couverture, territoires, horaires, SLA. Neuf techniques ajoutées : architecture, auth, authorization, DB/migrations, PostGIS, schedules/DST, SLA, release/reproducibility et knowledge governance. Les douze fiches existantes sont conservées avec leurs IDs ; titres/phases ajoutés et temporalités actualisées. Une seule [matrice générée](../kb/traceability.md) associe exigences/rôles, KB, ADR, code/tests et documents d’observabilité, avec retour ADR→KB.

Frontmatter léger et YAML standard, parseur `yaml` 2.9.1 en devDependency exacte (Node >=14.6, licence ISC). Aucun import runtime produit. [Validateur](../../tooling/quality/knowledge.ts) et [CLI](../../tooling/quality/knowledge-cli.ts) : IDs/types/statuts/phases, liens/ancres, chemins, ADR, Skills et fraîcheur de la trace. [ADR-014 proposée](../architecture-decisions/014-knowledge-skills-governance.md) complète 008/011 ; [audit ADR](../architecture-decisions/README.md) conserve l’histoire.

Les [quinze Skills](../skills/README.md) sont des procédures spécialisées au format canonique name/description. Découverte manuelle AGENTS → catalogue → playbook ; aucun autodiscovery prétendu. Rules non dupliquées, STOP de phase et rigor proportionnée. Politique same-PR, DoD et checklist alignées ; pas de faux contrôle automatique de justesse métier.

CI obtient `docs:validate` via `verify`, sans nouveau job/framework. Collecteur ajoute `docs` au snapshot v1 et policy G advisory ; anciennes policies D/E/F conservées et relisibles. Aucun gate numérique coverage/performance introduit. Artifact Hygiene ajoute la détection de chemins/IDs KB/Skills dans les artefacts compilés et traces NFT. Aucun fichier application, UI, SQL ou migration modifié.

## Preuves et limites

RED observé : validateur absent puis tests de fuite documentaire échouant avant ajout du garde. Les résultats finaux et le snapshot sont consignés ci-dessous. Aucun reset DB autorisé/nécessaire pour G. Pas de nouvel E2E ni campagne lecteur d’écran : UI inchangée. Les tests historiques peuvent être rejoués par la collecte sans être présentés comme nouveaux parcours.

Limites : validateur syntaxique, pas analyse sémantique exhaustive de la prose ; liens web non crawlés ; preuves historiques non réécrites. Cellule « Version 1.3 » résiduelle dans le livre fourni v1.4 : signalée dans l’index courant, correction éditoriale à la prochaine édition, sans ambiguïté sur la référence v1.4 explicitement désignée par Patrick. Découverte des Skills manuelle. Seuils advisory ; aucune acceptation de baseline/release par l’agent.

## Validation intermédiaire observée

195 tests unitaires passent, dont 19 tests du validateur, 3 nouvelles régressions d’artefact et une preuve du check docs canonique. Typecheck/lint/format/docs:validate passent. Les quinze playbooks passent aussi `quick_validate.py` du skill-creator ; PyYAML absent du Python système a été installé seulement dans un venv temporaire hors dépôt pour cette vérification.

Audit de navigation : 68 documents KB/Skills/ADR atteignables depuis les index, aucun orphelin dans ce périmètre, aucun contenu strictement dupliqué KB/Skills ; 0 ID dupliqué. Les références historiques restent des cibles autorisées et clairement identifiées. Les associations ne prétendent pas une couverture sémantique automatique.

Première collecte `2026-09-18T06-27-09-413Z-877e429b` : FAIL conservé. Docker était arrêté (socket absent), empêchant SQL/intégration/E2E/SAST/performance. Les checks format/lint/types/docs/unit/build/bundles/artifact/audit dépendances/secrets/source-integrity ont passé. Docker a ensuite été démarré ; aucun reset/suppression de données. Une campagne distincte après correction de l’environnement a été exécutée avec succès ; aucun retry de test ni réécriture du snapshot échoué.

## Résultat final de la campagne locale

`pnpm quality:collect` puis `pnpm quality:evaluate` ont réellement été exécutés. Le collecteur a lancé format/lint/typecheck/docs, unitaires V8, SQL, intégrations, builds, bundles, E2E DEMO/PROD, Semgrep, artefacts, performance, audit dépendances et Gitleaks. Les scripts de release restent préservés ; `release:verify --rebuild-db` n’a pas été lancé en G (aucun changement DB).

| Contrôle                                                | Résultat                                                                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Format, lint, types, frontières                         | PASS                                                                                                                      |
| KB/frontmatter, liens/ancres, ADR, Skills, traceability | PASS — 32 fiches/templates, 14 ADR, 15 Skills, 86 Markdown vivants contrôlés, 0 erreur                                    |
| Tests unitaires                                         | PASS — 195, dont 19 du validateur                                                                                         |
| SQL/pgTAP                                               | PASS — 138 assertions sur la DB locale existante                                                                          |
| Intégration Node/JWT/concurrence                        | PASS — 8                                                                                                                  |
| Adaptateurs réels                                       | PASS — 8                                                                                                                  |
| E2E historiques DEMO / PROD                             | PASS — 38 / 14, zéro skip/retry/flaky                                                                                     |
| Axe                                                     | PASS — analyses automatisées des parcours existants                                                                       |
| Semgrep                                                 | PASS — 97 fichiers applicatifs, 7 contrôles positifs, 0 finding ; outillage G couvert séparément par lint/types/unitaires |
| Artifact Hygiene                                        | PASS — 212 fichiers Citizen / 332 Pro, 0 finding dont fuite KB/Skills                                                     |
| Gitleaks                                                | PASS — historique HEAD, sources modifiées/non suivies et builds PROD static/server ; rapports minimisés                   |
| Audit dépendances                                       | PASS selon le seuil high existant                                                                                         |
| Performance                                             | Mesurée, advisory ; JS/gzip/chunks inchangés par rapport aux mesures F                                                    |
| Policy G et évaluation                                  | PASS — 24 PASS, 0 FAIL, 2 DEFERRED, 2 NOT_APPLICABLE                                                                      |
| Compatibilité snapshot F                                | PASS — réévaluation du snapshot F avec sa policy/digest F inchangée                                                       |

Le contrôle Skills officiel `quick_validate.py` a également validé les quinze répertoires. Le validateur du dépôt conserve ce contrôle de structure/liens dans le workflow sans dépendre du Python temporaire.

## Identité et digests

- Run : `2026-09-18T06-29-47-239Z-65c4726c`.
- HEAD : `ebab16c5c5c3133dda5afa5061263da5c3bcf25e` (baseline F), environnement `local`, **dirty: true**.
- Sources testées : `8a19be9abc961896e2f2a6e24d1966027b09fd633858e002122ab3e31a20abda`.
- Snapshot : `.quality/snapshots/2026-09-18T06-29-47-239Z-65c4726c/snapshot.json`.
- Digest snapshot : `bef461c0503c2ac81825f5f7b761e059620767278e0c191e5a522560ab159244`.
- Policy `2bis-G.v1` advisory : `46bad628fe71efa0c5cde78614093b912f57a0670801f934962c60893a599d69`.
- Artefact Citizen : `77782043361d13e804998fad535f505d2813213177fea1c02bca1a41efecf154`.
- Artefact Pro : `590a9c29dadfa70f927d5d1aa6fb6c06d05a3bd4612d7feff2e6fc5962c6e880`.

La source est restée stable pendant cette campagne. Ce paragraphe de résultats a été ajouté ensuite au seul rapport G, puis recontrôlé pour format/liens/secrets ; le snapshot conserve honnêtement l’état testé avant cet ajout documentaire. Aucun code ni contrat applicatif n’a changé après la campagne. Une release finale nécessitera un commit propre et ses preuves sur le même SHA : ces mesures dirty ne sont pas une baseline de release acceptée. Aucun commit/push ni run GitHub G revendiqué à cette étape de revue.

## Exceptions, dette et périmètre

- **FAIL actuel : 0** dans la campagne finale. Le snapshot FAIL initial d’environnement est conservé et expliqué ci-dessus.
- **DEFERRED du snapshot :** reconstruction DB absente (non applicable au changement G, aucun reset demandé) et campagne DAST optionnelle non exécutée. Pas de transformation artificielle en PASS.
- **NOT_APPLICABLE du snapshot :** pentest indépendant avant vraie PROD/pilote significatif ; budget performance numérique non approuvé.
- **NOT_APPLICABLE à G :** migration/backfill/reset, nouveau parcours E2E, nouveau contrôle VoiceOver/TalkBack, nouvelle UI, audit métier/analytics/logging applicatifs. Les tests existants rejoués ne sont pas des fonctionnalités ajoutées.
- **À finaliser après revue Patrick :** acceptation ADR-014/G, commit propre et éventuelle validation CI du SHA G ; aucun ancien run F présenté comme CI G.
- **Limites explicites :** lecture des Skills manuelle ; cohérence sémantique et same-PR relèvent aussi de la revue ; liens web non testés ; résidu éditorial v1.3 dans le livre v1.4 conservé et signalé pour prochaine édition. Aucune duplication exacte/orphelin KB/Skills/ADR ; l’inventaire n’affirme pas une absence universelle de redondance conceptuelle.

Le diff ne modifie aucun fichier `apps`, `packages`, `supabase`, ni preuve historique sous `docs/evidence` ou `docs/references/historical`. Les nouveaux contrôles vivent dans l’outillage de développement ; dépendance runtime produit ajoutée : aucune. Le fichier Word autoritaire est inchangé.

**STOP pour validation Patrick. Aucun 2bis-H, aucun Quality Center UI, aucune Phase 3 commencés.**

## Finalisation autorisée par Patrick

Architecture G et ADR-014 approuvées. Le contenu ci-dessus conserve les mesures de travail avant commit. La finalisation fige un commit propre, exécute `pnpm verify`, validation documentaire, collecte/évaluation G et scans, pousse la branche puis vérifie les deux jobs CI, la collecte et les artefacts téléchargés au même SHA. Aucun reset DB local supplémentaire n’est requis ; le job CI historique reconstruit sa DB éphémère dans le workflow explicitement demandé.

Les preuves finales identifiées par SHA/run/digests seront livrées dans l’attestation externe sous `.quality/closure/<run-GitHub>/closure.md`, hors arbre versionné, pour ne pas modifier le candidat après ses validations. Leur succès n’est pas anticipé ici. STOP avant H/Quality Center/Phase 3 et pour validation Patrick.
