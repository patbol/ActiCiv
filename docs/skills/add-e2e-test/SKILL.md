---
name: add-e2e-test
description: "Ajouter un scénario Playwright d’un parcours existant avec objets réutilisables, isolation, tags et locators accessibles."
---

# add-e2e-test

## Objectif et déclencheur

Ajouter un scénario Playwright d’un parcours existant avec objets réutilisables, isolation, tags et locators accessibles.

## Préconditions et lectures

Le parcours existe et la suite DEMO ou PROD est choisie explicitement ; aucune nouvelle UI pour fabriquer un test. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [testing](../../kb/technical/testing.md) ; [internationalisation](../../kb/technical/internationalisation.md).

## Impact map

Parcours → route/composant → acteurs/fixtures → POM → assertions → criticité → axe/i18n → preuves.

## Procédure

1. Lire la spec voisine, pages/components et fixtures ; réutiliser sans God Object ni base class artificielle.
2. Placer mécanique réutilisable dans fixture, action/locator dans POM, scénario et assertions métier dans la spec.
3. Choisir getByRole puis getByLabel puis texte sémantique ; hook seulement si nécessaire et justifié. Ne pas importer les traductions app comme oracle.
4. Déclarer exactement une criticité statique par test, route/composant dans la suite et tags type pertinents.
5. Isoler identité/données à portée test ; lancer lint, listing puis campagne ciblée sans retries, ensuite suite applicable.

## Tests et preuves

Assertion nominale et échec utile ; axe/clavier sur parcours concerné. Pas de test.only, skip/fixme ni waitForTimeout arbitraire.

## Documentation

KB testing seulement si convention change ; KB feature relie le nouveau test. Captures/traces privées minimisées.

## Sécurité et arrêt

Fixture privilégiée côté Node local, jamais navigateur ; ne pas faire tourner deux campagnes mutantes sur la même DB. STOP si données réelles/cible non autorisées.

## Definition of Done

Test stable retries=0, tags valides, assertions lisibles et données isolées ; preuve DEMO/PROD explicitée. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Masquer une assertion dans POM, partager storageState mutable, considérer retry vert comme release PASS.
