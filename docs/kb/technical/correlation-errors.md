---
id: technical.correlation-errors
title: "Corrélation et gestion des erreurs"
introduced_in: phase-2bis-f
domain: observability
type: technical-topic
status: active
roles: [developer, reviewer, operator]
requirements: ["Patrick — checkpoint 2bis-F uniquement"]
related_adrs: [ADR-007, ADR-013]
related_code:
  [
    packages/backend/src/platform/correlation.ts,
    packages/backend/src/platform/telemetry.ts,
    supabase/migrations/20260918000200_observability_context.sql,
  ]
related_tests:
  [
    packages/backend/src/modules/auth/application/session.test.ts,
    packages/backend/integration/invitations.integration.ts,
    e2e/locale.spec.ts,
  ]
related_docs: [docs/quality/phase-2bis-f-report.md]
---

# Corrélation et gestion des erreurs

Un contexte explicite immuable `{correlationId}` est créé par `crypto.randomUUID()` à chaque commande/action HTTP. Les en-têtes du navigateur ne sont pas adoptés. Le client Supabase serveur transmet ce contexte dans `x-acticiv-command-id` ; la fonction SQL `private.command_correlation()` existante le propage à l'audit transactionnel. Il ne donne jamais de droit. Un accès direct authentifié à PostgREST peut déjà fournir un UUID de corrélation ; la sécurité vient toujours de Auth/RLS/ownership, jamais de cet identifiant.

Chaîne : entrypoint → use case via port Auth (si utile) → adaptateur Supabase configuré → transaction audit → observateur/log. Pas d'AsyncLocalStorage : paramètres et fermeture locale suffisent ; pas de `request_id`, faute de consommateur justifiant un second identifiant. Ne pas ajouter correlation_id à analytics.

## Invitation multi-étapes

Réservation : corrélation persistée dans `professional_invitations`. Envoi/reprise et bind utilisent cette corrélation, même si la nouvelle requête a un autre UUID. L'observateur reprend le contexte persisté et le résumé HTTP configuration utilise ce contexte de commande. À l'acceptation, `pending_invitation_context()` lit seulement id/correlation_id des invitations sent non expirées de l'identité Auth courante ; aucune possibilité de cibler un autre user. Le cas d'usage et l'adaptateur appellent toujours `accept_invitation` qui revérifie tous les droits/états et reprend lui-même la corrélation côté SQL. Une projection ne confère aucun accès professionnel à une identité Auth seule.

Les diagnostics provider_failed/bind_failed/sent/accepted partagent le même UUID ; les tests réels prouvent panne, reprise et acceptation, sans email/name/user_id dans logs/analytics. Avant d'avoir trouvé une invitation unique, un refus utilise le contexte de la requête courante. Les actions login/recovery/password sont des commandes Auth autonomes ; aucun lien individuel n'est ajouté pour les corréler artificiellement à analytics.

## Migration et récupération

Migration additive `20260918000200_observability_context.sql` : projection SQL STABLE SECURITY DEFINER, search_path vide, prédicat auth.uid(), droits retirés à public/anon, EXECUTE pour authenticated seulement. Ancienne RPC pending_invitation conservée, aucun trigger/colonne/audit modifié, aucun backfill. Appliquer avant le serveur F. Retour applicatif vers E possible en laissant cette fonction sans usage ; suppression éventuelle seulement par migration ultérieure après retour de tous les clients F. Aucun rollback de données auditées. Reconstruction DB/seed et tests SQL requis.

Les réponses des mutations locale/configuration/platform portent X-Correlation-ID ; corps d'erreur existant inchangé, aucune stack/cause exposée. La corrélation n'est pas placée dans une URL ou un message Auth. Les callbacks/confirmations échoués ont un code interne sûr ; pas de nouveau flux métier d'erreur. Voir [ADR-013](../../architecture-decisions/013-observability-separation.md).
