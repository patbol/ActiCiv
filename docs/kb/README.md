# Knowledge Base ActiCiv

La KB décrit les comportements et fondations réellement présents. Elle est une entrée de travail pour produit, QA, développeurs et agents ; les preuves datées demeurent dans leurs dossiers.

- [Métier](business/README.md) : acteurs, droits, règles, erreurs et effets.
- [Technique](technical/README.md) : frontières, données et exploitation.
- [Traçabilité générée](traceability.md) : exigences/rôles → KB → ADR → code → tests → observabilité, et retour ADR → KB.
- [Contrat du validateur](technical/knowledge-governance.md) et [politique](../quality/documentation-policy.md).
- [Modèle métier](templates/business-feature.md) ; [modèle technique](templates/technical-topic.md).
- [Skills](../skills/README.md) : procédures réutilisables.

Lire [AGENTS](../../AGENTS.md), les [sources courantes](../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis les fiches/ADR liées avant modification. Contradiction : STOP. Ni la présence d’un test dans les métadonnées, ni un statut active ne signifie test exécuté avec succès.

`pnpm docs:generate` actualise la vue dérivée ; `pnpm docs:validate` contrôle le contrat. Une seule matrice de liens, sans duplication manuelle. 2bis-G est en revue ; H et Phase 3 non commencés.
