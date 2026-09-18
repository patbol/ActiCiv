---
id: "technical.knowledge-governance"
title: "KB, traçabilité et Skills vérifiables"
domain: "governance"
type: "technical-topic"
status: "active"
introduced_in: "phase-2bis-g"
roles: ["developer", "reviewer"]
requirements: ["ADR-008", "ADR-014"]
related_adrs: ["ADR-008", "ADR-014"]
related_code:
  [
    "tooling/quality/knowledge.ts",
    "tooling/quality/knowledge-cli.ts",
    "tooling/quality/policy-g.json",
    "docs/skills/",
  ]
related_tests:
  ["tooling/quality/knowledge.test.ts", "tooling/quality/assurance.test.ts"]
related_docs:
  [
    "docs/quality/documentation-policy.md",
    "docs/quality/traceability.md",
    "docs/skills/README.md",
  ]
---

# KB, traçabilité et Skills vérifiables

## Sources et structure

Décision récente Patrick → références courantes → KB métier/technique → ADR acceptées → code/tests → historique. Contradiction : arrêter le changement concerné et présenter les sources ; ne pas adapter le produit à une erreur documentaire. Les rectifications de statut déjà décidé restent traçables.

Une fiche correspond à un comportement/domaine réel, pas à chaque fonction. Business explique acteurs, permissions, règles, états/erreurs, effets, confidentialité, a11y/i18n pertinentes et preuves. Technical explique frontières, contrats, exploitation et limites. Les IDs existants `feature.*` et `technical.*` sont conservés.

## Frontmatter

Champs texte requis : `id`, `title`, `domain`, `type`, `status`, `introduced_in`. Listes texte : `roles`, `requirements`, `related_adrs`, `related_code`, `related_tests`, `related_docs`. Types : business-feature, technical-topic ; templates suffixés -template, statut template. Statuts des fiches : draft, active, historical, superseded. Phase déclarée : phase-1, phase-2 ou phase-2bis-a…g pour une fiche active dans le périmètre actuel.

Une fiche active a exigences, ADR, code et tests non vides. Les listes de chemins sont relatives à la racine ; Markdown est relatif au fichier. Un dossier code existant est admis pour un sujet transversal ; préférer un fichier/test précis lorsqu'utile. `related_docs` relie notamment analytics/audit/logging : l'absence d'événement est expliquée dans le corps, jamais transformée en preuve d'instrumentation.

## Commandes et limites

Après nvm use : `pnpm docs:generate` régénère une seule [vue](../traceability.md) depuis les métadonnées ; `pnpm docs:validate` exige qu'elle soit à jour. Le contrôle rejette YAML invalide, ID dupliqué, type/statut invalide, chemins absents, ADR inconnues, liens locaux/ancres Markdown cassés et active Phase 3/Quality Center explicitement identifiés. Tests synthétiques couvrent ces refus.

Le contrôle des liens porte sur Markdown explicite (inline/référence) des documents vivants et sources courantes, hors blocs de code. Pas de crawler web, pas d'analyse sémantique de toute prose. Les références historiques peuvent être cibles valides sans devenir sources courantes. Les postmortems/reports A–F et preuves brutes restent hors normalisation ; leur statut est annoncé dans les index. Les chemins nus dans une preuve ne sont pas des liens actifs à réparer.

Chaque ADR a statut et association KB ; les Skills ont métadonnées name/description, chemin canonical et sections minimales. Leur contenu reste relu humainement : présence d'un titre ne prouve pas une procédure correcte. La même PR met à jour le contrat affecté ; cette obligation s'apprécie à l'impact map et à la revue, pas par un faux détecteur automatique de changement métier.

## Qualité, sécurité et découverte

Le check `docs` alimente le snapshot canonique v1 et la policy 2bis-G.v1 advisory ; preuve absente/commande en erreur = gate non satisfait. Aucun seuil coverage/performance ajouté. `verify` et donc CI exécutent le validateur ; les tests font partie de Vitest. Une nouvelle dependency `yaml` 2.9.1 est dev-only, compatible Node >=14.6, sans import produit.

Les quinze Skills sont dans `docs/skills/<name>/SKILL.md`, trouvables via AGENTS → index → playbook. Aucun autodiscovery de `/docs` n'est prétendu ; aucun symlink/copie/framework agent. Les règles persistent dans AGENTS, les étapes dans les Skills. Chacun conserve STOP de phase et preuve proportionnée.

Artifact Hygiene recherche chemins/IDs documentaires dans le build compilé et traces NFT ; ce garde syntaxique complète la revue des imports, sans prétendre reconnaître toute prose obfusquée. Aucune KB ni procédure ne doit être livrée au client. Pas de secrets, credentials de test utilisables ou données réelles dans les documents. G ne crée ni DB ni UI et ne justifie ni reset ni lecteur d'écran artificiel.
