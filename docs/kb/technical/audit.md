---
id: technical.audit
title: "Audit SQL autoritaire"
introduced_in: phase-2
domain: observability
type: technical-topic
status: active
roles: [developer, reviewer, operator]
requirements: ["Patrick — checkpoint 2bis-F uniquement"]
related_adrs: [ADR-007, ADR-013]
related_code:
  [
    supabase/migrations/20260916000300_audit.sql,
    supabase/migrations/20260917000100_closure_hardening.sql,
    supabase/migrations/20260918000100_locales.sql,
  ]
related_tests:
  [
    supabase/tests/phase2bis_observability.sql,
    supabase/tests/phase2_closure.sql,
    packages/backend/integration/locales.integration.ts,
  ]
related_docs: [docs/quality/phase-2bis-f-report.md]
---

# Audit SQL autoritaire

L'[ADR-007](../../architecture-decisions/007-transactional-audit.md) reste applicable. F ne crée aucun `audit.record` applicatif : chaque mutation concernée est déjà enregistrée par trigger dans la même transaction. Échec audit = rollback métier. Pas de double écriture, event bus ou transaction séparée. Aucun nouvel événement de sécurité sans mutation justifiant un second writer dans ce checkpoint.

`public.audit_events` : actor_id dérivé de auth.uid(), actor_kind user/system, organization_id, entity_type, entity_id, action INSERT/UPDATE/DELETE, changes old/new whitelistés, occurred_at, transaction_id, correlation_id. Absence d'Auth → acteur system, jamais actor_id fourni par navigateur. Audit append-only (trigger plus permissions), lecture par client_admin de son organisation ou capacité plateforme audit.read, aucune écriture utilisateur. UUID de corrélation ne remplace pas l'acteur réel.

## Registre descriptif des triggers réels

Inventaire lu dans pg_trigger sur base locale migrée. `audit_mutation` AFTER INSERT/UPDATE/DELETE appelle `private.audit_row` ; `private.attach_audit` n'est pas un writer applicatif public. SQL/migrations sont la seule source normative. Les groupes ont une whitelist commune, seules les clés effectivement présentes et modifiées produisent old/new.

| Tables                                                                                        | Whitelist configurée                                                                                                                              |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| organizations, services                                                                       | code,name,status                                                                                                                                  |
| organization_settings                                                                         | timezone,default_locale                                                                                                                           |
| professional_profiles                                                                         | status,preferred_locale                                                                                                                           |
| organization_memberships                                                                      | role,status                                                                                                                                       |
| platform_admins                                                                               | active,capabilities                                                                                                                               |
| service_memberships                                                                           | membership_id,service_id,active                                                                                                                   |
| professional_invitations                                                                      | role,state,expires_at                                                                                                                             |
| invitation_services                                                                           | invitation_id,service_id                                                                                                                          |
| verticals                                                                                     | code,name,active                                                                                                                                  |
| categories                                                                                    | vertical_id,code,name,active,default_priority                                                                                                     |
| organization_categories                                                                       | category_id,active,default_priority                                                                                                               |
| territories                                                                                   | code,name,kind,status,parent_id ; geometry_hash calculé                                                                                           |
| contracts, contract_scopes, contract_scope_categories, contract_scope_services                | reference,status,valid_from,valid_until,plan_code,contract_id,territory_id,scope_id,category_id,service_id                                        |
| service_schedules, service_schedule_versions, service_schedule_days, service_schedule_windows | service_id,schedule_id,version,state,timezone,mode,weekday,is_open,start_second,end_second                                                        |
| hold_reasons, sla_policies, sla_policy_versions, sla_targets, sla_pause_rules                 | service_id,category_id,policy_id,version,state,schedule_version_id,kind,duration_seconds,counting_mode,code,label,active,target_id,hold_reason_id |
| vertical_translations, category_translations, hold_reason_translations                        | vertical_id,category_id,hold_reason_id,locale,label                                                                                               |

Les libellés/code/name/reference métier approuvés restent auditables : on ne change pas le contrat Phase 2 pour prétendre supprimer toute chaîne de caractères. Ils passent par les commandes validées existantes ; aucun payload JSON libre ajouté. Email d'invitation, display_name du profil, tokens, credentials, metadata Auth et géométrie brute sont exclus. Le hash géographique conserve la preuve de changement sans coordonnées exactes.

Tests réels : valeurs sensibles dans des colonnes non whitelistées ne passent pas dans changes ; acteur/corrélation réels ; un changement de préférence produit exactement un audit ; échec forcé audit annule préférence et analytics/log succès ; protections immuables/tenants et reprises invitations conservées. Les logs peuvent expliquer un refus, mais ne remplacent aucune preuve SQL. Pas de purge/rétention nouvelle en F ; politique d'exploitation à valider avant PROD, sans contourner append-only.
