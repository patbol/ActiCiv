# Phase 2 bis — checkpoint 2bis-A

Date : 17 septembre 2026. Périmètre : baseline documentaire, Rules et gouvernance uniquement. Revue Patrick en attente ; aucun 2bis-B autorisé et aucune Phase 3 commencée.

## État initial et branche

- Dépôt : `/Users/patrickmoreno/ActiCiv/dev/acticiv`.
- Remote fetch/push : `https://github.com/patbol/ActiCiv.git`.
- Branche initiale : `phase-2-core-data-security`.
- HEAD initial et baseline Phase 2 : `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`.
- Runtime vérifié après chargement de nvm et `nvm use` : Node `v24.21.0`, pnpm `11.19.0`.
- `git diff --check` initial : sans erreur.
- Arbre initial non propre : 15 anciens chemins supprimés par le rangement manuel, leurs 15 destinations présentes, plus AGENTS.md, les quatre références courantes et l'attestation finale fournis par Patrick, non suivis. Aucun code/configuration fonctionnelle modifié.
- Les 15 déplacements ont été comparés octet pour octet à HEAD avant correction : tous identiques. Aucune suppression de contenu inexpliquée.
- Branche créée : `phase-2bis-engineering-foundations`, directement depuis le SHA officiel, sans amend/rebase/force-push.

Le checkpoint prépare un commit documentaire local pour revue. Son identité est donnée par Git et le retour de livraison, pas incorporée dans son propre contenu. La réussite des contrôles documentaires ne vaut pas clôture de toute la Phase 2 bis.

## Structure finale

```text
AGENTS.md
README.md
docs/
  README.md
  evidence/
    README.md
    phase1/
    phase2/
      raw/
  references/
    current/
    historical/
  architecture-decisions/
  product-decisions/
  quality/
  kb/
    business/
    technical/
    templates/
  skills/
```

Le rangement de Patrick est conservé. Les anciens journaux/captures de `docs/quality/` sont indexés comme historiques sans déplacement. Les README techniques préexistants de proximité restent en place. Aucun nouveau dossier `doc/`.

## Déplacements manuels intégrés — inventaire complet

Aucun déplacement supplémentaire effectué par l'agent. Les chemins sources disparaissent uniquement parce que leur contenu est conservé aux destinations approuvées.

| Ancien chemin à la baseline                                          | Destination officielle                                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `doc/ActiCiv_Phase2_Postmortem.md`                                   | `docs/evidence/phase2/ActiCiv_Phase2_Postmortem_HISTORICAL.md`                     |
| `doc/ActiCiv_Phase2_Postmortem_Audit_e389396.md`                     | `docs/evidence/phase2/ActiCiv_Phase2_Postmortem_Audit_e389396.md`                  |
| `doc/ActiCiv_Phase2_VoiceOver.md`                                    | `docs/evidence/phase2/ActiCiv_Phase2_VoiceOver.md`                                 |
| `doc/preuves/phase2-audit-runtime.txt`                               | `docs/evidence/phase2/raw/phase2-audit-runtime.txt`                                |
| `doc/preuves/phase2-database-metadata.txt`                           | `docs/evidence/phase2/raw/phase2-database-metadata.txt`                            |
| `doc/preuves/phase2-e389396-release-verify.log`                      | `docs/evidence/phase2/raw/phase2-e389396-release-verify.log`                       |
| `docs/file-manifest.txt`                                             | `docs/evidence/phase1/ActiCiv_Phase1_File_Manifest.txt`                            |
| `docs/phase-2.md`                                                    | `docs/references/historical/ActiCiv_Phase2_Implementation_Reference_HISTORICAL.md` |
| `docs/references/ActiCiv_Livre_Produit_Technique_v1.1_FINAL_A4.docx` | `docs/references/historical/ActiCiv_Livre_Produit_Technique_v1.1_FINAL_A4.docx`    |
| `docs/references/ActiCiv_Phase1_Postmortem.md`                       | `docs/evidence/phase1/ActiCiv_Phase1_Postmortem.md`                                |
| `docs/references/ActiCiv_Phase1_Rapport_livraison_Phase1.md`         | `docs/references/historical/ActiCiv_Phase1_Rapport_livraison_Phase1.md`            |
| `docs/references/ActiCiv_Phase2_Decisions.md`                        | `docs/references/historical/ActiCiv_Phase2_Decisions.md`                           |
| `docs/references/ActiCiv_Phase2_Proposition_Architecture.md`         | `docs/references/historical/ActiCiv_Phase2_Proposition_Architecture.md`            |
| `docs/references/ActiCiv_Prompt_Astra_Phase2_v1.1_HEX.md`            | `docs/references/historical/ActiCiv_Prompt_Astra_Phase2_v1.1_HEX.md`               |
| `docs/references/master-development-prompt.md`                       | `docs/references/historical/master-development-prompt_HISTORICAL.md`               |

Douze fichiers déplacés restent strictement identiques à la baseline. Dans les deux postmortems Phase 2 et la référence d'implémentation, seules les destinations de liens Markdown sont modifiées ; textes, conclusions et matrices sont conservés. Les journaux bruts, manifeste, VoiceOver, postmortem Phase 1 et livre v1.1 ne sont pas réécrits.

## Fichiers créés par le checkpoint — inventaire complet

- `.gitleaks.toml` : configuration minimale du scanner existant, faux positif documenté ci-dessous ; aucun nouveau scanner.
- `docs/architecture-decisions/008-knowledge-governance.md`
- `docs/architecture-decisions/README.md`
- `docs/evidence/README.md`
- `docs/evidence/phase1/README.md`
- `docs/evidence/phase2/README.md`
- `docs/kb/README.md`
- `docs/kb/business/README.md`
- `docs/kb/technical/README.md`
- `docs/kb/templates/business-feature.md`
- `docs/kb/templates/technical-topic.md`
- `docs/quality/definition-of-done.md`
- `docs/quality/documentation-policy.md`
- `docs/quality/pr-checklist.md`
- `docs/quality/traceability.md`
- `docs/quality/phase-2bis-a-report.md` (ce bilan)
- `docs/references/historical/README.md`
- `docs/skills/README.md`
- `docs/skills/template.md`

## Fichiers présents puis modifiés par le checkpoint

| Fichier                                                                                             | Modification                                                                                                              |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                                                                         | Statuts CLOSED/CURRENT/2bis-A/NOT STARTED, SHA et chemins officiels                                                       |
| `docs/README.md`                                                                                    | Index CURRENT/HISTORICAL/EVIDENCE et gouvernance                                                                          |
| `AGENTS.md`                                                                                         | Corrections ciblées, liens gouvernance, limites du checkpoint et format ; structure initiale conservée                    |
| `.prettierignore`                                                                                   | Quatre exclusions nominatives de preuves figées pour préserver leur format historique ; index nouveaux toujours contrôlés |
| `docs/architecture-decisions/001-modular-monolith.md`                                               | Destination du lien de cartographie après déplacement                                                                     |
| `docs/product-decisions/open-questions.md`                                                          | Destination de la référence historique Phase 2                                                                            |
| `docs/quality/phase-2-report.md`                                                                    | Destination du postmortem ; résultats historiques inchangés                                                               |
| `docs/quality/strategy.md`                                                                          | Destination de la procédure Phase 2 ; contenu historique inchangé                                                         |
| `docs/references/current/ActiCiv_Phase2bis_Launch_Index.md`                                         | Checkpoint, hiérarchie alignée, liens et inventaire réel des versions présentes                                           |
| `docs/references/current/ActiCiv_Prompt_Astra_Phase2bis_v1.2_Engineering_Quality_i18n_Knowledge.md` | Une mention résiduelle v1.3 → v1.4 au §56                                                                                 |
| Trois documents déplacés listés plus haut                                                           | Destinations de liens uniquement                                                                                          |

Les fichiers fournis par Patrick suivants sont intégrés sans modification de contenu : livre v1.4 et attestation finale Phase 2. La checklist v1.2 conserve son contenu ; seuls deux espaces de fin de ligne après sa date ont été retirés pour `git diff --check`. AGENTS.md, index de lancement et prompt sont également des apports initiaux de Patrick, corrigés comme indiqué ; ils ne sont pas présentés comme créés de zéro par l'agent.

## AGENTS.md et gouvernance

AGENTS.md n'a pas été remplacé. Corrections : 2bis-A seul autorisé ; distinction règle cible/outillage réellement installé ; ADR 001–007 toujours applicables ; organisation active/ownership ; capacités plateforme distinctes ; cookie dans le fallback Pro ; audit SQL conservé ; pentest avant vraie PROD/pilote significatif sans échéance erronée de numéro de phase ; documentation sous `/docs` et liens vers les conventions.

DoD, checklist PR et traçabilité définissent impact map, test-first critique, preuve de non-régression, sécurité/a11y/i18n, séparation des trois flux d'observabilité et validations proportionnées. Une PR documentaire n'impose pas une reconstruction DB inutile. Le principe des conventions exécutables est formalisé, son automatisation future reste répartie entre checkpoints.

KB : deux index des domaines réels, deux templates avec frontmatter, IDs et conventions de liens. Aucune fiche Phase 3 fictive. Skills : catalogue des 15 workflows et template ; tous sont PLANNED, aucun playbook complet ni autodiscovery installé. Chemin canonique documentaire prévu sous `docs/skills/`.

ADR-008 est la seule nouvelle ADR : gouvernance documentaire, KB et playbooks. Elle est proposée pour revue ; elle ne supersède pas les ADR 001–007. Les ADR E2E/i18n/Quality/Security/Observability attendent leurs checkpoints.

## Liens, versions et conservation

Le contrôle initial a relevé 70 occurrences de destinations Markdown cassées après rangement. Elles ont été réparées ou remplacées dans les index réécrits. Les chemins figés dans les logs/manifeste ne sont pas transformés en liens courants.

Les index distinguent le postmortem historique (256 PASS / 0 FAIL / 5 DEFERRED) de l'attestation finale (260 PASS / 0 FAIL / 1 DEFERRED). Le journal e389396 n'est jamais présenté comme celui de fac0fc8. Aucun livre v1.2/v1.3 absent n'est annoncé comme archivé.

## Validations

Verdict documentaire : **READY FOR PATRICK REVIEW**. Contrôles réellement exécutés avec Node `v24.21.0` et pnpm `11.19.0` :

| Contrôle                                                         | Résultat et périmètre                                                                                                                                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sources, diff et inventaire                                      | PASS — rangement manuel conservé, 18 nouveaux documents et une configuration Gitleaks minimale ; aucun code applicatif, test, migration, dépendance ou workflow CI modifié |
| Liens Markdown/DOCX                                              | PASS — 47 fichiers Markdown, 217 liens locaux, aucune destination/ ancre cassée ; trois destinations GitHub externes vérifiées via API                                     |
| Provenance externe Phase 2                                       | PASS — commit officiel disponible ; run Quality `35214500343` terminé avec succès sur `fac0fc8`, tentative 1 ; aucune CI 2bis-A prétendue                                  |
| Conservation des déplacements                                    | PASS — 12 fichiers identiques à HEAD initial ; trois documents identiques après neutralisation des seules destinations de liens Markdown                                   |
| Doublons                                                         | PASS — aucun contenu identique non intentionnel entre fichiers des références/preuves contrôlés par SHA-256                                                                |
| Templates KB                                                     | PASS — deux IDs distincts, champs requis présents et statut `template` ; contrôle ponctuel, pas de nouveau validateur CI                                                   |
| `pnpm format:check`                                              | PASS après corrections de format des documents nouveaux/modifiables ; premier essai en échec, corrigé sans reformater les preuves figées                                   |
| Index sous `docs/references/`                                    | PASS — Prettier explicite avec `--ignore-path /dev/null` pour l'index de lancement et le nouvel index historique                                                           |
| `pnpm lint`                                                      | PASS — ESLint sans warning                                                                                                                                                 |
| Gitleaks 8.30.1 sur le contenu candidat                          | PASS après traitement du faux positif décrit ci-dessous ; 226 fichiers initiaux, XML/texte des deux DOCX également examinés, puis configuration ajoutée                    |
| Non-régression de l'exception Gitleaks                           | PASS — six cas ponctuels, dont détection d'une autre valeur, du même SHA dans un autre fichier et de secrets synthétiques dans le fichier concerné                         |
| `git diff --check`                                               | PASS                                                                                                                                                                       |
| Tests applicatifs, DB/reset, build, E2E/a11y et release complète | NOT APPLICABLE à ce checkpoint documentaire ; non exécutés, aucune nouvelle preuve métier annoncée                                                                         |

Le scan initial a signalé la ligne 21 de l'attestation : `SECRET_SCAN_SHA` contient le SHA Git public officiel, vérifié auprès de GitHub, pas un secret. `.gitleaks.toml` conserve tous les détecteurs par défaut et ajoute une exception à `generic-api-key` avec condition AND : chemin exact de l'attestation **et** valeur exacte du SHA public. Aucun fichier, commit ou détecteur entier n'est exclu ; l'attestation reste inchangée. La première tentative trop restrictive de configuration continuait à signaler ce SHA ; la configuration finale a été validée par les six cas ci-dessus. Cette correction de configuration du scanner existant est nécessaire pour intégrer les preuves fournies sans casser le contrôle de secrets ; elle ne constitue pas l'implémentation de Security Assurance 2bis-E.

Les scripts de contrôle ponctuels et leurs fichiers synthétiques sont hors dépôt, dans un répertoire temporaire. Aucun secret détecté après qualification du faux positif ; cela ne constitue pas une garantie absolue d'absence de secret. Le scan de l'historique via `pnpm secrets:check` sera vérifié sur le commit local et son résultat fourni avec le SHA de livraison.

## Limites et suite

- Revue et validation explicites de Patrick attendues pour 2bis-A et ADR-008.
- Les fiches KB détaillées et les 15 playbooks complets ne sont pas des livrables réalisés de 2bis-A ; ils seront complétés dans les checkpoints autorisés.
- Les preuves finales Phase 2 sont identifiées par l'attestation/CI ; seuls les trois relevés historiques déjà fournis sont présents dans `raw/`.
- Aucun nouveau package, aucune migration, aucun script métier/qualité ni changement du workflow CI.
- Aucun POM, fixture, tagging, i18n, coverage, snapshot/gate, Semgrep/ZAP, analytics/logger, Quality Center ou scanner d'artefact développé.
- Aucune 2bis-B commencée. Aucune Phase 3 commencée. STOP pour revue Patrick.
