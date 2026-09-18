---
name: i18n
description: "Ajouter textes, formats ou préférences fr-FR/en-GB en conservant SSR, session, focus et fallback."
---

# i18n

## Objectif et déclencheur

Ajouter textes, formats ou préférences fr-FR/en-GB en conservant SSR, session, focus et fallback.

## Préconditions et lectures

Surface existante et sémantique de préférence identifiées ; langue ≠ locale ≠ timezone. Lire les [Rules](../../../AGENTS.md), l’[index courant](../../references/current/ActiCiv_Phase2bis_Launch_Index.md), puis [language-preferences](../../kb/business/language-preferences.md) ; [internationalisation](../../kb/technical/internationalisation.md).

## Impact map

Texte/code stable → catalogues/formats → résolution SSR → cookie/profil/org → DB/RLS → a11y → tests.

## Procédure

1. Lire priorités Citizen/Pro et scope cookies ; aucun préfixe URL sans nouvelle ADR.
2. Ajouter clés sémantiques fr-FR/en-GB sans visible hardcode ; IDs/codes métier restent indépendants. Utiliser Intl pour dates/nombres/relatifs/pluriels.
3. Tester RED fallback et priorités si logique change ; conserver timezone IANA distincte et SSR déterministe sans mismatch hydratation.
4. Pour préférence persistée, vérifier own-profile actif, RLS et audit ; organisation default reste NULL, pas une locale inventée.
5. Tester changement de langue sans perte de session/deep link/focus/formulaire, langues HTML et annonces, puis actualiser KB.

## Tests et preuves

Parité catalogues, formats/locale matching/fallback ; SQL/JWT si DB ; E2E/clavier/axe et lecteur réel si interaction importante.

## Documentation

KB préférences/technique, nouvelles traductions et preuve ; email localization ne doit pas être revendiquée avant implémentation.

## Sécurité et arrêt

Locale cookie non fiable ne donne aucun droit ; STOP si décision de priorité/routing contredite ou traduction sensible non validée.

## Definition of Done

Deux locales fonctionnelles, SSR stable, préférences et accessibilité préservées, preuves adaptées. La [DoD commune](../../quality/definition-of-done.md) reste applicable.

## Erreurs à éviter

Lier timezone à langue, utiliser un label comme code, importer catalogue produit comme oracle E2E.
