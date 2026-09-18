# ADR-011 — Preuves qualité, snapshot canonique, baselines et gates

Statut : **proposée pour revue 2bis-D**. Autorisation de Patrick : D uniquement ; A/B/C et ADR-008/009/010 approuvés. Aucune ADR acceptée n’est réécrite.

## Contexte et impact

C est figé au commit `1e067b35a148c6a2da9be3857b1ca4170e91bf60`, parent propre de D. Les commandes existantes validaient des outils distincts sans représentation commune exploitable. Impact : outillage/tests → rapports minimisés → snapshot → évaluateur → documentation/CI. Aucun changement métier, Auth/RBAC/RLS, i18n runtime, audit métier ou schéma DB.

## Décision

Utiliser des fichiers JSON et des artefacts CI, sans base qualité ni endpoint d’ingestion. La CLI locale/CI est le seul producteur de confiance. Elle déduit SHA, état Git, empreinte des sources et versions depuis l’environnement réel ; elle ne prend pas un SHA fourni par navigateur. Une collecte interrompue reste incomplète. Une modification des sources pendant la collecte invalide sa preuve d’intégrité.

Les normalisateurs conservent la sémantique de chaque famille. Vitest et Playwright utilisent leurs rapports JSON natifs ; Node fournit ses événements structurés `node:test` ; pgTAP fournit des assertions TAP et leur plan. Aucun parsing de sortie console ANSI pour remplacer un reporter natif disponible. Builds/format/lint/types/bundles utilisent la fin de processus et son code retour. Les échecs de transport de l’audit ne sont pas des audits sans vulnérabilité.

Le contrat `tooling/quality/model.ts`, validé à l’exécution, définit un snapshot v1 : identité, checks typés, métriques coverage, provenance/digests, références manuelles et gates. Les axes sécurité, DB, builds et a11y sont des checks identifiés, pas des pourcentages JS artificiels. Le futur Quality Center consommera ce même snapshot et les résultats du même évaluateur, sans seconde logique.

Un run finalisé a un répertoire unique, un snapshot et son digest. La création exclusive refuse une collision ; le lecteur vérifie le digest. Modifier une preuve/policy exige un nouveau run. Ce mécanisme détecte les modifications accidentelles ; il ne prétend pas empêcher un administrateur du stockage de falsifier fichiers et digests. La confiance dépend de l’exécution CI et de l’accès restreint aux artefacts.

## Coverage, gates et baseline

`@vitest/coverage-v8` **4.1.11**, exactement aligné sur Vitest installé et son peerDependency, uniquement devDependency. Aucun coût runtime produit. Inclusion explicite des sources packages/apps/tooling/scripts, y compris non importées par les tests. Seuls tests et déclarations `.d.ts` sont exclus ; les configurations hors sources ne sont pas dans le périmètre. JSON complet, résumé JSON, LCOV et résumé humain. La couverture est celle des tests unitaires V8, pas celle des E2E/SQL/adaptateurs exécutés dans d’autres processus.

La policy D est **consultative**, sans seuil coverage/performance, sans auto-acceptation de baseline, sans waiver. Elle réévalue des preuves minimisées ; une preuve requise manquante échoue, une preuve explicitement différée reste DEFERRED. Un PASS après retry, un skip ou un test flaky ne constitue pas un PASS propre. Les exigences E et PROD absentes ne deviennent jamais PASS.

La baseline candidate référence SHA/run/environnement/policy et digest du snapshot. Son acceptation reste une décision humaine tracée ; comparer avec un fichier simplement candidat est refusé. Les deltas observés ne portent pas de verdict de régression sans règle approuvée. Les répétitions de tests critiques sont une commande séparée, jamais des retries ni une compensation d’un échec de campagne principale.

## Alternatives et coûts

- Tables qualité / UI : prématurées ; aucun besoin de requête multi-utilisateur dans D.
- Rapports HTML comme source canonique : difficiles à valider et potentiellement riches en données sensibles.
- Score qualité unique : masque les gates individuellement échouées.
- Seuil aspiratoire de couverture : incite à exclure du code et n’est pas approuvé.
- Remplacer les scripts de release d’un seul coup : risque de perdre des contrôles existants ; ils restent disponibles. L’étape CI consultative rejoue les contrôles, donc augmente le coût temporairement. Une déduplication future devra conserver la même preuve et être revue.

## Sécurité, validation et compatibilité

Les rapports publiables ne contiennent ni variables d’environnement Playwright, ni traces/snapshots DOM, ni messages d’erreur bruts, ni tokens de fixtures. Les logs natifs restent locaux, ignorés par Git et séparés des artefacts uploadés. Les pièces axe contiennent seulement des nombres et IDs de règles. Gitleaks scanne historique et sources candidates, avec sorties expurgées. Les preuves manuelles sont référencées avec leur portée historique, jamais fabriquées à partir d’axe.

Tests comportementaux : absence/corruption/incomplétude, identités discordantes, échecs/skips/retries, collision de run, gates des quatre statuts, baseline absente/non acceptée et comparaison, minimisation des rapports et répétitions. Reconstruction locale existante conservée ; son ancien compteur figé à neuf migrations est remplacé par la comparaison des versions SQL présentes avec celles appliquées, avec régression dédiée.

Pas de migration DB. Retirer l’intégration CI consultative revient au comportement précédent ; conserver les artefacts historiques. Une évolution incompatible du contrat exige une nouvelle version de schéma et un lecteur adapté, sans réécrire les snapshots historiques.

Références : [KB qualité](../kb/technical/quality-engineering.md), [contrat et procédures](../quality/quality-evidence.md), [rapport D](../quality/phase-2bis-d-report.md), [Vitest V4 coverage](https://v4.vitest.dev/config/coverage), [reporters Playwright](https://playwright.dev/docs/test-reporters).

## Décision ultérieure — statut courant

Acceptée explicitement par Patrick à la finalisation D et au lancement de E. Le texte de proposition demeure historique ; aucune décision acceptée n’est réécrite. Voir l’[audit des statuts](README.md).
