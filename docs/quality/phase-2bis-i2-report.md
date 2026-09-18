# Phase 2 bis — I2 : corrections ciblées

Périmètre autorisé : les six P1 de I1, uniquement. Base propre vérifiée : `615e59b327ade189d94598b6d35533e689493309`, branche `phase-2bis-engineering-foundations`, Node 24.21.0/pnpm 11.19.0 via nvm. Aucun commit/push, I3 ou Phase 3 commencé. Aucun reset DB ni campagne globale.

## Impact et correspondance

Contrat qualité → producteurs/normalisateurs → snapshot/évaluateur → projection serveur Quality Center → textes FR/EN → tests/KB. Droits quality.read, Auth, RLS, SQL métier, audit transactionnel et Analytics/Logs inchangés. Aucune migration ni dépendance ajoutée. Le libellé de collecte CI mentionne désormais la policy I effectivement utilisée ; aucun job, fréquence ou campagne CI ajouté. ADR-008…015 conservées ; ces compléments réalisent le contrat approuvé sans nouvelle architecture.

| P1  | Écart I1        | Correction                                                                                                                                  | Preuve RED / GREEN                                                                                  |
| --- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 01  | F2 promotion    | Modèle pur candidate/validated/eligible/promoted, binding SHA/snapshot/policy/baseline/artefacts, reçu externe exigé pour attester promoted | Tests rouges d’états et identité ; tests du noyau I2                                                |
| 02  | F1 budgets      | Configuration v2 stricte ; absent/advisory/blocking, approbation obligatoire du blocking, mesures coverage/performance                      | Advisory ignoré et blocking non bloquant reproduits avant correction ; cas min/max/absence/invalide |
| 03  | F4 flakiness    | Mesure séparée → import explicite même SHA/source/env → snapshot → gate → projection QC                                                     | Producteur non raccordé et présentation absente reproduits ; quatre états et provenance testés      |
| 04  | F3 sécurité     | Lifecycle ouvert/risque accepté/corrigé en attente/retest/fermé/faux positif qualifié                                                       | États rejetés avant correction ; critical/high/expiry/closure testés ; 17 ZAP restent ouverts       |
| 05  | F6 docs actives | Statuts A–H/I2, ADR approuvées, KB/testing/index, seuil anti-abus verrouillé                                                                | Reproduction éditoriale I1 ; contrôle documentaire, sans test miroir sur la prose                   |
| 06  | F5 axe / QC     | Compte et IDs incomplete par test, REVIEW_REQUIRED distinct ; provenance visible, FR/EN                                                     | Normaliseur sans revue et E2E sans bloc stabilité reproduits ; normalisation/UI ciblées             |

Le premier lancement des tests échoue sur modules absents. Avec interfaces minimales : 14 échecs, dont trois assertions de compatibilité testées initialement par hash du JSON brut ; ces trois assertions ont été corrigées en comparaison structurelle, car l’ordre des clés du fichier n’est pas celui du parseur historique. Les autres échecs reproduisent les fonctions manquantes. E2E RED réel desktop : « Stable sur l’échantillon » absent du build H. Aucun retry ajouté.

## Contrats et historique

Nouvelles preuves : snapshot identité v2 ; lecteur v1/v2. Policy nouvelle `2bis-I.v1`, advisory : règles supplémentaires flakiness/revue axe/dette, budgets vides et exigences d’éligibilité future. Policies D/E/F/G, snapshots, attestations et rapports A–H inchangés. Le mécanisme blocking est testé avec configurations synthétiques approuvées dans les tests ; aucun nombre n’est activé en production.

Promotion : une évaluation n’est pas un déploiement. L’absence des preuves opérationnelles futures empêche l’éligibilité ; aucune preuve PROD n’est créée. L’identité d’exécution local/ci-local et les étapes de promotion sont distinctes.

Les 17 findings E restent OPEN/pending sans risque accepté. Owner/due non décidés sont NULL explicites ; aucune attribution ni échéance humaine inventée. Le registre lie le snapshot source historique, sans prétendre à un nouveau scan.

## Validation I2

Résultats observés :

- Suite ciblée finale : **202 tests PASS (12 fichiers), dont 20 tests I2**. Les suites couvrent aussi snapshot/évaluateur/lecteur, confidentialité, architecture/conventions, locale et Quality Center.
- Format, lint, typecheck et git diff --check : PASS. Docs : 34 KB, 15 ADR, 15 Skills, 92 Markdown, zéro erreur.
- Builds Pro DEMO et PROD : PASS ; Citizen inchangé, builds existants utilisés pour le serveur compagnon des tests ciblés.
- E2E Quality Center : 8 DEMO + 8 PROD PASS, desktop/mobile, axe, FR/EN/clavier ; retries 0. Les journaux Next signalent des streams fermés lors des navigations/fermetures ; aucune assertion n’a échoué. Ce diagnostic n’est pas masqué et sera à surveiller pendant la campagne globale.
- Artifact Hygiene compilée : PASS, rapport local `.quality/assurance/artifact-Z9dpDH/report.json`. SAST : PASS, rapport `.quality/assurance/sast-IiH0zc/report.json`.
- Gitleaks : contrôles positifs/négatifs, historique de 17 commits et sources candidates PASS, aucune fuite détectée.
- Relecture réelle de 13 snapshots historiques D/E/F/G/H : toutes pièces/digests vérifiés, réévaluation identique avec policy d’origine. Tests v1 et v2 présents ; la version future rejetée par le test devient 3, puisque 2 est désormais supportée.

Les checks de I2 ne constituent ni un snapshot final de release ni une campagne I3. Aucun SHA propre final/CI n’est revendiqué sur les modifications non commitées.

## Accessibilité manuelle et limites

VoiceOver H-VO-01…09 reste une preuve historique approuvée ; I2 ne le rejoue pas automatiquement. Revue ciblée à effectuer sur les ajouts statiques : lecture stabilité (stable/instable/inconnu/non exécuté, période/taux/provenance), lecture axe (revue humaine requise, compteur/règles/provenance séparés des violations et preuves manuelles), puis mêmes annonces FR/EN. Aucun nouveau composant interactif. Cette revue est une preuve manuelle distincte à obtenir avant clôture finale.

TalkBack reste DEFERRED_ENV faute d’Android. Campagne complète, nouvelle DAST et preuve SHA/CI finale réservées à I3 après autorisation. Pentest/déploiement/restore PROD : NOT_APPLICABLE à I2. Les dettes pré-PROD de I1 restent visibles, sans fermeture implicite.

## Fichiers concernés

- Noyau : `packages/quality/src/{budgets,flakiness,promotion,model,parsers,security,snapshot}.ts`.
- Chaîne : `tooling/quality/{cli,collect,import-cli}.ts`, `policy-i.json`, `tooling/security/security-debt.json` ; libellé `.github/workflows/ci.yml`.
- UI : `apps/pro/src/app/quality/page.tsx`, projection `packages/backend/src/modules/quality/infrastructure/presentation.ts`, catalogues `packages/shared/src/messages/{fr-FR,en-GB}/quality.json`.
- Tests : `tooling/quality/{i2,center}.test.ts`, `e2e/{quality.spec.ts,fixtures/quality-source.ts,helpers/ui.ts}`.
- Documents actifs : AGENTS/README, index docs/KB/ADR/Skills/Launch Index, politique documentaire, quality-evidence, KB qualité/release/sécurité/testing, questions ouvertes, traçabilité dérivée et présent rapport.

## Résultat

Les six corrections sont implémentées. FAIL fonctionnel restant dans ce périmètre : aucun identifié après les contrôles ciblés. DEFERRED : revue manuelle ciblée de l’affichage I2, TalkBack sans Android, attribution/échéances humaines de la dette ZAP et preuves de clôture réservées à I3. NOT_APPLICABLE à I2 : reset/migration DB, déploiement/pentest/restore PROD. Aucun budget numérique bloquant activé, aucune baseline acceptée ni promotion fabriquée.

I2 RESULT: **READY FOR I3**, sous réserve de l’autorisation explicite de Patrick pour démarrer cette campagne. Ce résultat ne clôture pas la Phase 2 bis. Aucune I3 et aucune Phase 3 commencée.
