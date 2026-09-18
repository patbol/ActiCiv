# ADR-015 — Quality Center architecture and read-only presentation of canonical quality evidence

Statut : **acceptée par Patrick le 18 septembre 2026, finalisation du checkpoint 2bis-H**. A–G et ADR-008 à ADR-014 approuvés par Patrick sur `11d6f94d4f4a7790bd22588847b0bb8aecd1703e`. Complète ADR-011/012/014 sans les superséder.

## Contexte et impact map

Preuves D–G → lecteur canonique partagé → import CLI de confiance → fichiers privés → Auth vérifiée/capacité plateforme → cas d’usage → rendu serveur Pro → parcours clavier/axe/VoiceOver → KB. Aucun 2bis-I ni Phase 3. Les seuils coverage/performance demeurent advisory.

## Décision

Le noyau existant model/parsers/security/snapshot/storage est déplacé sans seconde implémentation dans le package interne `@acticiv/quality`. Les anciens chemins tooling réexportent ce noyau pour compatibilité des CLI et références. Aucune nouvelle bibliothèque tierce. Le navigateur n’importe ni lecteur ni évaluateur. L’UI lit `gate_evaluation` stocké ; elle ne calcule aucun verdict.

Stockage : répertoires privés de runs immuables, configurés via `ACTICIV_QUALITY_ROOT`, hors public et hors build. Pas de table qualité : quelques fichiers indexables satisfont historique, détail, provenance et comparaison. `quality:import` vérifie le snapshot et la policy historique avec l’évaluateur canonique avant import. Copie bornée des seules pièces référencées, intégrité des digests, chemins et symlinks contrôlés, collision refusée, publication atomique. Ce n’est pas une signature : l’opérateur/CI et les ACL du stockage restent la frontière de confiance, comme ADR-011. Le processus Pro n’a besoin que de lecture ; ne pas déployer sous son compte d’écriture le mécanisme d’import.

Un sidecar facultatif référence uniquement une URL GitHub du dépôt ActiCiv, sans query/token ni redirection locale ; expiration affichée lorsqu’elle est connue. Il ne remplace ni snapshot ni preuve. Pas de téléchargement de rapports bruts depuis un endpoint navigateur. Les chemins locaux ne sont pas exposés. L’acceptation baseline est externe, tracée et vérifiée ; UI sans mutation. Candidate, accepted et absence restent distincts. Les comparaisons entre runs compatibles sont purement observationnelles et réutilisent le comparateur canonique CLI, y compris les modules critiques ; aucune logique de comparaison divergente dans React.

## Accès et sécurité

`quality.read` explicite, administrateur plateforme actif et Auth `getUser` vérifiée. Les rôles organisation et metadata Auth ne donnent aucun accès. Contrôle dans le cas d’usage avant toute lecture du stockage, y compris URL de détail. RLS `platform_self` vérifie la ligne propre active ; aucune utilisation service_role ordinaire. Migration additive étend seulement la contrainte des capacités, sans attribuer automatiquement le droit. Les grants, RLS et triggers d’audit transactionnels restent inchangés.

DTO de présentation par liste blanche : identité/provenance, résultats, compteurs, mesures connues, findings minimisés et preuves manuelles. Pas d’objets scan arbitraires, payloads, secrets, target d’exploit ou chemins natifs. Les strings défensivement filtrées ne constituent pas une garantie de détection de toute PII : seules sources préalablement minimisées et ingestion opérateur autorisée. Aucun audit de lecture en masse ni campagne analytics. Erreurs utilisateur génériques ; pas de stack/SQL.

## UX, accessibilité et performance

Une page Pro `/quality`, navigation par ancres, historique borné à 25 répertoires par page, filtres environnement/statut, détail par run, tables/details HTML natifs, suites filtrables par tag exact (criticité/route/composant). Au plus 100 tests affichés par suite ; totaux complets conservés. Pas de bibliothèque de graphiques, polling ou Client Component qualité. Priorité échecs/différés et findings, couverture sans seuil inventé, séparation axe/manuels. CSS responsive avec régions de tables scrollables au clavier. FR/EN, formats Intl UTC, codes techniques stables.

Le détail et les mesures ne sont chargés au navigateur que lorsqu’un run est sélectionné. Les lectures serveur sont bornées à 25 runs (8 Mo maximum par pièce) ; davantage d’historique demanderait un index de métadonnées si un coût réel le justifie. Aucun cache partagé d’autorisation. Les erreurs de run restent visibles ; aucun fallback PASS sur un snapshot incomplet/corrompu. Volumes compilés et HTML sont mesurés avant conclusion ; absence de budget approuvé signalée.

## Alternatives

- Base SQL qualité : migrations/RLS/ingestion supplémentaires sans besoin de requête démontré.
- Fetch des artefacts GitHub au chargement UI : dépendance réseau, secrets de téléchargement et expiration à gérer à chaque requête ; import opérateur retenu.
- Copie d’un evaluator React : rejetée, seconde vérité.
- JSON brut envoyé au client : payload et risque de divulgation injustifiés.
- Baseline promue automatiquement à partir du verdict : rejetée, décision humaine requise.

## Testing, migration et récupération

RED→GREEN pour capacité absente de SQL, refus de lecture et guard documentaire H ; lecteurs historiques D/E/F/G, corruption/digest/pièces manquantes/symlinks, collisions, privacy/liens, états et comparaisons. JWT/adaptateur réel, pgTAP, reconstruction locale et E2E DEMO/PROD avec sources synthétiques isolées, sans CI distante en test. Axe/clavier automatisés ; VoiceOver H-VO-01 à H-VO-09 validé manuellement par Patrick le 18 septembre 2026 sur le candidat documenté, TalkBack distinct.

Déployer la migration avant le code. Aucun backfill ni grant automatique. L’opérateur DB habilité attribue explicitement quality.read selon son processus de contrôle ; audit existant couvre cette mutation atomiquement. Retour arrière code possible en conservant la capacité inactive ; ne pas modifier une migration publiée. Pour retirer la contrainte étendue, retirer d’abord les attributions quality.read dans une nouvelle migration auditée. Sauvegarder les preuves importées selon la politique de conservation opérateur ; le répertoire local n’est pas une promesse de conservation permanente.

## Références

[KB technique](../kb/technical/quality-center.md), [capacité et parcours](../kb/business/quality-center.md), [rapport H](../quality/phase-2bis-h-report.md), [protocole VoiceOver](../quality/phase-2bis-h-voiceover.md).
