# Phase 2 — CLOSED

Baseline officielle : `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`. Clôture explicitement validée par Patrick. Matrice finale : **260 PASS / 0 FAIL / 1 DEFERRED**, TalkBack uniquement.

## Ordre de lecture

1. [Attestation finale](ActiCiv_Phase2_Closure_Attestation_fac0fc8.md) : SHA, validations locale/CI, archive et décision de clôture.
2. [Postmortem renforcé historique](ActiCiv_Phase2_Postmortem_HISTORICAL.md) : 256 PASS / 0 FAIL / 5 DEFERRED au moment de sa rédaction. Quatre preuves ultérieures sont apportées par l'attestation ; ne pas réécrire cette matrice.
3. [Premier audit e389396](ActiCiv_Phase2_Postmortem_Audit_e389396.md) : état initial distinct, avec défauts ensuite corrigés.
4. [Protocole VoiceOver](ActiCiv_Phase2_VoiceOver.md) : parcours réellement validés par Patrick, résultat final dans l'attestation.

## Preuves disponibles et limites de conservation

- [Runtime de l'audit initial](raw/phase2-audit-runtime.txt).
- [Métadonnées DB initiales](raw/phase2-database-metadata.txt).
- [Journal de validation e389396](raw/phase2-e389396-release-verify.log).
- [Workflow Quality nº 17](https://github.com/patbol/ActiCiv/actions/runs/35214500343), SHA final : jobs `app` et `database-foundation` réussis, selon l'attestation et la vérification distante de l'audit de lancement.

Les trois fichiers `raw/` ci-dessus appartiennent à l'audit initial, pas au journal final fac0fc8. L'attestation identifie le journal final GitHub (artefact `10493064317`) et l'archive source par nom/empreinte ; ces binaires/journaux finaux ne sont pas inclus dans ce dossier. Ne pas fabriquer de lien local vers un fichier absent ni assimiler le journal e389396 à la preuve fac0fc8. Les originaux sources sont accessibles par le [commit officiel](https://github.com/patbol/ActiCiv/tree/fac0fc8663d1f32b09b720fddffd46f0829c8a6a).

## Conservation

Les fichiers déplacés manuellement ont été comparés à la baseline. Seules les destinations Markdown cassées des postmortems sont réparées en 2bis-A ; conclusions, matrices et preuves brutes restent historiques. Voir le [bilan de rangement et gouvernance](../../quality/phase-2bis-a-report.md).

La [référence d'implémentation](../../references/historical/ActiCiv_Phase2_Implementation_Reference_HISTORICAL.md) conserve l'état technique Phase 2 ; les [ADR actives](../../architecture-decisions/README.md) portent ses garanties persistantes. Aucun redémarrage de Phase 2 ni début Phase 3 n'est induit par ce rangement.
