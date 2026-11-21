# NOËL & MERVEILLES — boutique de Noël virtuelle en 3D

Vitrine d'affiliation Amazon pour le challenge Pinterest : on se promène dans un vrai magasin de
Noël en 3D — arche d'entrée, grand sapin central, cinq rayons décorés, des produits qu'on touche
pour ouvrir leur fiche et les faire tourner — puis on commande sur Amazon.

**La boutique ne vend rien.** Pas de prix, pas de panier, pas de commande, pas d'avis : chaque fiche
porte un bouton « Voir sur Amazon » qui ouvre la fiche du produit dans un nouvel onglet, avec
l'identifiant de suivi.

→ **`MISE-EN-LIGNE.md` : ce qu'il reste à faire avant le top départ, et les 10 adresses de
destination des épingles.**

## Démarrer

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # version de production dans dist/
npm run typecheck
```

## Les contrôles

```bash
npm run ancres       # les 9 ancres du dossier ouvrent-elles la bonne destination ?
npm run conformite   # produits par rayon, 3 gammes par rayon, liens affiliés, mots-clés couverts
npm run rendu        # rendu réel de chaque page (DOM simulé), et absence de prix / panier / avis
```

## Structure exigée par le dossier

| # | Élément | Où c'est |
|---|---|---|
| 1 | Écran d'accueil immédiat pendant le chargement de la 3D | `components/pages/Home.tsx`, `pages/Store.tsx` (`LoadingScreen`) |
| 2 | 5 rayons, bouton Amazon par produit, aucun prix | `data/aisles.ts`, `data/products.ts`, `components/ui/Amazon.tsx` |
| 3 | Espace Inspiration, 4 guides | `data/guides.ts`, `components/pages/Inspiration.tsx` |
| 4 | Les 9 ancres | `state/ui.ts` (`routeFromHash`) |
| 5 | À propos, Contact, Mentions légales, mention d'affiliation en pied de chaque écran | `components/ui/InfoDialog.tsx`, `components/ui/Chrome.tsx`, `components/ui/Amazon.tsx` |
| 6 | Titre, description, icône d'onglet, 150 mots par rayon | `index.html`, `App.tsx`, champ `seo` de `data/aisles.ts` |
| 7 | Adresse en https | GitHub Pages via `.github/workflows/deploy.yml`, voir `MISE-EN-LIGNE.md` |

### Identifiants internes et ancres publiques

Les identifiants d'allée datent de la première version et sont utilisés partout dans la 3D. Les
ancres sont celles du dossier. La correspondance est faite une seule fois, dans `data/aisles.ts` :

| id interne | ancre publique | rayon |
|---|---|---|
| `sapins` | `#sapins` | Sapins |
| `lumieres` | `#guirlandes` | Guirlandes & LED |
| `ornements` | `#boules` | Boules & ornements |
| `village` | `#figurines` | Figurines & villages |
| `maison` | `#table` | Table & extérieur |

Renommer les identifiants n'apporterait rien et casserait les emplacements 3D ; `ANCHOR_TO_AISLE`
suffit. Les ancres `#guide-…` sont définies dans `data/guides.ts`.

## Publication

Le dépôt publie tout seul sur GitHub Pages à chaque `git push` sur `main`
(`.github/workflows/deploy.yml`). L'action lance `npm run typecheck` et `npm run rendu` avant de
fabriquer le site : si un contrôle échoue, rien n'est publié et la version en ligne reste intacte.
Réglage à faire une fois : dépôt → Settings → Pages → Source : « GitHub Actions ».

## Technologies

React 19, TypeScript, Three.js, React Three Fiber, Drei, @react-three/postprocessing (bloom,
vignette), Zustand (coups de cœur, interface, navigation), Tailwind CSS 4, Vite.

## Organisation du code

```
src/
  config.ts        LE SEUL FICHIER À REMPLIR : nom, adresse, identifiant Amazon, coordonnées
  data/
    products.ts    catalogue (36 produits) : gamme (tier) et mot-clé couvert, aucun prix
    amazon.ts      les 36 liens affiliés + repli vers une recherche Amazon étiquetée
    aisles.ts      les 5 rayons : ancre publique, texte de référencement, plan 3D
    guides.ts      les 4 guides de l'Espace Inspiration
    layout.ts      emplacements 3D des produits
  state/           ui.ts (vues, ancres, routage), nav.ts (visiteur, déplacements), shop.ts (coups de cœur)
  lib/             textures procédurales, musique Web Audio, recherche, détection WebGL
  three/
    models/        modèles procéduraux des produits
    store/         salle, arche, sapin central, panneaux, emplacements produits
    aisles/        décor des cinq rayons
    core/          caméra à la première personne, neige, fusion des maillages statiques
    StoreScene.tsx scène complète avec chargement progressif
    ProductViewer  visionneuse 3D des fiches + studio de miniatures
    HeroScene.tsx  visuel 3D de la page d'accueil
  components/
    pages/         Home, Store (3D + repli 2D), Rayons, Inspiration
    hud/           interface de la visite : mini-carte, joystick, recherche, menu des rayons
    ui/            fiche produit, carte produit, bouton Amazon, en-tête, pied, fenêtres de confiance
scripts/           les trois contrôles automatiques
```

## Fonctionnalités

- **Visite 3D** : ZQSD/WASD, flèches (avancer/tourner), Maj pour accélérer, glisser pour regarder,
  molette ou pincement pour zoomer. Panneaux suspendus, médaillons au sol, poteau indicateur, menu
  et mini-carte emmènent vers un rayon par un déplacement fluide. Bouton « Retour à l'entrée ».
  Collisions avec les présentoirs.
- **Mobile d'abord** : joystick tactile, regard au doigt, pincement, menu en feuille, champ de
  vision élargi en portrait. C'est là qu'arrive l'essentiel du trafic Pinterest.
- **Produits** : survol (anneau doré, info-bulle avec la gamme), fiche avec modèle 3D orientable,
  variantes qui changent la couleur du modèle, coups de cœur, suggestions « pour compléter le look »
  (levier n° 2 du dossier : la commission porte sur tout le panier Amazon), bouton « Voir dans la
  boutique 3D ».
- **Affiliation** : bouton « Voir sur Amazon » en `target="_blank" rel="sponsored noopener"`,
  identifiant de suivi ajouté automatiquement s'il manque dans un lien collé, mention d'affiliation
  en pied de chaque écran et sur chaque fiche, rappel que prix et délais sont à vérifier sur Amazon.
- **Référencement** : titre et description recalculés pour chaque rayon et chaque guide, texte de
  150 mots par rayon, icône d'onglet, balises de partage, `robots.txt`.
- **Performances** : trois niveaux de qualité (détection automatique, réglable), ombres calculées une
  seule fois, fusion automatique des maillages statiques par matériau, ampoules et aiguilles
  instanciées, textures générées sans téléchargement, chargement progressif rayon par rayon,
  gestion de la perte du contexte WebGL.
- **Sans WebGL** : mode plan 2D avec les rayons et leurs produits
  (forçable avec `localStorage.setItem('noel-force-2d', '1')`).

## Remplacer les modèles procéduraux par des GLB

Chaque produit est dessiné par `ProductModel` selon son `kind`. Pour utiliser un fichier GLB/GLTF
optimisé (Draco/Meshopt), remplacer le `case` concerné par un composant qui charge le fichier avec
`useGLTF` de Drei, dans un `<Suspense>`. La hauteur d'affichage vient de `MODEL_HEIGHT` et de
`SLOTS` (`src/data/layout.ts`).

## Règles à ne pas casser

- **Aucun prix** dans la boutique : ils changent chez Amazon plusieurs fois par jour.
- **Aucune photo Amazon** téléchargée ou réutilisée : la boutique montre des représentations 3D.
- **Aucun lien raccourci** (`amzn.to`), aucun lien sans identifiant de suivi.
- **Aucun avis inventé**, aucune note, aucun compte à rebours : les avis se lisent sur Amazon.
- La mention d'affiliation reste visible en bas de chaque écran.
