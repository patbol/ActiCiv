---
id: technical.logging
title: "Logs structurés"
introduced_in: phase-2bis-f
domain: observability
type: technical-topic
status: active
roles: [developer, reviewer, operator]
requirements: ["Patrick — checkpoint 2bis-F uniquement"]
related_adrs: [ADR-007, ADR-013]
related_code:
  [
    packages/backend/src/platform/logger.ts,
    packages/backend/src/platform/observability.ts,
  ]
related_tests:
  [
    packages/backend/src/platform/logger.test.ts,
    packages/backend/src/platform/observability.test.ts,
    packages/types/src/architecture.test.ts,
  ]
related_docs: [docs/quality/phase-2bis-f-report.md]
---

# Logs structurés

Le [logger](../../../packages/backend/src/platform/logger.ts) expose debug/info/warn/error. Le registre `logCodes` ferme le vocabulaire des diagnostics Auth, invitations, locale, configuration/plateforme et health existants. Les codes de succès sont des codes d'événement, même si le champ stable s'appelle `error_code`. Aucun code construit à partir d'une requête.

Champs : timestamp UTC, level, environment, module, operation, correlation_id, error_code, message technique statique. Metadata : uniquement status HTTP entier 100–599, duration_ms finie positive ou nulle, erreur classifiée. Le serializer ignore toute autre propriété ; aucun spread d'objet externe. UUID validé, environnement/niveau/code par enum. Zéro durée conservé. Les messages d'erreur bruts, stack, email, mot de passe, token, GPS, metadata Auth et objets arbitraires ne sont jamais sérialisés.

Les causes restent exploitables par classifications bornées : Error/TypeError/RangeError/AuthApiError/ZodError/Unknown, codes upstream fermés et au plus deux causes imbriquées. Une cause cyclique ou un getter hostile ne produit pas de boucle ni de message brut. Le diagnostic utilisateur reste traduit et séparé ; les détails restent confidentiels. La cause interne est conservée par l'adaptateur Auth dans `Error.cause`, puis réduite à cette représentation sûre.

Transport serveur : une ligne JSON vers stderr, uniquement depuis la composition `server-only`. Erreur du transport absorbée ; un diagnostic ne doit jamais faire échouer une mutation déjà commise. Ce flux technique ne remplace pas l'[audit SQL](audit.md). Aucun collecteur externe ni politique de rétention plateforme déployée ; l'exploitant doit configurer accès restreint, rotation et durée avant vraie PROD. Les journaux privés locaux restent privés ; seuls rapports qualité minimisés uploadés, avec rétention CI existante 14 jours.

En PROD debug est filtré avant sérialisation ; les health checks émettent uniquement debug pour éviter un log info à chaque probe. Les mutations significatives émettent une ligne de résultat ; invitations peuvent en émettre plusieurs. Pas de modification de l'autorisation ni du message utilisateur. Les logs de refus sont du diagnostic, pas un nouveau registre d'audit des connexions. `console.log/debug/trace` directs restent interdits. Les anciennes routes health qui appelaient console.info/serializeLog sont migrées au contrat commun.

[Port Auth](../../../packages/backend/src/modules/auth/application/observation.ts) indépendant du framework ; `notifyAuth` isole les échecs d'observation de l'opération. Pas de dépendance de domain/application vers le logger concret. La frontière Client Component est protégée par `server-only`, ESLint, tests d'architecture et scan du bundle compilé.
