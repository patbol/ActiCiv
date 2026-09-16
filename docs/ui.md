# Composants et marque

Button et Input reprennent les patterns shadcn/ui (composition Slot, variantes cva, fusion de classes) adaptés aux tokens du produit. Label et Dialog reposent sur Radix. Références : https://ui.shadcn.com/docs/components/button et https://ui.shadcn.com/docs/components/dialog. Pas de CLI shadcn installée ni de collection de composants téléchargée en masse. Les fichiers components.json préparent les ajouts contrôlés futurs.

Le dialogue est une démonstration explicitement signalée. Son champ ne collecte aucune identité, aucune donnée n'est envoyée. Il sert à vérifier les primitives réellement utilisées.

La marque et les couleurs primaires sont centralisées dans packages/shared/src/index.ts ; le SVG provisoire est dans brand-mark.ts. Les tokens sémantiques et de surface sont dans packages/ui/src/styles.css. Tokens compatibles avec un futur thème, aucun dark mode activé. Aucun éditeur de branding client en phase 1.
