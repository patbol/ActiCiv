---
id: technical.internationalisation
domain: internationalisation
type: technical-topic
status: active
roles: [developer, reviewer]
requirements:
  - "Livre v1.4 §51"
  - "Patrick — checkpoint 2bis-C uniquement, §§1–30"
related_adrs: [ADR-004, ADR-007, ADR-010]
related_code:
  - packages/shared/src/locale.ts
  - packages/shared/src/messages/index.ts
  - packages/backend/src/modules/locales/
  - packages/backend/src/platform/locale-preference.ts
  - apps/pro/src/i18n/request.ts
  - apps/citizen/src/i18n/request.ts
  - packages/ui/src/components/locale-selector.tsx
  - supabase/migrations/20260918000100_locales.sql
related_tests:
  - packages/shared/src/locale.test.ts
  - packages/shared/src/messages.test.ts
  - packages/backend/src/modules/locales/application/preferences.test.ts
  - packages/backend/src/modules/locales/application/translations.test.ts
  - packages/backend/integration/locales.integration.ts
  - supabase/tests/phase2bis_locale.sql
  - e2e/locale.spec.ts
related_docs:
  - docs/kb/business/language-preferences.md
  - docs/quality/phase-2bis-c-report.md
---

# Internationalisation et résolution de locale

## Responsabilités et contrat

Le [module pur](../../../packages/shared/src/locale.ts) centralise `fr-FR`, `en-GB`, fallback `fr-FR`, validation exacte des préférences, négociation des variantes fr/en et formats Intl. Citizen : cookie → navigateur → territoire disponible → fallback. Pro : profil → organisation → cookie → navigateur → fallback. La négociation ignore les valeurs malformées/unsupported, respecte qualités et ordre ; `*` n'impose aucune langue. Les defaults DB ne sont jamais déduits des headers.

Les noms d’organisation/service sont des contenus, pas des clés de traduction. Les codes métier restent stables. `referenceLabel` prend traduction demandée puis historique ; les référentiels ne sont pas artificiellement affichés dans un nouveau parcours opérationnel.

## SSR et navigateur

`next-intl` est configuré séparément dans les deux applications, sans routage locale. Les headers/cookies sont lus dans `getRequestConfig`. `currentPreferences` Pro vérifie l’identité puis appelle la projection SQL ; React `cache` est limité à la requête. Aucun cache global utilisateur. Les pages deviennent dynamiques, le proxy Pro rafraîchit Auth sur les surfaces concernées. Le sélecteur ne touche pas aux cookies `sb-*`.

`html.lang` et métadonnées suivent la locale effective. Seuls les messages d’erreur nécessaires sont fournis au provider client ; dialogue et sélecteur reçoivent des props traduites. Ajouter une clé dans les deux catalogues du domaine concerné. Un test vérifie la parité, pas la qualité linguistique humaine.

Le cookie host-only `acticiv-locale` dure un an, HttpOnly, SameSite=Lax, Secure en HTTPS. En local, les ports 3000 et 3001 partagent naturellement les cookies du même hôte. Les préférences professionnelles stockées en DB priment et ne contaminent pas ce cookie à la déconnexion. `POST /api/locale` n'accepte que `{locale}` : `fr-FR`/`en-GB` ; `null` uniquement pour la préférence d'un professionnel actif. Origin doit correspondre à l'application (`CITIZEN_APP_ORIGIN` ou `PRO_APP_ORIGIN`, defaults locaux explicites).

Le refresh conserve URL et saisies ; le focus initial Auth ne dépend plus du texte traduit. Une erreur de sauvegarde conserve la préférence précédente et annonce un échec. La persistance n'est pas déclarée réussie à partir d'une simple sélection locale.

## Architecture, droits et SQL

| Entrée                                           | Application / port                                                            | SQL et garanties                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `POST /api/locale` Pro                           | DTO strict → contexte actif → `setOwnLocale` → `LocalePreferences`            | `set_preferred_locale`, UID Auth uniquement, null = héritage              |
| `POST /api/configuration`, `locale.organization` | contexte admin → `setOrganizationLocale` → `LocalePreferences`                | `set_organization_locale`, tenant réel, CHECK                             |
| `POST /api/configuration`, `translation.hold`    | contexte admin + ownership réel → `saveHoldTranslation` → `TranslationWriter` | `save_reference_translation`, FK motif/tenant                             |
| `POST /api/platform`, `translation.catalog`      | capacité catalogue → `saveCatalogTranslation` → `TranslationWriter`           | RPC vérifie à nouveau `catalog.manage`                                    |
| Config SSR Pro                                   | identité Auth → projection privée                                             | `get_locale_preferences`, seulement deux locales ; settings RLS inchangée |

Les nouvelles tables ont des uniques `(entity_id,locale)` sans dimension nullable. Les traductions de motifs gardent la RLS administrateur des motifs existants. Pas de SELECT settings pour agent/supervisor. Pas de service_role dans ces chemins.

Historique français autoritaire : triggers de synchronisation et de validation empêchent la divergence ; anciens RPC et nouvelle RPC convergent sur ce contrat. L’audit SQL existant englobe préférence + traduction + synchronisation, acteur réel, whitelist, corrélation. Son échec annule la transaction. Logs techniques et analytics restent distincts, aucun événement supplémentaire dans C.

## Migration et exploitation

Migration additive nouvelle uniquement. Les valeurs existantes sont conservées ; backfill français, défaut organisation `fr-FR`, profil NULL. L’anglais synthétique vient du seed. Les données d’un environnement existant sans traduction anglaise utilisent le fallback historique, sans écraser les labels personnalisés.

Ordre : migration → application. Rollback applicatif compatible avec B ; récupération DB par migration corrective et sauvegarde, pas de suppression des données/audits. Reconstruire via `pnpm db:reset`, puis `pnpm db:test` et intégration. La comparaison avant/après upgrade est dans le rapport C.

Les formats de date exigent un IANA explicite ; `Intl` ne modifie jamais le calendrier SLA. Le helper n’utilise pas le fuseau navigateur implicitement. Les dates SLA ne sont pas encore exposées par une nouvelle UI dans C.

## Limites et preuves

Emails Auth encore français : `.Data` ne contient pas la politique profil/organisation et le destinataire de récupération n'est pas le demandeur anonyme. Voir [ADR-010](../../architecture-decisions/010-internationalisation-locales.md) pour le futur traitement serveur et les alternatives rejetées.

[Tests](testing.md) : les scénarios historiques restent en français explicite ; nouveaux E2E fr/en, SSR, isolation entre requêtes, cookies/session, clavier/focus et axe. [Rapport](../../quality/phase-2bis-c-report.md) : résultats réels et statut VoiceOver/TalkBack. Ni couverture instrumentée, snapshot canonique, gates complets ni Phase 3.

Une identité invitée Auth sans profil actif utilise seulement le cookie d’interface, comme le visiteur. Elle ne peut écrire de préférence DB ni obtenir un accès professionnel avant activation.

## Complément E

Le catalogue `dialog` devient une entrée DEMO dédiée, chargée uniquement par le composant de démonstration aliasé au build. Les catalogues common/foundation/auth restent serveur, les politiques de locale et préférences ne changent pas. Le build PROD ne contient ni dialogue ni ses chaînes/CSS.
