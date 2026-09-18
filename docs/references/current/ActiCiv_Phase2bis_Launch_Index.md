# ActiCiv — Phase 2 bis — Launch Documentation Index

Date : 17 septembre 2026

## Current state

- **Phase 2** : CLOSED
- **Accepted Phase 2 baseline SHA** : `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`
- **Final Phase 2 matrix** : 260 PASS / 0 FAIL / 1 DEFERRED (TalkBack only)
- **Current phase** : Phase 2 bis — Engineering Quality, Internationalisation & Knowledge Foundations
- **2bis-A** : CLOSED / APPROVED by Patrick on `be191f56109ea6380ccbd520ed49eb8a6074a9c0`.
- **Active checkpoint** : 2bis-I2 only, explicitly authorized; A–H CLOSED / APPROVED; I1 completed. STOP before I3/Phase 3.
- **Phase 3** : NOT STARTED

## Current authoritative references

Use these documents as the active launch contract, in this order when applicable:

1. Latest decisions explicitly validated by Patrick.
2. [Product/Technical Book v1.4](ActiCiv_Livre_Produit_Technique_v1.4_FINAL_A4.docx).
3. [Phase 2 bis Master Prompt v1.2](ActiCiv_Prompt_Astra_Phase2bis_v1.2_Engineering_Quality_i18n_Knowledge.md), constrained by the explicitly authorized checkpoint.
4. [Exhaustiveness Checklist v1.2](ActiCiv_Phase2bis_Exhaustiveness_Checklist_v1.2.md), cross-checking reference content rather than proving implementation.

The [Phase 2 closure attestation](../../evidence/phase2/ActiCiv_Phase2_Closure_Attestation_fac0fc8.md) establishes the accepted baseline. [Active ADRs](../../architecture-decisions/README.md) preserve the applicable Phase 2 guarantees. [Phase 2 decisions](../historical/ActiCiv_Phase2_Decisions.md) are retained as historical decision provenance, not a competing current development contract. The original source lists in older prompts are read under Patrick's explicit CURRENT / HISTORICAL / EVIDENCE organization and [AGENTS.md](../../../AGENTS.md).

If sources conflict, stop and report the conflict. Do not silently pick one.

## Historical references

Historical material remains valuable evidence and must not be rewritten to pretend it contained later decisions:

- [Historical reference inventory](../historical/README.md): Book v1.1, initial prompt, Phase 1 report, Phase 2 decisions/prompt/proposal/implementation reference.
- [Phase 1 evidence](../../evidence/phase1/README.md) and [Phase 2 evidence](../../evidence/phase2/README.md): postmortems, attestation and raw records.
- ADR 001–007 retain their existing accepted/applicable status; they are not superseded merely by age.
- Book v1.2/v1.3 and earlier Phase 2 bis packs are not present in this repository; no nonexistent archive is claimed.

Historical references must be clearly labelled as historical in repository indexes.

## Launch corrections included in this pack

- old current-reference mentions of Product Book v1.3 corrected to v1.4;
- old current-reference mention of Phase 2 bis Prompt v1.1 corrected to v1.2;
- official Phase 2 bis name aligned everywhere;
- Phase 2 status and accepted SHA explicitly recorded;
- historical postmortem kept immutable, complemented by a separate closure attestation;
- controlled implementation checkpoints 2bis-A through 2bis-I recorded in the Master Prompt;
- coverage/performance thresholds explicitly require measurement before approval/blocking;
- production test-hook policy clarified: semantic locators first, retained production hooks require an explicit reviewed purpose;
- console policy clarified: log/debug/trace forbidden in production application code; warn/error normally go through structured logging, with narrow documented low-level exceptions only.

## First authorized implementation checkpoint — historical launch scope

**2bis-A — Documentation baseline & governance only.**

Before technical checkpoint 2bis-B:

- create the Phase 2 bis branch from the accepted SHA;
- integrate the authoritative documents cleanly;
- preserve historical references;
- repair repository-local relative links/indexes;
- update root README/docs index so Phase 2 is CLOSED and Phase 2 bis is CURRENT;
- create the initial `AGENTS.md`, proportional DoD/PR/traceability foundations, and KB/ADR/Skills structure;
- return the repository to a clean working tree;
- stop for Patrick review if requested.

No Phase 3 behavior is authorized.

## Previous authorization — 2bis-B

Patrick approved 2bis-A and explicitly authorized POM/Component Objects, reusable fixtures, test metadata and the first executable conventions without product changes. See [E2E conventions ADR](../../architecture-decisions/009-e2e-conventions.md), [testing KB](../../kb/technical/testing.md) and [checkpoint report](../../quality/phase-2bis-b-report.md). This historical authorization was limited to B.

## 2bis-A documentary correction record

The remaining v1.3 mention in Master Prompt §56 is corrected to v1.4. The current source index is aligned with Patrick's approved directory roles. Historical matrices remain unchanged; only broken Markdown destinations caused by relocation are repaired. The detailed [checkpoint report](../../quality/phase-2bis-a-report.md) records changes and actual checks. This does not implement any later checkpoint.

## Historical authorization — 2bis-C

Patrick approved B and ADR-008/009, then explicitly authorized internationalisation, locale preferences and reference translations only. See [ADR-010](../../architecture-decisions/010-internationalisation-locales.md), [KB](../../kb/technical/internationalisation.md) and [C report](../../quality/phase-2bis-c-report.md). STOP before D; no Phase 3.

## Décision ultérieure — checkpoint 2bis-D

Patrick approuve A/B/C et ADR-008/009/010, puis autorise uniquement D : coverage, rapports structurés, snapshot canonique et gates consultatives. C est figé au commit `1e067b35a148c6a2da9be3857b1ca4170e91bf60`. L’instruction récente prime sur le statut C encore présent dans AGENTS ; aucune nouvelle règle persistante n’y est introduite dans D. Aucun E ni Phase 3 autorisé. [Procédures D](../../quality/quality-evidence.md), [rapport D](../../quality/phase-2bis-d-report.md).

## Décision précédente — checkpoint 2bis-E uniquement

Patrick approuve A/B/C/D et ADR-008 à 011. Baseline D : `ced9d07e7f929c8dfdfff236f95c8b6300d6503d`, CI [35285715652](https://github.com/patbol/ActiCiv/actions/runs/35285715652) verte. E autorise sécurité/artefacts/performance uniquement ; les sections précédentes décrivent les autorisations historiques. Aucune acceptation automatique de seuil coverage/performance ni de risque. [Rapport E](../../quality/phase-2bis-e-report.md). STOP avant F ; Phase 3 NOT STARTED.

## Décision précédente — checkpoint 2bis-F uniquement

Patrick approuve A–E et ADR-008 à 012. Baseline E `70e145da43d246a0452b371dd4da7cf12e0078b3`, branche `phase-2bis-engineering-foundations`. F autorise la séparation Analytics/Audit/Logs, registre analytics no-op/local, logger structuré, corrélation et anti-PII, préservation SQL transactionnelle, documentation et tests. Aucun vendor SaaS, Quality Center, chantier G complet ni Phase 3. [Rapport F](../../quality/phase-2bis-f-report.md), [ADR-013](../../architecture-decisions/013-observability-separation.md). STOP pour revue Patrick. Aucun seuil numérique coverage/performance accepté automatiquement.

## Décision historique — checkpoint 2bis-G uniquement

Patrick approuve A–F et ADR-008 à 013 ; baseline F `ebab16c5c5c3133dda5afa5061263da5c3bcf25e`. G autorise KB, quinze Skills, gouvernance, validateurs et traçabilité. Aucun comportement métier/DB/UI nouveau, H/Quality Center/Phase 3 non commencés. [Rapport G](../../quality/phase-2bis-g-report.md), [ADR-014 proposée](../../architecture-decisions/014-knowledge-skills-governance.md).

Audit éditorial G : le livre courant a une couverture et une conclusion v1.4, mais la cellule Version du tableau initial conserve « 1.3 ». La référence autoritaire reste v1.4 selon Patrick et le contenu courant ; ce résidu éditorial ne réactive pas v1.3. Le fichier Word fourni est conservé sans réécriture ; correction éditoriale du livre signalée pour sa prochaine édition. Aucune règle produit contradictoire n’est arbitrée par cette observation.

## Finalisation G autorisée

Patrick approuve l’architecture G et ADR-014 et demande commit propre, preuves locales, push, CI réellement observée et artefacts vérifiés au même SHA. La clôture attend ces résultats ; aucune autorisation de H/Quality Center/Phase 3. Les mesures de revue dirty restent historiques, distinctes du candidat final.

## Décision historique — 2bis-H uniquement

Patrick approuve G/ADR-014 sur `11d6f94d4f4a7790bd22588847b0bb8aecd1703e` et autorise le Quality Center read-only. [Rapport H](../../quality/phase-2bis-h-report.md), [ADR-015 proposée](../../architecture-decisions/015-quality-center.md). Aucun I ni Phase 3.

## Finalisation H autorisée le 18 septembre 2026

Patrick approuve l’architecture H et ADR-015, et confirme VoiceOver H-VO-01 à H-VO-09 comme preuve manuelle distincte. Finalisation autorisée : commit propre, reconstruction DB incluant M12 et seed, validations complètes, snapshot local/CI au même SHA, push sans réécriture et vérification des artefacts téléchargés. La policy `2bis-G.v1` reste applicable : H consomme le schéma et les gates existants, sans nouveau seuil ni règle ; la collecte inclut explicitement la reconstruction DB. Aucun code UI modifié après la validation VoiceOver. STOP pour validation finale de Patrick ; aucun 2bis-I ni Phase 3.

## Décision courante — 2bis-I2 uniquement

Patrick a clôturé A–H et approuvé ADR-008 à 015. Baseline H : `615e59b327ade189d94598b6d35533e689493309`. I1 terminé, six écarts P1 à corriger uniquement en I2. Les limites et résultats sont dans le [rapport I2](../../quality/phase-2bis-i2-report.md). Aucun I3 ni Phase 3 autorisé. Les statuts de revue des rapports historiques ne sont pas réécrits.
