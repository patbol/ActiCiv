---
id: technical.quality-center
title: "Quality Center — lecture canonique et exploitation"
domain: quality
type: technical-topic
status: active
introduced_in: phase-2bis-h
roles: [developer, operator, platform_admin]
requirements: ["Patrick — checkpoint 2bis-H uniquement"]
related_adrs: [ADR-011, ADR-012, ADR-015]
related_code:
  [
    packages/quality/src/,
    packages/backend/src/modules/quality/,
    packages/backend/src/platform/quality.ts,
    apps/pro/src/app/quality/page.tsx,
    tooling/quality/import-cli.ts,
  ]
related_tests:
  [
    tooling/quality/center.test.ts,
    packages/backend/integration/quality.integration.ts,
    e2e/quality.spec.ts,
    supabase/tests/phase2bis_quality.sql,
  ]
related_docs:
  [
    docs/kb/business/quality-center.md,
    docs/quality/phase-2bis-h-report.md,
    docs/quality/phase-2bis-h-voiceover.md,
  ]
---

# Quality Center — lecture canonique et exploitation

## Architecture et source

[ADR-015](../../architecture-decisions/015-quality-center.md) décrit le choix minimal sans DB qualité. Lecture historique v1 D/E/F/G/H conservée ; I2 ajoute v2 pour les nouvelles preuves ; seuls ses modules réutilisables quittent tooling vers packages/quality, avec réexports rétrocompatibles. Cas d’usage `readQuality` : autorisation avant reader. Adaptateur Supabase `platformIdentity` : getUser et ligne propre active. Adaptateur fichiers : intégrité et stockage. Entrypoint Server Component `/quality` : paramètres bornés, contexte serveur, rendu HTML traduit. Aucun réseau/Next/Supabase dans application.

## Import de confiance et exploitation

Charger nvm et `nvm use`. Générer les preuves par les CLI existantes ou télécharger l’artefact CI sur le SHA approuvé. Vérifier digest GitHub et provenance avant import. Exemple de commande (chemins choisis par l’opérateur) :

```sh
pnpm quality:import /private/verified-run /private/quality-store
```

Deux arguments optionnels : URL GitHub ActiCiv du run/artefact puis expiration ISO. Aucun token/query dans l’URL. Seuls snapshots, digest, pièces référencées et métadonnées baseline/artefact validées sont copiés. Import réservé à l’opérateur/CI habilité, jamais un endpoint HTTP. Configurer `ACTICIV_QUALITY_ROOT` vers le magasin privé pour Pro ; monter en lecture seule en déploiement. Pas de valeur implicite PROD ni de répertoire public. Les fichiers JSON ne sont pas des données de seed applicatives.

Une collision échoue sans écraser. Un import incomplet n’est pas un PASS. Une preuve devenue absente ou invalide rend le run indisponible. Absence de source, magasin vide, absence de baseline, référence expirée et policy incompatible sont explicitement affichées. Pour récupérer : corriger la source de confiance et publier un nouveau run ; ne pas éditer une preuve historique. Les checksums ne protègent pas contre un administrateur hostile capable de réécrire fichiers et digests.

## Read model, navigation et historique

Historique 25 répertoires/page, détail par run, filtres environnement/statut. Les filtres portent sur la page bornée ; parcourir les pages pour les entrées plus anciennes. Un run invalide reste visible. L’ordre suit les IDs horodatés des collecteurs actuels ; l’identité affiche la date réelle. Deltas de tests/lignes contre le run précédent compatible dans cette page ; comparaison détaillée via le même comparateur canonique que la CLI, global et modules critiques. Suites/details et filtre tag exact, 100 premières lignes par suite ; aucune ligne inventée pour les outils sans détail.

Baseline : sidecar candidat ou acceptation gouvernée existante, validé contre SHA/run/environnement/digest/policy. Pas d’acceptation UI. Comparaison A/B limitée au même environnement et policy ; delta descriptif, pas gate. Zéro coverage est affiché ; null signifie non mesuré. SQL/RLS ne devient pas coverage JS. Les anciennes policies restent lisibles sans réécriture.

## Sécurité, confidentialité et observabilité

`quality.read` n’est pas un rôle organisationnel. Auth seule/metadata forgées/client_admin/supervisor/agent sont refusés. Le read model filtre les métriques connues et strings ; aucune réponse HTTP ne contient snapshot brut, rapports natifs, token, exploit ou chemin local absolu. Le lien externe autorise exclusivement les routes GitHub du dépôt. Aucune écriture UI, orchestration CI ou promotion d’artefact.

Analytics : aucune nouvelle campagne. Audit : la consultation ne crée pas un flux bruyant ; les attributions de capacité restent couvertes par le trigger plateforme transactionnel. Logs : erreurs HTTP génériques, pas de dump de snapshot ou de scan. Les preuves manuelles restent séparées d’axe et gardent leur portée historique.

## Accessibilité et coût

HTML serveur, tables/captions/headers, details/summary, liens et formulaires natifs. Deux catalogues FR/EN, dates UTC explicites, navigation clavier, aucun graphique superflu. Le [protocole manuel](../../quality/phase-2bis-h-voiceover.md) est une validation propre à H, pas la réutilisation de C. Pas de dépendance tierce supplémentaire ; coût Node de lecture/validation partagé avec la CLI, aucun évaluateur navigateur. Les métriques compilées et limites sont dans le rapport.

## Compléments I2

Le read model projette les mesures canoniques de flakiness (état, répétitions, intervalle, tentatives/taux par test et digest de provenance), sans lancer de test ni recalculer la stabilité. Les résultats axe incomplets apparaissent comme revue humaine requise, séparés des violations et des preuves manuelles. Les anciennes pièces sans IDs restent lisibles avec leur compteur, sans inventer les détails manquants. Le lifecycle sécurité expose aussi les dates/ownership disponibles. Aucun nouveau droit, endpoint, Client Component ou dépendance.

La preuve VoiceOver H reste historique ; les ajouts statiques I2 demandent une revue manuelle ciblée, distincte du PASS H.
