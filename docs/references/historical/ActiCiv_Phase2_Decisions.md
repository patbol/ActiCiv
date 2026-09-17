# ActiCiv — Phase 2 Decisions

**Version:** 1.0\
**Date:** 16 septembre 2026\
**Statut:** Référence de décisions verrouillées pour la Phase 2\
**Objet:** Ce document consigne les arbitrages validés pour la Phase 2 afin d’éviter qu’une proposition antérieure ou une ambiguïté documentaire soit interprétée comme encore ouverte.

---

## 1. Hiérarchie documentaire

Ordre de référence applicable :

1. Décisions explicitement validées les plus récentes
2. **ActiCiv — Livre Produit & Technique v1.1 FINAL A4**
3. **Prompt Astra Phase 2 v1.1 HEX**
4. **Master Development Prompt**
5. ADR et documentation technique
6. Propositions d’architecture non encore validées

Une proposition d’architecture n’est pas une décision tant qu’elle n’est pas reprise dans ce document, dans une ADR approuvée ou dans une version ultérieure du Livre Produit.

---

## 2. Architecture générale

**STATUT : LOCKED**

- Architecture globale : **monolithe modulaire**.
- `packages/backend` reste un package interne au monolithe.
- Aucun troisième service, microservice ou backend autonome.
- La logique métier critique doit rester côté backend.
- Le frontend peut assister l’UX mais ne constitue jamais la source de vérité.
- Les modules métier critiques utilisent une **architecture hexagonale pragmatique**.
- Cette architecture hexagonale s’applique lorsqu’elle apporte une vraie séparation métier, notamment pour :
  - auth / permissions ;
  - SLA ;
  - routing ;
  - assignments ;
  - futurs workflows de reports/interventions.
- Ne pas créer artificiellement `domain/application/infrastructure/entrypoints` pour des modules triviaux.

### Règle de dépendance

Le domaine métier ne dépend pas de :
- Next.js ;
- Supabase ;
- HTTP ;
- UI ;
- stockage externe.

Les dépendances techniques sont derrière des ports/adaptateurs seulement lorsqu’un port apporte une vraie valeur de découplage/testabilité.

---

## 3. Baseline Git et discipline de release

**STATUT : LOCKED**

Baseline Phase 1 validée :

- Repository : `https://github.com/patbol/ActiCiv.git`
- HEAD Phase 1 validé : `b28160ca1b93c0ef9eb312c8456f8b95b9cc2763`
- Arbre propre avant démarrage Phase 2.

Règles obligatoires :

- Ajouter un script racine `verify`.
- Ajouter un script racine `verify:full`.
- Toute validation ne vaut que pour le SHA exact exécuté.
- Fin de phase :
  - working tree propre ;
  - SHA enregistré ;
  - même SHA validé localement et dans GitHub Actions ;
  - archive produite depuis ce commit validé.
- Toute modification après validation finale invalide les résultats précédents.
- Utiliser des patches ciblés ; éviter les remplacements textuels globaux risqués.
- Inspecter les diffs et `git diff --check` après correctifs sensibles.

---

## 4. Organisation, utilisateurs et rôles

**STATUT : LOCKED**

### Organisations

- Une organisation peut couvrir plusieurs territoires.
- Plusieurs organisations peuvent coexister géographiquement selon leur contexte contractuel.
- Une configuration interne n’accorde jamais de droits contractuels.

### Professionnels

Pour le MVP :

- Un professionnel appartient à **une seule organisation**.
- Il peut appartenir à **plusieurs services de cette organisation**.
- Le multi-organisation pour un même professionnel est hors MVP.

### Rôles principaux

- `agent`
- `supervisor`
- `client_admin`
- `platform_admin` séparé des rôles clients

Règles :

- Un seul rôle principal par appartenance organisationnelle.
- Les rôles ne sont pas librement cumulables.
- `client_admin` n’hérite pas automatiquement des permissions de `supervisor`.
- `platform_admin` est un rôle plateforme distinct, non dérivé d’un rôle client.

---

## 5. Permissions Phase 2

**STATUT : LOCKED**

### Agent

Peut :
- lire son propre contexte professionnel ;
- lire ses services autorisés.

Ne peut pas :
- administrer l’organisation ;
- modifier services, horaires ou SLA ;
- gérer les utilisateurs ;
- lire/modifier le périmètre contractuel ;
- lire l’audit de configuration.

### Supervisor

Peut :
- lire son contexte opérationnel ;
- lire les membres/services qu’il supervise lorsque nécessaire au fonctionnement opérationnel.

Ne peut pas par défaut :
- administrer l’organisation ;
- modifier le périmètre contractuel ;
- devenir implicitement `client_admin`.

### Client admin

Peut :
- gérer les utilisateurs de son organisation ;
- gérer les services de son organisation ;
- gérer les configurations internes autorisées ;
- gérer horaires et SLA ;
- lire le périmètre contractuel de son organisation ;
- lire l’audit de configuration de son organisation ;
- inviter/promouvoir un autre `client_admin` de sa propre organisation.

Ne peut pas :
- étendre le périmètre contractuel ;
- modifier les territoires contractuels ;
- devenir automatiquement superviseur.

### Protection du dernier administrateur

Il doit être impossible de :
- désactiver ;
- supprimer ;
- rétrograder

le **dernier `client_admin` actif** d’une organisation.

Le `platform_admin` conserve un mécanisme de récupération administrative.

### Platform admin

Peut exercer les capacités plateforme explicitement autorisées, notamment :
- gestion des contrats ;
- gestion des territoires ;
- gestion des périmètres contractuels ;
- capacités de récupération administrative ;
- audit global selon les droits définis.

---

## 6. Chaîne minimale d’autorisation professionnelle

**STATUT : LOCKED**

Toute opération métier protégée doit vérifier au minimum :

1. identité Auth valide ;
2. profil professionnel actif ;
3. membership organisation actif ;
4. rôle / capacité requise ;
5. membership service si l’opération l’exige ;
6. ownership / organisation réelle de la ressource.

Une identité Supabase Auth valide seule n’accorde aucun accès métier.

Les permissions métier doivent être lues dans la base et non déduites de métadonnées utilisateur modifiables.

---

## 7. RLS et sécurité base

**STATUT : LOCKED**

- RLS obligatoire sur les tables tenant.
- RLS n’est pas remplacée par des filtres applicatifs.
- Utiliser `USING` et `WITH CHECK` lorsque nécessaire.
- Grants SQL minimaux.
- Aucun accès anonyme aux données professionnelles.
- Les opérations ordinaires utilisent le contexte utilisateur afin que RLS reste active.
- La service role / clé privilégiée ne doit pas devenir le mécanisme normal d’accès aux données.
- Les opérations privilégiées doivent être :
  - exceptionnelles ;
  - server-only ;
  - documentées ;
  - testées ;
  - auditables.
- Tests négatifs multi-tenant obligatoires.

---

## 8. Territoires et PostGIS

**STATUT : LOCKED**

PostGIS est approuvé pour la Phase 2.

### Représentation

- Territoires : `geometry(MultiPolygon, 4326)`.
- Positions GPS : points SRID 4326.
- Convention : longitude, latitude.
- Index spatial GiST.
- Les futures distances en mètres utiliseront `geography` ou une stratégie appropriée.

### Frontières

Utiliser `ST_Covers` pour considérer comme couvert un point situé :
- à l’intérieur ;
- ou sur la frontière d’un territoire.

### Validation géométrique

Refuser les géométries :
- vides ;
- invalides ;
- de mauvais type ;
- de mauvais SRID ;
- hors limites attendues.

Ne pas appliquer `ST_MakeValid` silencieusement sur une frontière contractuelle.

### Hiérarchie / chevauchements

- Un territoire peut avoir un parent facultatif.
- Le parent représente une inclusion connue, pas une hiérarchie administrative obligatoire.
- Pas de cycles.
- Les chevauchements non emboîtés sont autorisés.
- En cas de chevauchement sans relation de spécificité claire, retourner plusieurs candidats.
- Ne pas inventer un gagnant.
- La Phase 2 fournit les fondations ; le moteur complet de routage reste hors scope.

---

## 9. Contrats et périmètres contractuels

**STATUT : LOCKED**

- Les contrats et périmètres contractuels sont contrôlés par ActiCiv / plateforme.
- Le `client_admin` peut lire son périmètre mais ne peut pas l’étendre.
- Une configuration interne n’accorde aucun droit commercial supplémentaire.
- Les catégories autorisées doivent être **explicitement rattachées** au périmètre contractuel.
- Une nouvelle catégorie créée dans le catalogue n’est pas automatiquement autorisée dans les contrats existants.
- Les services contractuellement inclus peuvent être représentés explicitement si le modèle l’exige.

---

## 10. Verticales et catégories

**STATUT : LOCKED**

- Verticales et catégories sont configurables.
- Elles ne doivent pas être hardcodées dans la logique métier.
- Initialement :
  - verticale `accessibility`
  - catégories prévues par le Livre Produit.
- Le modèle doit supporter :
  - actif/inactif ;
  - priorité par défaut ;
  - rattachement futur au service ;
  - surcharge future SLA ;
  - sous-catégories plus tard si besoin.
- Ne pas créer de colonnes métier spécifiques à une seule catégorie PMR dans les fondations génériques.

---

## 11. Priorités

**STATUT : LOCKED**

Priorités :
- Normal
- Important
- Urgent

Règles :
- jamais choisies par le citoyen ;
- contrôlées côté backend ;
- configuration par défaut possible par catégorie ;
- modification future par rôle autorisé.

---

## 12. SLA

**STATUT : LOCKED**

### Trois cibles

1. Prise en charge : `received_at → claimed_at`
2. Intervention : `claimed_at → intervention_started_at`
3. Résolution : `received_at → closed_at`

### Non-rétroactivité

Les changements de configuration SLA ne sont pas rétroactifs.

Une future instance de report devra conserver les versions applicables :
- version de la politique SLA ;
- version des horaires ;
- règles de pause associées.

### Pauses

- `on_hold` ne suspend pas automatiquement un SLA.
- Une pause ne s’applique que si une règle explicite la configure pour une cible donnée.

### Portées futures

Le modèle doit permettre des politiques au niveau :
- organisation ;
- service ;
- catégorie ;
- service + catégorie.

Ordre de spécificité futur :

`service + catégorie > catégorie > service > organisation`

La Phase 2 doit modéliser cette possibilité sans implémenter prématurément le résolveur complet lié aux reports.

---

## 13. Horaires de service

**STATUT : LOCKED**

Le modèle doit permettre :

- plusieurs créneaux par jour ;
- jours explicitement fermés ;
- intervalles semi-ouverts `[start, end)` ;
- créneau traversant minuit représenté sur deux jours ;
- représentation explicite du 24/7 ;
- fuseau IANA ;
- pas de jours fériés en Phase 2.

### DST / changements d’heure

Convention déterministe :

- heure locale ambiguë : **première occurrence** ;
- heure locale inexistante : **première heure locale valide suivante**.

Ces règles doivent être documentées et testées.

---

## 14. Invitations professionnelles

**STATUT : LOCKED**

- Auth sur invitation uniquement.
- Inscription publique professionnelle désactivée.
- Invitation via un chemin serveur privilégié dédié.
- L’appel Supabase Auth + écriture métier ne constitue pas une transaction distribuée atomique.
- Utiliser :
  - états explicites d’invitation ;
  - idempotence ;
  - reprise contrôlée ;
  - aucune attribution de droits en cas d’échec partiel.
- Une invitation inter-tenant non autorisée doit être refusée.

---

## 15. Audit

**STATUT : LOCKED**

Audit serveur append-only.

Doit pouvoir tracer notamment :
- changements de rôle ;
- changements de service ;
- changements de périmètre contractuel ;
- territoires ;
- SLA ;
- horaires ;
- catégories ;
- branding ;
- futures mutations métier critiques.

Chaque événement peut contenir :
- acteur ;
- timestamp ;
- organisation ;
- type d’entité ;
- id entité ;
- action ;
- ancienne valeur autorisée ;
- nouvelle valeur autorisée.

Règles :
- liste blanche des champs ;
- pas de secrets ;
- pas de copie aveugle de lignes complètes ;
- rollback d’une transaction = rollback de l’audit associé lorsque l’audit est transactionnel.

---

## 16. Déactivation et suppression

**STATUT : LOCKED**

Ne pas utiliser `deleted_at` partout.

Préférer selon le cas :
- actif/inactif ;
- archivé.

Particulièrement pour :
- organisations ;
- services ;
- identités professionnelles ;
- configurations historiques.

La suppression réelle reste gouvernée par la future politique de rétention.

---

## 17. Seeds Phase 2

**STATUT : LOCKED**

Les seeds doivent inclure au minimum :

- 3 organisations fictives ;
- plusieurs services ;
- plusieurs rôles ;
- professionnels fictifs ;
- memberships service ;
- territoires imbriqués ;
- territoires chevauchants ;
- horaires ;
- configurations SLA ;
- verticales/catégories.

Ne pas créer de signalements fictifs en Phase 2.

Aucune donnée réelle.

---

## 18. Dépendances Phase 2

**STATUT : VALIDÉ / CONDITIONNEL**

### Validées

- `@supabase/ssr`
- PostGIS
- pgTAP ou équivalent SQL adapté aux tests RLS/contraintes

### Conditionnelle

`@js-temporal/polyfill`

Règle :
- vérifier d’abord le support réel de Temporal dans Node 24.21 et l’environnement du projet ;
- ne l’ajouter que si nécessaire pour garantir les calculs SLA/horaires déterministes et testables.

### Explicitement non nécessaires

Pas de :
- ORM ;
- Redis ;
- moteur externe de permissions ;
- microservice ;
- bibliothèque cartographique Phase 2 ;
- provider email supplémentaire ;
- gestionnaire d’état global ajouté “au cas où”.

---

## 19. ADR Phase 2

**STATUT : LOCKED**

Créer uniquement des ADR structurantes.

ADR prévues :

1. Tenancy et sécurité
2. Géographie contractuelle / PostGIS / SRID / frontières
3. SLA non rétroactifs et versionnement des horaires
4. Audit transactionnel

La discipline de release met à jour l’ADR qualité existante si nécessaire.

Pas d’ADR pour les conventions triviales.

---

## 20. Documentation du repo

**STATUT : LOCKED**

Le repo doit conserver comme références courantes :

- `ActiCiv_Livre_Produit_Technique_v1.1_FINAL_A4.docx`
- `master-development-prompt.md`
- `ActiCiv_Phase1_Postmortem.md`
- `ActiCiv_Prompt_Astra_Phase2_v1.1_HEX.md`
- `ActiCiv_Phase2_Proposition_Architecture.md`
- `ActiCiv_Phase2_Decisions.md`

Mettre à jour :
- `open-questions.md` pour retirer les sujets désormais tranchés ;
- documentation historique qui présente encore les validations Phase 1 comme manquantes.

Les anciennes versions peuvent rester dans l’historique Git ou un dossier archive, mais ne doivent pas être confondues avec la référence courante.

---

## 21. Configuration Auth / ports

**STATUT : LOCKED**

- Citizen : port 3000
- Pro : port 3001

Les URLs Auth destinées aux professionnels doivent être adaptées à l’application Pro.

Ne pas utiliser par défaut une redirection Auth professionnelle vers Citizen.

---

## 22. Tests Phase 2

**STATUT : LOCKED**

### Unitaires

Tester notamment :
- résolution des capacités ;
- refus capacité inconnue ;
- absence d’héritage `client_admin → supervisor` ;
- membership inactif ;
- services autorisés ;
- priorités ;
- catégories ;
- validation SLA ;
- horaires ;
- DST ;
- règles de pause.

### Intégration Supabase réelle

Tester notamment :
- same-tenant autorisé ;
- cross-tenant refusé ;
- service membership requis ;
- rôle inapproprié refusé ;
- admin A incapable de modifier B ;
- admin incapable d’étendre son propre périmètre contractuel ;
- changement frauduleux d’`organization_id` refusé ;
- deux memberships organisationnels pour un utilisateur refusés ;
- auto-promotion plateforme refusée ;
- metadata Auth falsifiées sans effet ;
- membership désactivé malgré JWT encore valide ;
- anonymes refusés.

### Auth / invitations

Tester :
- inscription publique refusée ;
- invitation + activation ;
- invitation inter-tenant refusée ;
- idempotence ;
- concurrence ;
- expiration ;
- réutilisation ;
- recovery ;
- logout ;
- redirection malveillante refusée.

### PostGIS

Tester :
- intérieur ;
- extérieur ;
- frontière ;
- trou de polygone ;
- territoire imbriqué ;
- chevauchement sans gagnant ;
- géométrie invalide ;
- cycle parent ;
- index spatial.

### SLA / audit / reproductibilité

Tester :
- version immuable ;
- nouvelle version sans altération de l’ancienne ;
- cohérence tenant ;
- audit avec acteur réel ;
- rollback audit/mutation ;
- audit non modifiable ;
- absence de secrets ;
- reconstruction DB complète ;
- reset + seeds.

### Non-régression

Tous les tests Phase 1 restent obligatoires.

Chaque bug corrigé pendant Phase 2 doit ajouter un test de non-régression adapté.

---

## 23. Hors scope Phase 2

**STATUT : LOCKED**

Ne pas implémenter en Phase 2 :

- création de report citoyen ;
- upload photo ;
- suivi public ;
- smart queue ;
- claim agent ;
- intervention ;
- workflow de transfert opérationnel ;
- fusion de doublons ;
- notifications métier ;
- analytics produit ;
- dashboard complet ;
- billing ;
- CRM ;
- moteur complet de routage ;
- transferts inter-organisations ;
- PWA offline avancée ;
- anti-abus complet ;
- route optimisation ;
- reconnaissance de plaque ;
- IA avancée.

---

## 24. Questions volontairement reportées

**STATUT : OPEN — FUTURE PHASE**

Restent ouvertes pour leur phase respective :

- comportement détaillé de fusion des doublons ;
- payload exact du suivi public ;
- rayon géographique anti-abus ;
- traitement des anciens reports hors couverture lorsqu’un territoire devient couvert ;
- comportement PWA hors ligne ;
- routage complet lorsqu’il existe plusieurs organisations candidates non départageables ;
- politiques de rétention PROD détaillées.

---

## 25. Règle de démarrage Phase 2

Avant toute implémentation, Astra doit fournir et faire valider :

1. schéma final tables/relations ;
2. contraintes SQL majeures ;
3. cartographie hexagonale concrète des modules critiques ;
4. modèle RBAC/RLS ;
5. ordre des migrations ;
6. dépendances finales nécessaires ;
7. plan de tests ;
8. ADR structurantes ;
9. risques restants.

**Aucun code métier Phase 2 ne doit être écrit avant validation explicite de cette proposition consolidée.**

---

## 26. Principe final

La Phase 2 doit privilégier :

**sécurité + intégrité + testabilité + traçabilité + simplicité réversible**

Le modèle doit être suffisamment solide pour supporter le futur produit, sans introduire prématurément les fonctionnalités des phases suivantes.


## 27. Approbation de la proposition consolidée et précisions finales

Patrick a approuvé la proposition A–I et autorisé l’implémentation Phase 2 le 16 septembre 2026.

- Unicités avec colonnes nullable : UNIQUE NULLS NOT DISTINCT sous PostgreSQL 17 ou index partiels corrects ; jamais un UNIQUE classique insuffisant.
- service_memberships porte officiellement le périmètre agent/supervisor ; aucune table distincte de supervision.
- Toute mutation métier auditable est atomique avec son événement : échec audit = rollback métier. Logs techniques distincts.
- Node 24.21.0 ne fournit pas Temporal par défaut ; le polyfill encapsulé est retenu pour les conversions déterministes et leurs tests.
- La Phase 3 reste interdite sans validation explicite.

Cartographie et procédure : ../phase-2.md.
