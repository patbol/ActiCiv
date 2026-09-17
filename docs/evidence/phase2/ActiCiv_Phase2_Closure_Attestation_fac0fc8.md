# ActiCiv — attestation finale de preuves de clôture

Date : 17 septembre 2026. Attestation extérieure au dépôt et au commit ; elle complète le postmortem versionné sans le réécrire. La clôture officielle appartient à Patrick.

## Identité du candidat

- PHASE : Phase 2 — Core Data & Security.
- FINAL SHA : `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`.
- BRANCH : `phase-2-core-data-security`.
- REMOTE : `https://github.com/patbol/ActiCiv.git` (public).
- Dépôt local : `/Users/patrickmoreno/ActiCiv/dev/acticiv`.
- RUNTIME : Node `v24.21.0`, pnpm `11.19.0` ; nvm chargé, ICU `78.3`, tz `2026c`.
- Le candidat existant a été conservé sans amend, rebase, squash, force-push ni nouveau commit.

## LOCAL VALIDATION — PASS

Commande : `pnpm release:verify --rebuild-db`. Code de sortie : 0.

```text
DB_RECONSTRUCTED_SHA=fac0fc8663d1f32b09b720fddffd46f0829c8a6a
SECRET_SCAN_SHA=fac0fc8663d1f32b09b720fddffd46f0829c8a6a
LOCAL_VALIDATED_SHA=fac0fc8663d1f32b09b720fddffd46f0829c8a6a
```

Reconstruction sans sauvegarde, démarrage Supabase, application M1–M9, reset et seed réels réussis. Compteurs après seed : 9 migrations, 3 organisations, 9 profils, 6 services, 3 territoires ; PostGIS `3.3.7`.

Format, lint, typecheck, 25 tests unitaires, 84 assertions SQL/pgTAP, 8 intégrations Node (RLS/sécurité/concurrence), 4 intégrations avec vrais adaptateurs, builds Citizen et Pro, contrôle des bundles, 26 tests Playwright/axe réussis. Configuration `retries: 0` ; aucun retry. Audit pnpm : aucune vulnérabilité connue. Gitleaks `8.30.1` : contrôles positif/négatif réussis, historique scanné, aucun secret détecté.

Historique conservé : la tentative précédente a échoué sur le contrôle final de propreté après l'ajout accidentel du livre v1.3 non suivi. Patrick l'a retiré et a confirmé qu'il concernait la suite. La campagne finale a ensuite repris intégralement depuis la reconstruction, sur le même SHA. Cette tentative échouée n'est pas comptée comme PASS.

## GITHUB ACTIONS — PASS

- Workflow : Quality nº 17.
- Workflow run ID : `35214500343`, événement `push`, tentative `1`, conclusion `success`.
- head_sha : `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`.
- Début : `2026-09-17T11:12:49Z`. Dernière mise à jour : `2026-09-17T11:17:55Z`.
- `app` : `success`, job `105179624293`, fin `2026-09-17T11:13:57Z`.
- `database-foundation` : `success`, job `105179624481`, fin `2026-09-17T11:17:54Z`.

Les deux jobs portent le SHA final. `app` exécute `pnpm verify`. `database-foundation` exécute `pnpm release:verify --rebuild-db` et produit les trois mêmes marqueurs SHA, les mêmes compteurs seed, 84 assertions SQL, 8 intégrations Node, 4 intégrations d'adaptateurs et 26 E2E réussis. Audit et Gitleaks réussis. Aucun job ni contrôle obligatoire sauté.

Artefact de journal GitHub : `phase2-closure-fac0fc8663d1f32b09b720fddffd46f0829c8a6a`, ID `10493064317`, 3575 octets, créé `2026-09-17T11:17:27Z`, expiration annoncée `2026-12-16T11:12:49Z`. Digest GitHub : `86f3d35b568f6b326a94a6a023f825e0dac0b4b49d15ce2267d3342c8ce2694e`.

## VOICEOVER — PASS

Contrôle humain effectué et validé par Patrick le 17 septembre 2026, VO-01 à VO-08. macOS `26.3.1` (25D2128), Safari `26.3.1` (21623.2.7.11.7). VO-05/VO-06 puis VO-07 ont été rejoués après leurs corrections. Empreinte Auth/Pro vérifiée inchangée :

`032507437226a9562307c33fc9c8897ea80f0994a3e0d19425ea5e1fea3c5e62`

## TALKBACK — DEFERRED

Environnement compatible non validé. Aucun PASS TalkBack n'est déduit de Chromium mobile ou de VoiceOver.

## ARTIFACT

- Nom : `ActiCiv_Phase2_fac0fc8663d1f32b09b720fddffd46f0829c8a6a.tar.gz`.
- Taille : `1138559` octets.
- SHA-256 : `07f31c4eaa5e1e2ed145436f7bd90ad157228d59aeb1265466426ee115f8cf02`.
- Source git sha : `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`.
- Création : `git archive --format=tar.gz --prefix=acticiv/` sur le SHA explicite, après CI verte.
- Vérification : SHA embarqué extrait avec `git get-tar-commit-id`, inventaire des 202 fichiers comparé à `git ls-tree`, contenu de chacun comparé octet pour octet à `git show <SHA>:<path>`.
- Aucun node_modules, build/cache local, credential de session VoiceOver ou fichier temporaire inclus ; seuls les fichiers suivis du commit sont archivés.

## Immutabilité

WORKING TREE AFTER VALIDATION : CLEAN.

CHANGES AFTER VALIDATION : NONE.

`LOCAL_VALIDATED_SHA == CI head_sha == HEAD == remote branch SHA == archive source SHA`

## Matrice finale complémentaire

| Critère | Statut final | Preuve |
| --- | --- | --- |
| REL-06 | PASS | Validation locale et deux jobs CI réussis sur le même SHA |
| REL-07 | PASS | HEAD inchangé et arbre propre après validation, CI et archive |
| REL-08 | PASS | Archive git du SHA validé, inventaire/contenus et SHA-256 vérifiés |
| DB-36 | PASS | Reconstruction complète CI, neuf migrations, seed et marqueur SHA concordants |
| A11Y-10 | DEFERRED | TalkBack : environnement compatible non validé |

FINAL MATRIX : **260 PASS / 0 FAIL / 1 DEFERRED** (261 critères). Le seul DEFERRED est TalkBack.

## CLOSURE DECISION

**Phase 2 — OFFICIALLY CLOSED by Patrick.**

Baseline officielle pour la Phase 2 bis :

`fac0fc8663d1f32b09b720fddffd46f0829c8a6a`

Aucune Phase 3 commencée au moment de cette clôture.
