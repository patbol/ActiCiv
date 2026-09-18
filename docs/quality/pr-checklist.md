# Checklist PR / changement

Modèle à copier dans la description de PR ou dans le bilan local si aucune PR n'est ouverte. Il n'ajoute pas de template concurrent hors `/docs` ni d'automatisation GitHub en 2bis-A. Pour un changement trivial, regrouper les dimensions non applicables ; ne pas remplir un formulaire disproportionné.

## Problème et résultat

- Référence du besoin, phase/checkpoint autorisé et critères d'acceptation.
- Comportement avant/après ou résultat documentaire ; périmètre et risque faible/moyen/élevé.
- [Impact map](traceability.md) pour tout comportement existant modifié.

## Revue proportionnée

- [ ] Critères d'acceptation satisfaits, aucun changement hors scope.
- [ ] Tests ajoutés/modifiés listés ; Red/Green pour logique critique ou bug reproductible, sinon justification.
- [ ] Non-régressions préservées ; tags/routes/composants concernés identifiés une fois la taxonomie installée.
- [ ] Impact coverage explicite ; seuils approuvés seulement après mesure.
- [ ] Droits, Auth, tenant, RLS/grants et secrets examinés.
- [ ] Impact a11y/i18n traité ; preuves manuelles si nécessaires.
- [ ] Analytics, audit atomique/corrélation et logs traités séparément, ou N/A justifié.
- [ ] Migration/contraintes/seeds/reconstruction/reprise traités si applicable.
- [ ] KB, documentation technique, ADR et liens actualisés dans ce même changement.
- [ ] Dépendance significative justifiée : alternatives, client/serveur, coût, maintenance/sécurité.
- [ ] Conventions exécutables/gates applicables exécutées ; aucun contrôle futur présenté comme existant.
- [ ] Preuves : commandes, résultats, SHA/contexte, CI observée si requise ; captures uniquement utiles et expurgées.
- [ ] `git diff` revu, `git diff --check` propre ; modifications utilisateur conservées.

## Conclusion

Lister les limites, DEFERRED justifiés, questions réellement ouvertes et éventuelles exceptions avec responsable/échéance/périmètre. Une exception ne permet pas de cacher un FAIL critique.

Indiquer READY FOR PATRICK REVIEW ou NOT READY. La revue de ce checkpoint ne vaut pas validation automatique du suivant. Voir la [DoD](definition-of-done.md).

## Contrôle documentaire G

- [ ] IDs KB affectés identifiés dans l’impact map ; changement comportement/droit/DB/API/audit/analytics/logs/architecture documenté dans la même PR.
- [ ] `pnpm docs:generate` puis `pnpm docs:validate` satisfaits ; liens, ADR, code/tests et Skills concernés relus.
- [ ] Sources historiques étiquetées, aucune fonctionnalité future active, aucune preuve réécrite.
- [ ] Contradiction code/KB/ADR signalée avant changement ; absence de contradiction non inférée d’un validateur syntaxique.
