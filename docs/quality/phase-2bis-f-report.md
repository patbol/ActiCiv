# Checkpoint 2bis-F — Analytics / Audit / Logs

Candidat pour revue Patrick, sans acceptation automatique. F uniquement ; les preuves sur SHA propre et CI sont produites après ce gel documentaire et rattachées au commit dans l'attestation de validation. Une passe de développement ne constitue pas une identité de release.

## 1–3. Baseline, Git et dépendances

HEAD initial réellement vérifié : `70e145da43d246a0452b371dd4da7cf12e0078b3`, branche `phase-2bis-engineering-foundations`, dépôt `/Users/patrickmoreno/ActiCiv/dev/acticiv`, origin `https://github.com/patbol/ActiCiv.git`. Arbre initial propre, diff et diff --check vides. E/ADR-008 à 012 approuvés explicitement par Patrick. Phase 2 reste CLOSED sur `fac0fc8663d1f32b09b720fddffd46f0829c8a6a`.

Runtime chargé avec nvm dans chaque shell : Node 24.21.0 / pnpm 11.19.0. Aucune dépendance ajoutée, aucun lockfile changé. Export serveur `@acticiv/backend/observability` ajouté au package existant. Aucun framework d'observabilité.

## 4–8. Architecture, taxonomie, registre, événements et privacy

[ADR-013](../architecture-decisions/013-observability-separation.md) proposée : **Analytics, Audit and Logs are separated by design**. Domaine inchangé. Port Auth pur dans application, implémentation/registre/logger dans platform, composition server-only, instrumentation des entrypoints Auth/locale/configuration/platform et migration des anciens logs health. Aucun dossier/couche vide.

[Registre analytics](../../packages/backend/src/platform/analytics.ts) canonique typé et validé à l'exécution ; taxonomy `<surface>_<domain>_<action>`, owner/domain, description, enum des propriétés, consent_class, implementation_status. Sept événements réellement reliés au code : pro_auth_login_succeeded, pro_auth_login_failed, pro_auth_recovery_requested, pro_auth_password_updated, pro_auth_logout, pro_locale_changed, citizen_locale_changed. Recovery signifie demande acceptée, pas livraison ou compte existant. Login Auth ne prouve pas l'accès professionnel. Aucun événement Phase 3 ni administration artificiellement instrumentée.

[KB Analytics](../kb/technical/analytics.md) décrit les propriétés exactes. Sans email/name/password/token/texte libre/GPS/user_id/auth.uid/correlation_id/contenu d'audit. Désactivé par défaut, mode local explicite hors PROD, tampon serveur 100 événements maximum, copies isolées et clear ; no-op disponible. PROD force off, y compris si une configuration local est présente. Aucun cookie analytics, réseau, SDK navigateur, endpoint de collecte ou SaaS. Provider défaillant isolé. Consentement futur préparé par port et switch, aucune conformité ni bannière fabriquée.

## 9–10. Audit préservé, aucun nouveau writer

[KB Audit](../kb/technical/audit.md) inventorie les 29 triggers réels et les whitelists lues dans pg_trigger. SQL reste autoritaire : actor serveur, append-only, lecture RLS, old/new whitelistés, transaction_id/correlation_id, rollback si audit échoue. Aucun audit applicatif dupliqué ni `audit.record` public. Aucune nouvelle action de sécurité sans mutation jugée nécessaire en F.

Les libellés métier autorisés restent auditables ; ni email d'invitation, display_name, metadata Auth, secrets, ni géométrie brute ne sont ajoutés. Tests négatifs sur colonnes sensibles non whitelistées, audit unique, acteur réel, rollback et non émission de succès en cas d'échec transactionnel. Toutes les garanties Phase 2 restent testées.

## 11–12. Logger et serialization

[Logger](../kb/technical/logging.md) : debug/info/warn/error, timestamp UTC, environnement, module, opération, code/message statiques, correlation_id. Whitelist metadata : status HTTP, duration_ms, causes classifiées bornées. Aucune sérialisation de payload externe, raw message/stack, secrets ou metadata Auth. Codes upstream par whitelist ; causes au maximum deux niveaux. Transport stderr serveur, échec transport absorbé. Debug filtré PROD ; health uniquement debug évite du bruit sur chaque probe.

Frontière Client Component : server-only plus garde ESLint/tests et scan compilé. Conventions vendor direct/console existantes conservées. Le serializer minimal précédemment appelé par health a été migré avec ses appelants ; tests historiques de champs sûrs conservés et adaptés au nouveau contrat.

## 13–15. Corrélation, request_id, erreurs et migration

[KB Corrélation/erreurs](../kb/technical/correlation-errors.md). UUID serveur explicite par commande, ignoré s'il vient du navigateur ; même client Supabase transmet à SQL et aux diagnostics. Invitation multi-étapes : contexte persisté repris pour provider/bind/reprise/acceptation ; résumé HTTP configuration et logs d'invitation partagent cette corrélation. Pas d'AsyncLocalStorage, pas de request_id supplémentaire faute de besoin réel. Analytics sans corrélation.

Migration additive `20260918000200_observability_context.sql` : RPC readonly id/correlation_id de l'invité courant, sent et non expirée ; SECURITY DEFINER/search_path vide/grants minimaux/auth.uid. Aucune migration publiée éditée, aucun schéma d'audit/triggers modifié, aucun backfill. À appliquer avant serveur F ; retour E compatible en conservant la projection sans usage. La RPC accept_invitation conserve tous ses contrôles ; Auth seule n'accorde aucun accès métier.

Codes techniques et messages utilisateur traduits séparés. X-Correlation-ID retourné sur mutations API ; aucune stack ni détail interne dans la réponse. Les échecs d'observation n'annulent jamais une mutation réussie ; seul l'audit transactionnel impose le rollback.

## 16–17. Tests ajoutés et intégrations

RED observé puis GREEN : registre/logger/corrélation absents, import backend possible depuis use client, contexte d'acceptation absent, RPC absente, preuve qualité F absente, contexte de résumé d'invitation, configuration explicite PROD. Tests de conservation des garanties SQL existantes n'exigent pas d'affaiblir préalablement ces garanties pour fabriquer un RED. Aucun test valide supprimé/skippé, aucune tentative après retry comptée PASS.

- Sept tests unitaires observability : registry/enum/PII, défaut off/no-op/tampon/provider, logger whitelist/causes, debug/sink, UUID, PROD/observer isolation, contexte multi-requêtes.
- Tests logger historiques adaptés, tests session acceptance et répétition idempotente sent sans réenvoi, garde architecture client et test snapshot fails-closed.
- Douze assertions SQL F : projection, grants/propriété/expiration/annulation, absence de writer, payload sensible exclu, acteur/audit unique.
- Huit intégrations adaptateurs conservées et enrichies : panne Auth, bind SQL/reprise avec vraie identité, corrélation persistée jusqu'à acceptance, locale locale-analytics activée, audit unique et rollback sans succès observé. Huit intégrations Node/RLS/concurrence historiques conservées.
- E2E existant locale enrichi : réponse HTTP UUID, rejet du header imposé par navigateur, session/focus inchangés. Suites DEMO/PROD conservées ; pas d'E2E pour chaque ligne de log.

Première passe `verify:full` de développement PASS : 170 unitaires, 138 SQL, 16 intégrations, 38 E2E DEMO + 14 PROD sans retry/skip, builds PROD/DEMO, axe, frontières bundles, SAST/artefact/dependency audit/Gitleaks. Les contrôles complémentaires portent le total unitaire final à 172, confirmé par la suite unitaire séparée ; le candidat figé doit repasser l'ensemble. Les erreurs RED et défauts de typage transitoires ont été corrigés, jamais rebaptisés PASS.

## 18. Performance/overhead

Mesure du build de développement F, même script/gzip niveau 9 qu'E :

| Application | JS octets |   Gzip | Chunks | Delta JS / gzip vs E |
| ----------- | --------: | -----: | -----: | -------------------: |
| Citizen     |    686412 | 212092 |     15 |                0 / 0 |
| Pro         |    696773 | 216429 |     17 |                0 / 0 |

Aucun SDK client et aucun appel réseau analytics. La projection de contexte remplace la lecture pending_invitation dans l'adaptateur, sans nouvelle requête sur ce chemin. Pas d'affirmation de latence PROD ou de comptage global DB. Tampon borné ; petit objet whitelist sérialisé par diagnostic.

Volume observé/asserté : une mutation locale réussie = une ligne log, un événement local si activé, un audit DB ; Auth simple = une ligne ; bind échoué puis reprise puis acceptance = cinq diagnostics invitation dans l'intégration. Le résumé de la route configuration ajoute une ligne par requête de configuration. Health PROD = zéro ligne debug. Pas de polling ni transport réseau ajouté. Les diagnostics ne sont pas durables/garantis ; nécessité d'un collecteur et politique de rétention à étudier avant PROD.

## 19–20. Snapshot, gates, ADR et docs

Même snapshot v1 D/E. Policy `2bis-F.v1` **advisory**, nouvelle dimension observability dérivée du rapport unitaire et de sa provenance (privacy/registry/logger). Évidence absente/incomplète échoue ; SQL/audit/intégrations restent preuves requises distinctes. Aucun gate « nombre d'événements », aucun seuil coverage/performance bloquant. Anciennes policies D/E conservées, lecteur historique maintenu. La collecte GitHub existante consomme F ; aucun second snapshot ou Quality Center.

Les titres paramétrés d'un test d'artefact E n'interpolent plus leurs payloads synthétiques sensibles dans les rapports. Assertions scanner inchangées ; les rapports natifs/captures restent privés, les rapports uploadés minimisés.

ADR-013 proposée, quatre KB techniques liées au code/tests, index/AGENTS/Launch Index et traçabilité actualisés. Acceptation d'ADR-012 ajoutée comme décision ultérieure sans réécrire l'historique. Catalogue Skills complété pour add-analytics-event/add-audit-event/add-logging uniquement, procédures partielles manuelles ; aucun playbook complet G ni découverte automatique. Aucune nouvelle fiche métier faute de changement produit visible.

## 21–25. Exceptions, limites et arrêt

FAIL connus fonctionnels à la rédaction : aucun dans les campagnes achevées. Validation finale après gel : SHA propre, reset/seed, release complète, snapshot/évaluation, jobs CI et scan artefacts uploadables à relever dans l'attestation du SHA ; aucune preuve future déclarée réussie ici.

DEFERRED hors périmètre F : collecteur et durée de conservation logs PROD, gouvernance consent/provider futur, métriques DB, protections de branche et exercices opérationnels E. DAST passif optionnel à réexécuter si inclus dans la campagne ; aucune nouvelle preuve DAST ni pentest inférée d'E. Dette CSP/anti-CSRF passive medium/low E conservée, sans acceptation automatique. TalkBack historique indisponible, aucun nouveau contrôle manuel prétendu.

NOT_APPLICABLE F : nouvelle UI et nouveau VoiceOver (aucune interaction/texte changé), analytics PROD réel, seuils numériques non approuvés, pentest non commandité, fonctionnalités métier Phase 3. Le pentest reste requis avant vraie PROD/pilote significatif selon les règles existantes.

Limites : logs de refus techniques ≠ audit autoritaire des connexions ; analytics locales non durables ; contrat de diagnostic volontairement réduit sans stack/message brut ; nouvelle projection doit précéder déploiement applicatif. Pas de conformité privacy ou de readiness PROD fabriquée.

**Aucun 2bis-G commencé. Aucun Quality Center commencé. Aucune Phase 3 commencée. STOP pour validation Patrick après présentation des preuves finales.**
