---
id: technical.analytics
domain: observability
type: technical-topic
status: active
roles: [developer, reviewer, operator]
requirements: ["Patrick — checkpoint 2bis-F uniquement"]
related_adrs: [ADR-007, ADR-013]
related_code:
  [
    packages/backend/src/platform/analytics.ts,
    packages/backend/src/platform/telemetry.ts,
  ]
related_tests:
  [
    packages/backend/src/platform/observability.test.ts,
    packages/backend/integration/locales.integration.ts,
  ]
related_docs: [docs/quality/phase-2bis-f-report.md]
---

# Analytics minimal

`analytics.track(name, properties)` valide le [registre typé canonique](../../../packages/backend/src/platform/analytics.ts), puis appelle un port `emit`. Taxonomie `<surface>_<domain>_<action>`. Chaque définition porte surface/domain/owner, description, propriétés enum exactes, consent_class et statut instrumented. Événement inconnu, propriété absente/supplémentaire ou valeur hors enum : rejet sans payload dans l'erreur. Aucun événement Phase 3.

| Événement réel              | Propriétés autorisées                                           | Déclencheur serveur                                               |
| --------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| pro_auth_login_succeeded    | source=password                                                 | signIn terminé ; aucune preuve d'accès métier                     |
| pro_auth_login_failed       | source=password                                                 | validation/connexion refusée ; aucune information sur le compte   |
| pro_auth_recovery_requested | source=recovery-form                                            | demande Auth terminée ; n'affirme ni compte existant ni livraison |
| pro_auth_password_updated   | source=password-form                                            | mot de passe effectivement modifié, invitation ou récupération    |
| pro_auth_logout             | source=action                                                   | déconnexion terminée                                              |
| pro_locale_changed          | locale=fr-FR/en-GB/organization-default ; source=profile/cookie | RPC profil réussie ou cookie enregistré                           |
| citizen_locale_changed      | locale=fr-FR/en-GB ; source=cookie                              | cookie enregistré                                                 |

Cette table décrit le code ; elle ne constitue pas un deuxième schéma de validation. Le registre code et les tests font autorité. L'enveloppe ajoute seulement event/surface/version=1. Ni timestamp, ni user/tenant ID, ni correlation_id, ni rôle individuel, email, nom, secret, texte libre, coordonnées ou contenu d'audit. Aucun identifiant organisationnel grossier jugé nécessaire. Pas d'analytics supplémentaires pour les mutations d'administration dans F.

## Environnements et privacy

Par défaut, émission désactivée. `ACTICIV_ANALYTICS_MODE=local` active exclusivement un tampon mémoire serveur en DEV, TEST ou DEMO (`ACTICIV_BUILD_TARGET=demo`). La cible PROD force la désactivation même si la variable local est présente. Le tampon conserve au maximum 100 événements, renvoie des copies et peut être vidé ; il disparaît avec le processus. Aucun fichier, cookie analytics, endpoint d'ingestion/consultation, SDK client, réseau ou SaaS. L'adaptateur no-op et le défaut désactivé sont distincts. Une panne du provider est absorbée (`dropped`), jamais transformée en échec métier.

Le port prépare un futur provider et l'option enabled permet l'arrêt de l'émission ; aucune conformité au consentement n'est prétendue. Tout provider futur nécessite revue finalité, base juridique/consentement applicable, localisation, durée, sécurité et activation par environnement avant déploiement. Pas de bannière sans provider activé ; pas de contrat public de collecte PROD aujourd'hui. Les appels directs gtag/dataLayer/vendors sont interdits par ESLint ; aucun adaptateur vendor autorisé dans F.

Instrumentation via [port Auth](../../../packages/backend/src/modules/auth/application/observation.ts), [composition](../../../packages/backend/src/platform/telemetry.ts) et entrypoints existants. Aucune collecte depuis un Client Component ; aucun texte utilisateur changé. Voir [ADR-013](../../architecture-decisions/013-observability-separation.md) et [corrélation](correlation-errors.md).
