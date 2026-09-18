# ActiCiv — checkpoint 2bis-H — rapport de revue

**Finalisation des preuves autorisée — pas de clôture H.** Périmètre : Quality Center read-only uniquement. Architecture H et ADR-015 approuvées par Patrick le 18 septembre 2026. Aucun 2bis-I ni Phase 3.

## Entrée et décisions

HEAD initial G approuvé : `11d6f94d4f4a7790bd22588847b0bb8aecd1703e`. Branche `phase-2bis-engineering-foundations`, remote GitHub patbol/ActiCiv. Arbre et diff propres avant modification ; nvm Node 24.21.0 / pnpm 11.19.0. AGENTS, références courantes (livre v1.4, prompt v1.2/checklist), ADR-008…014, KB applicables et schéma/policies D–G relus. La demande explicite récente autorise H ; anciens STOP G conservés comme contexte historique seulement.

## Architecture, données et droits

[ADR-015](../architecture-decisions/015-quality-center.md), [KB technique](../kb/technical/quality-center.md), [parcours/capacité](../kb/business/quality-center.md). Modèle canonique v1 conservé, code partagé via package interne @acticiv/quality et anciens chemins réexportés. Pas de second snapshot ni evaluator UI. Ingestion CLI gouvernée, stockage fichiers privé, pas de DB qualité. Pro read-only SSR, autorisation par cas d’usage avant lecture des pièces.

Migration additive quality.read dans la contrainte plateforme, aucun grant automatique. Acteur plateforme actif + Auth vérifiée + capacité explicite ; tous les rôles clients/Auth seule/metadata forgées refusés. RLS/grants et audit transactionnel d’attribution préservés. Pas d’analytics ni audit bruyant de lecture. Aucune nouvelle dépendance tierce ; package interne extrait sans coût SDK client. Node/pnpm non remplacés.

## Couverture fonctionnelle H

| Sujet                | Réalisation / limite                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages/vues           | `/quality`, navigation depuis Espace Pro autorisé, SSR ; aucun Client Component propre au Quality Center                                            |
| Overview             | Verdict canonique, SHA, environnement, policy/date, état dirty, quatre statuts, échecs/différés prioritaires                                        |
| Historique           | 25 entrées/page ; filtre environnement/statut sur page bornée ; ordre run_id horodaté des producteurs actuels                                       |
| Baseline/comparaison | NONE/CANDIDATE/ACCEPTED ; validation des sidecars ; A/B compatible même environnement/policy ; aucun bouton d’acceptation                           |
| Tests                | Suites, passed/failed/skipped/retries/flaky/durée ; details natifs, filtre tag criticité/route/composant, 100 premières lignes/suite                |
| Coverage             | Global/modules, quatre dimensions, zéro visible, null non mesuré ; distinct de SQL/RLS/E2E ; advisory                                               |
| Sécurité             | Scans, findings ouverts minimisés, catégorie/sévérité/statut, risque accepté/propriétaire/expiration/retest lorsqu’ils existent                     |
| Accessibilité        | Axe/incomplete distincts des preuves manuelles et de leur portée historique ; protocole H séparé                                                    |
| Artefacts            | Digests Citizen/Pro, hygiene/bundles, findings, politique maps/test-debug ; références GitHub contrôlées et expiration                              |
| Performance          | Mesures JS/gzip/chunks/largest/latences existantes et deltas observés ; aucun budget inventé                                                        |
| Docs                 | Check docs, métriques KB/ADR/Skills/liens présents ; H propre dans docs et traçabilité                                                              |
| Provenance           | SHA/run/environnement, snapshot/source/policy digests, références de preuves par empreinte ; aucun chemin absolu exposé                             |
| Erreurs              | Source non configurée, vide, run absent/invalide/partiel, pièces absentes, comparaison incompatible, artefact absent/expiré ; aucun PASS par défaut |
| Compatibilité        | Policies/snapshots historiques D/E/F/G relisibles, aucun fichier historique réécrit                                                                 |
| Limites              | Pas d’orchestration CI, write UI, promotion, ticketing, graphe sans données ; conservation dépend du magasin opérateur                              |

## Tests et preuves

RED constaté pour la contrainte SQL quality.read, le garde documentaire qui interdisait encore H et la frontière Client Component du noyau qualité. Tests du lecteur, digests/pièces, liens sûrs, rôles/capacités avant stockage, vraie Auth/JWT/RLS, E2E/a11y/i18n ; résultats finaux renseignés après exécution complète.

La reconstruction DB locale avec les douze migrations et seed a été exécutée ; tests SQL : 147 assertions PASS. Test réel quality.read : PASS après migration. Aucun changement de migration déjà publiée.

## Accessibilité manuelle et arrêt

[VoiceOver H](phase-2bis-h-voiceover.md) : **PASS**, H-VO-01 à H-VO-09 validés explicitement par Patrick le 18 septembre 2026. TalkBack reste **DEFERRED**, sans appareil Android connecté. Le résultat manuel ne découle pas d’axe et ne constitue pas à lui seul une clôture H.

Première campagne H : 8 E2E PASS desktop/mobile après correction de deux erreurs de scénario (locator alert trop large incluant l’annonceur Next et interaction avant focus initial/hydratation). Nouvelle assertion langue : focus explicite avant sélection Playwright, conservation réelle vérifiée ; aucun sleep/retry ajouté. Régression expiry : projection corrigée pour le champ canonique `expiry`, test RED→GREEN. Lecteur et comparaison : 14 tests ciblés PASS avant ajout du regroupement coverage H. Reconstruction/JWT/SQL : PASS.

Import réel D/E/F/G : cinq runs immuables, dont E local avec 17 findings DAST conservés et G CI lié au run GitHub 35316005267. Aucun snapshot historique ni seuil modifié. Le groupe coverage quality-center inclut le noyau extrait et tous les nouveaux fichiers applicatifs ; zéro non masqué.

Les résultats finaux de commandes, mesures et snapshot seront consignés ci-dessous après la campagne. Aucun verdict de release SHA propre/CI n’est revendiqué sur cet arbre de développement. CI non modifiée à ce stade.

## Campagne intermédiaire complète

`pnpm verify` PASS. Collecte `2026-09-18T07-37-18-089Z-52eed9ca` PASS et évaluation réelle PASS : 217 unitaires, 147 SQL, 8 intégrations Node, 9 adaptateurs réels, 46 E2E DEMO, 22 E2E PROD ; zéro échec, skip, retry ou flaky. Scans SAST/artefact/dépendances/secrets PASS. Snapshot dirty=true, HEAD G : preuve de développement identifiée par son source_digest, pas release propre H. Les deltas de modules et l’historique ont ensuite été complétés via le comparateur canonique commun ; une nouvelle campagne suit ces changements.

Mesure PROD intermédiaire Pro : 696 773 octets JS / 216 429 gzip / 17 chunks / plus gros 228 918 octets, identiques à G. CSS 12 694 octets contre 8 251 (delta +4 443). Aucun Client Component qualité supplémentaire. Le catalogue qualité est chargé côté serveur Pro uniquement, absent du catalogue Citizen.

Baseline acceptée : les métadonnées humain/date malformées étaient admises par l’ancien comparateur ; tests RED ajoutés, validation typée/date renforcée dans le noyau canonique commun, sans auto-acceptation. Comparaison et UI ne recalculent aucun gate.

TalkBack : adb disponible, inventaire réellement exécuté, zéro appareil connecté. DEFERRED séparé de VoiceOver H.

## Campagne finale de revue et validation VoiceOver

Campagne `2026-09-18T07-43-48-986Z-40a7f6dd` : `pnpm verify`, collecte et évaluation PASS. 220 tests unitaires, 147 SQL, 8 intégrations Node, 9 adaptateurs, 46 E2E DEMO et 22 E2E PROD ; zéro échec, skip, retry ou flaky. Policy `2bis-G.v1` advisory inchangée : 24 PASS, 0 FAIL, 2 DEFERRED (reconstruction non intégrée à ce snapshot, DAST), 2 NOT_APPLICABLE (pentest indépendant, budget performance non approuvé). Le reset local séparé décrit plus haut n’est pas assimilé à une preuve de release sur SHA H propre.

Identité du snapshot avant cette consignation documentaire :

- HEAD : `11d6f94d4f4a7790bd22588847b0bb8aecd1703e`, environnement `local`, `dirty: true`.
- source_digest : `e8b4302deff2cf11ff45eb1849d2cbae1d3d800a9976f8e2caf8041ae1b4a79f`.
- policy_digest : `46bad628fe71efa0c5cde78614093b912f57a0670801f934962c60893a599d69`.
- snapshot digest : `ba6476f180105a1f332e7207042a239fb117c3fcf1df863e9f816bcbc52cd437`.

Le retour de Patrick « ok pour les tes VO » valide ensuite les neuf parcours VoiceOver H sur le candidat local proposé. L’attestation détaillée et ses limites sont dans le protocole lié ci-dessus. Seuls le protocole et ce rapport sont actualisés ; les snapshots restent immuables et leur empreinte source désigne l’état antérieur à cette mise à jour documentaire.

**READY FOR PATRICK REVIEW** : VoiceOver PASS ; TalkBack DEFERRED distinct. H non clôturé ; ADR-015 désormais approuvée, finalisation commit/CI autorisée et preuves à produire. Aucun 2bis-I ni Phase 3.

## Contrat de finalisation sur SHA propre

La décision de Patrick autorise le commit de H et les preuves locales/CI sur ce SHA. `release:verify --rebuild-db` et `quality:collect --rebuild-db` reconstruisent le projet Supabase local depuis zéro, y compris M12 et le seed. Le workflow conserve ses deux jobs et ses périmètres d’upload : snapshots minimisés et journal de validation ; ni `.quality/h-review-access.txt` ni sources synthétiques privées ne font partie des chemins uploadés.

Le schéma canonique v1 et la policy `2bis-G.v1` advisory restent inchangés : H ajoute une présentation et une capacité explicite, sans nouveau contrat de gate. Autorisations, SQL/RLS, E2E, axe, sécurité, artefact et documentation restent couverts par les gates existants. La reconstruction est collectée explicitement dans le snapshot final.

VoiceOver H reste une attestation humaine référencée distincte d’axe. Les nouveaux snapshots reprendront le PASS approuvé avec sa date, son build et sa portée ; aucun rejeu n’est revendiqué. Aucun code UI changé après cette validation. Les comptes et preuves privées de revue restent ignorés et hors upload. L’attestation finale produite après commit identifiera SHA, CI, snapshots et digests sans modifier les sources validées ni accepter automatiquement la baseline.
