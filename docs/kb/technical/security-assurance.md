---
id: technical.security-assurance
domain: engineering-quality
type: technical-topic
status: active
roles: [developer, reviewer]
requirements: ["Patrick — checkpoint 2bis-E uniquement"]
related_adrs: [ADR-011, ADR-012]
related_code:
  [
    tooling/quality/security.ts,
    tooling/quality/assurance-cli.ts,
    tooling/security/semgrep.yml,
  ]
related_tests: [tooling/quality/assurance.test.ts]
related_docs: [docs/quality/phase-2bis-e-report.md]
---

# Security Assurance

Les scans complètent les tests métier/RLS existants. [Catalogue](../../quality/security-scenarios.md) et [ADR-012](../../architecture-decisions/012-security-artifact-performance.md) définissent périmètre et limites. Aucun service cloud de sécurité ni changement de droits DB.

Après nvm use : `pnpm security:sast`, `pnpm security:dast:baseline` (DEMO construite et Supabase local démarré), `pnpm secrets:check`, `pnpm audit --audit-level high`. Images par digest, répertoire `.quality/assurance/` privé/ignoré. Semgrep sans réseau et sans collecte ; copie TS/TSX uniquement, tests exclus car scénarios offensifs intentionnels. SQL/YAML/outillage sont hors SAST actuel, compensés selon périmètre par pgTAP/lint/tests/revue.

ZAP est une observation passive non authentifiée, sans attaques actives ni pentest. Reports JSON natifs privés ; findings minimisés dans le snapshot. Les statuts de sévérité et de gate sont distincts : PASS sans critical/high ne signifie pas zéro medium/low. Registre `accepted-risks.json` vide ; aucune approbation automatique. Une absence de scan produit FAIL si requis ou DEFERRED si explicitement optionnel.

## Cyber readiness — procédures à exercer sur environnement réel

Patrick porte la décision d'exploitation et doit nommer les titulaires/suppléants avant pilote. Aucun RTO/RPO contractualisé, aucun restore drill PROD réalisé en E.

- Backup : définir RPO et rétention avec le propriétaire des données ; vérifier le plan Supabase/PITR et le stockage réellement utilisés, chiffrer les exports, limiter les droits et tester leur disponibilité. Aucun backup PROD prétendu.
- Restore : créer un environnement isolé, restaurer une sauvegarde contrôlée, vérifier migrations/seed pertinent, RLS/tenants, intégrité métier et audit ; mesurer temps réel et perte de données ; approbation avant bascule. Le reset DEV n'est pas un restore de sauvegarde PROD.
- Rotation : inventorier clés serveur, Auth/JWT, SMTP et CI ; révoquer une clé compromise, distribuer la nouvelle via coffre/environnement protégé, vérifier parcours existants et logs minimisés, invalider sessions selon incident. Aucune valeur dans Git/rapport.
- Incident : contenir l'accès, préserver audit/logs en accès restreint, dater les décisions, identifier tenants/données touchés, remédier, retester et décider reprise. Communications externes uniquement par responsable autorisé.
- Rétention : artefacts CI qualité 14 jours ; ce choix ne définit pas rétention légale des données/audits métier. Audit append-only transactionnel inchangé, logs techniques distincts. Définir durées et accès cloud avant exposition réelle.

Pentest indépendant/retest requis avant vraie PROD ou pilote significatif. Une référence à une phase future n'est pas une dispense de cette condition. Aucun achat, scan externe ni modification d'administration GitHub effectué ici.
