# ADR-013 — Separation of Analytics, Audit and Logs

Statut : **proposée pour revue 2bis-F**. Autorisation Patrick : E et ADR-008 à 012 approuvés, baseline `70e145da43d246a0452b371dd4da7cf12e0078b3`. Complète ADR-001/007/011/012 sans les superséder.

## Contexte

L'audit SQL est déjà transactionnel/corrélé ; le logger minimal ne couvre que health. F doit fournir diagnostics et analytics minimales sur les parcours existants, sans nouvelle vérité métier, PII, fournisseur ou interface Quality Center.

## Décision

Trois responsabilités séparées. Analytics = usage minimisé, registre typé/whitelist d'enums, port emit, no-op ou tampon local borné, off par défaut et forcé off sur cible PROD. Audit = triggers SQL existants, acteur serveur et rollback atomique. Logs = JSON serveur avec codes fixes, safe metadata et causes classifiées ; transport stderr isolé, debug filtré en PROD. Aucune duplication d'audit applicatif.

Composition server-only dans platform ; port Auth pur dans application, domaine inchangé. Locale/configuration/plateforme sont instrumentées depuis leurs entrypoints/composition existants, sans couches vides. Pas de provider client. Frontières vérifiées par ESLint, tests d'architecture et builds/scans.

Corrélation explicite par commande et fermetures locales, persistée pour invitations. Projection DB readonly propriétaire uniquement pour reprendre la corrélation à l'acceptation ; invariant d'acceptation toujours vérifié SQL. Le résumé HTTP d'une reprise d'invitation utilise le contexte persisté. Aucun request_id ni AsyncLocalStorage faute de besoin indépendant démontré. Analytics n'embarque pas ce UUID.

## Alternatives

Pino/Winston, OpenTelemetry/SaaS : coût/dépendance sans besoin actuel. Logger libre ou spread de payload : risque de PII. Writer audit TypeScript après transaction : casse atomicité et crée doublons. Réutiliser les logs comme analytics/audit : responsabilités et rétention incompatibles. Corrélation implicite ALS : complexité inutile dans ce monolithe ; paramètres explicites suffisants. Modifier la signature d'une ancienne RPC publiée : projection additive conserve compatibilité E.

## Sécurité, consentement et erreurs

Aucune donnée personnelle, tracking, secret, stack ou texte libre dans analytics. Erreurs techniques classifiées, message utilisateur traduit séparé, UUID retourné en en-tête sur mutations API. Une corrélation n'accorde aucun droit. La projection n'autorise que l'invité propriétaire sent non expiré, sans ouvrir de données organisationnelles. Aucun nouveau rôle ni service_role dans le chemin ordinaire.

Consentement : l'abstraction peut désactiver l'émission ; pas de prétention juridique ni bannière sans provider. Toute future activation PROD exige décision privacy/consent/config/rétention. Le tampon local n'est pas une conservation durable. Les logs stdout/stderr demandent gestion d'accès/rétention par l'opérateur ; cela n'est pas un SaaS déployé.

## Tests et quality evidence

Tests RED puis GREEN : registre/propriétés/PII, serializer/désactivation/provider défaillant, frontière client, contexte d'acceptation, projection SQL et preuve qualité absente. Intégration réelle Auth/Supabase : panne/reprise/bind/acceptance, corrélation unique, audit unique et rollback. E2E HTTP prouve UUID serveur malgré un header forgé. Tests historiques conservés, retries=0.

Même snapshot v1 D/E enrichi d'un check observability dérivé des suites unitaires, avec provenance du rapport ; audit/SQL/adaptateurs restent des gates distinctes obligatoires. Policy F advisory, anciennes D/E conservées et relisibles ; aucun nombre d'événements ou seuil numérique érigé en gate. Les titres de tests ne doivent pas interpoler les fixtures sensibles.

## Migration, conséquences et limites

Projection additive `pending_invitation_context` déployée avant code F ; aucune donnée/migration publiée modifiée. Retour E compatible en conservant cette projection ; détails de récupération dans KB. Pas de dépendance ajoutée ; zéro appel réseau analytics et aucun SDK navigateur. Tampon borné, sérialisation synchrone réduite ; mesurer compilé et volume représentatif. Logs/analytics non durables et non garantis : ils ne sont pas un audit.

F ne construit ni Quality Center, ni playbooks complets G, ni fonctionnalité Phase 3. Les questions de collecteur, rétention PROD et instrumentation DB restent hors preuve actuelle.

## Références

[Analytics](../kb/technical/analytics.md), [audit](../kb/technical/audit.md), [logging](../kb/technical/logging.md), [corrélation/erreurs](../kb/technical/correlation-errors.md), [rapport F](../quality/phase-2bis-f-report.md). Code et tests sont reliés depuis ces KB.
