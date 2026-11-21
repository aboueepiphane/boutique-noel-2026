import type { AisleId } from './types'

/**
 * L'Espace Inspiration : les 4 guides exigés par le dossier (élément 3 de la grille B3).
 * Ce sont les destinations des épingles de la vague 1 (informationnelle).
 * Chaque guide a son ancre publique et renvoie vers le rayon concerné.
 */
export interface GuideItem {
  title: string
  text: string
  /** Pastilles de couleur, pour le guide des palettes uniquement. */
  colors?: { name: string; hex: string }[]
}

export interface Guide {
  /** Ancre publique, destination des épingles : #guide-sapin, #guide-palettes… */
  anchor: string
  number: string
  title: string
  /** Promesse courte, reprise dans le titre de l'épingle. */
  tagline: string
  intro: string
  /** Numérotation des éléments : étapes et erreurs sont numérotées, palettes et styles non. */
  numbered: boolean
  items: GuideItem[]
  /** Rayon vers lequel le guide renvoie à la fin. */
  aisle: AisleId
  /** Mots-clés informationnels visés (recettes I1 à I4 du dossier). */
  keywords: string[]
}

export const GUIDES: Guide[] = [
  {
    anchor: 'guide-sapin',
    number: '01',
    title: 'Décorer son sapin en 5 étapes',
    tagline: 'La méthode dans l’ordre, sans rien reprendre à la fin.',
    intro:
      'Un sapin raté se reconnaît à une chose : on y est allé par touches, en ajoutant ce qui tombait sous la main. ' +
      'L’ordre ci-dessous évite de tout défaire. Comptez quarante minutes pour un sapin de 180 cm.',
    numbered: true,
    items: [
      {
        title: 'Ouvrir les branches',
        text:
          'Montez le sapin, puis écartez chaque branche une par une, en partant du tronc vers la pointe, et en alternant ' +
          'haut et bas. C’est long et c’est l’étape qui fait tout : un sapin dont les branches restent repliées paraîtra ' +
          'maigre quoi que vous y accrochiez ensuite.',
      },
      {
        title: 'Poser les lumières en premier',
        text:
          'Toujours avant les boules. Branchez la guirlande et allumez-la pendant la pose pour voir les trous. Partez du ' +
          'pied, montez en spirale, et passez le fil derrière les branches, près du tronc : la lumière éclaire alors le ' +
          'sapin de l’intérieur au lieu de pendre devant.',
      },
      {
        title: 'Habiller le volume',
        text:
          'Avant les boules, posez ce qui prend de la place : guirlande de perles, rubans en diagonale, grosses pommes de ' +
          'pin. Ces pièces structurent le sapin et vous dispensent d’une vingtaine de boules.',
      },
      {
        title: 'Les boules, en trois tailles',
        text:
          'Les plus grosses en bas, les plus petites vers la cime. Placez-en aussi en profondeur, près du tronc, pas ' +
          'seulement au bout des branches : c’est ce qui donne l’épaisseur. Une trentaine suffit pour 180 cm.',
      },
      {
        title: 'La cime et le pied',
        text:
          'Finissez par l’étoile ou la pointe, puis masquez le socle avec une jupe de sapin ou un grand tissu froissé. ' +
          'Reculez de trois mètres, éteignez la lumière du plafond, et comblez les deux ou trois trous qui apparaissent.',
      },
    ],
    aisle: 'sapins',
    keywords: ['comment décorer son sapin', 'déco sapin étape par étape', 'tuto sapin de noël'],
  },
  {
    anchor: 'guide-palettes',
    number: '02',
    title: 'Les palettes de Noël 2026',
    tagline: 'Cinq accords de couleurs qui tiennent dans un salon.',
    intro:
      'Une palette, ce n’est pas une liste de couleurs qu’on aime : c’est une dominante, une seconde couleur, et un métal. ' +
      'Deux tiers de la dominante, un tiers de la seconde, le métal par touches. Choisissez-en une seule et tenez-la ' +
      'dans toute la pièce, sapin compris.',
    numbered: false,
    items: [
      {
        title: 'Blanc et doré',
        text:
          'La plus facile à réussir dans un intérieur clair. Fonctionne avec un sapin floqué ou vert, et pardonne les ' +
          'mélanges de matières. Ajoutez du crème pour éviter l’effet vitrine de magasin.',
        colors: [
          { name: 'Crème', hex: '#f3efe6' },
          { name: 'Blanc cassé', hex: '#e8e2d5' },
          { name: 'Champagne', hex: '#dcc9a0' },
          { name: 'Doré', hex: '#c9a45c' },
          { name: 'Taupe', hex: '#9a8c78' },
        ],
      },
      {
        title: 'Rouge et or',
        text:
          'L’accord classique, celui des Noëls d’enfance. Il demande du contraste : un rouge profond, carmin ou bordeaux, ' +
          'plutôt qu’un rouge vif, sinon l’ensemble vire au plastique.',
        colors: [
          { name: 'Carmin', hex: '#9b1c23' },
          { name: 'Bordeaux', hex: '#6d1620' },
          { name: 'Or', hex: '#c9a45c' },
          { name: 'Sapin', hex: '#1f4d36' },
          { name: 'Crème', hex: '#f3efe6' },
        ],
      },
      {
        title: 'Scandinave bois clair',
        text:
          'Peu de couleurs, beaucoup de matières : bois brut, lin, laine, verre. C’est la palette la plus sobre, celle ' +
          'qui supporte de rester en place tout l’hiver.',
        colors: [
          { name: 'Lin', hex: '#e5ddcf' },
          { name: 'Bois clair', hex: '#c7a681' },
          { name: 'Vert sauge', hex: '#8fa08b' },
          { name: 'Gris pierre', hex: '#9fa3a0' },
          { name: 'Blanc neige', hex: '#f7f5f0' },
        ],
      },
      {
        title: 'Opéra, velours et bougies',
        text:
          'Les tons profonds d’un salon le soir : velours, laiton, verre fumé. Prévoyez beaucoup de lumière basse, ' +
          'bougies LED ou lampes, sinon la pièce paraît sombre plutôt que feutrée.',
        colors: [
          { name: 'Prune', hex: '#4a2130' },
          { name: 'Velours rouge', hex: '#7c1f2b' },
          { name: 'Laiton', hex: '#b08d57' },
          { name: 'Vert forêt', hex: '#24402f' },
          { name: 'Ivoire', hex: '#efe6d6' },
        ],
      },
      {
        title: 'Céleste bleu nuit',
        text:
          'Bleu profond, argent et étoiles : la palette qui rend le mieux de nuit et derrière une fenêtre. Évitez-la dans ' +
          'une pièce déjà froide ou peu éclairée.',
        colors: [
          { name: 'Bleu nuit', hex: '#1d2b4a' },
          { name: 'Bleu glacier', hex: '#7e9cc0' },
          { name: 'Argent', hex: '#c7ccd3' },
          { name: 'Blanc givre', hex: '#eef2f5' },
          { name: 'Étain', hex: '#8b9199' },
        ],
      },
    ],
    aisle: 'ornements',
    keywords: ['palette noël 2026', 'couleurs déco noël', 'noël blanc et doré idées'],
  },
  {
    anchor: 'guide-erreurs',
    number: '03',
    title: '7 erreurs de déco de Noël à éviter',
    tagline: 'Ce qui gâche un salon, et comment le rattraper en dix minutes.',
    intro:
      'Aucune de ces erreurs ne vient d’un manque de goût : elles viennent toutes d’un réflexe logique qui se retourne ' +
      'contre nous. Les voici dans l’ordre où on les commet.',
    numbered: true,
    items: [
      {
        title: 'Mélanger les températures de lumière',
        text:
          'Une guirlande blanc froid à côté d’une guirlande blanc chaud, et la pièce paraît mal réglée. Choisissez une ' +
          'température, en général le blanc chaud à l’intérieur, et tenez-la partout, sapin, fenêtre et table.',
      },
      {
        title: 'Poser les boules avant les lumières',
        text:
          'On ne peut plus passer le fil près du tronc sans tout décrocher. La guirlande finit alors devant les branches, ' +
          'à plat. Les lumières viennent toujours en premier.',
      },
      {
        title: 'Tout accrocher au bout des branches',
        text:
          'Le sapin devient une silhouette plate avec un trou noir au centre. Il faut placer un tiers des décorations en ' +
          'profondeur, dans l’épaisseur du feuillage.',
      },
      {
        title: 'Une seule taille de boules',
        text:
          'Douze boules identiques créent un motif régulier qui fait sapin de vitrine. Trois diamètres différents ' +
          'suffisent à donner du relief.',
      },
      {
        title: 'Saupoudrer la déco dans toute la pièce',
        text:
          'Un objet par meuble, et rien ne ressort. Mieux vaut trois points forts — le sapin, la cheminée, la table — et ' +
          'laisser le reste nu.',
      },
      {
        title: 'Oublier le pied du sapin',
        text:
          'Le socle en plastique et la multiprise annulent l’effet du reste. Une jupe de sapin, un panier large ou un ' +
          'tissu froissé règlent le problème.',
      },
      {
        title: 'Décorer de jour sans vérifier le soir',
        text:
          'Tout se joue à la lumière du soir, quand les guirlandes sont le seul éclairage. Éteignez le plafonnier, reculez ' +
          'de trois mètres, et corrigez ce qui disparaît ou ce qui éblouit.',
      },
    ],
    aisle: 'sapins',
    keywords: ['erreurs déco noël', 'déco noël réussie', 'astuces déco noël salon'],
  },
  {
    anchor: 'guide-styles',
    number: '04',
    title: '4 styles de Noël tendance',
    tagline: 'Reconnaître le style qui va avec votre intérieur.',
    intro:
      'Le style ne se choisit pas devant un rayon mais devant son salon : il dépend des matières déjà présentes et de la ' +
      'lumière de la pièce. Voici les quatre que l’on verra le plus cet hiver, et à quel intérieur chacun va.',
    numbered: false,
    items: [
      {
        title: 'Scandinave',
        text:
          'Bois clair, lin, laine écrue, verre transparent, très peu de couleurs. Pour un appartement clair aux murs ' +
          'blancs. Avantage : il se démonte sans laisser de vide, car il ressemble au reste de l’année.',
      },
      {
        title: 'Bohème',
        text:
          'Rotin, pampilles, séchés, terracotta et laiton, formes irrégulières. Pour un intérieur déjà chargé en textiles ' +
          'et en plantes. Il supporte le dépareillé, c’est même ce qui le fait tenir.',
      },
      {
        title: 'Opéra',
        text:
          'Velours, pompons, laiton, verre fumé, tons profonds. Pour une pièce aux murs sombres ou aux meubles anciens, ' +
          'éclairée bas. Demande peu d’objets mais de belles matières.',
      },
      {
        title: 'Céleste',
        text:
          'Bleu nuit, argent, étoiles, cristal, effets de givre. Pour une chambre, une fenêtre sur rue ou un intérieur ' +
          'contemporain. C’est le style qui rend le mieux en photo de nuit.',
      },
    ],
    aisle: 'village',
    keywords: ['déco noël scandinave', 'noël bohème', 'noël opéra', 'noël céleste', 'inspiration déco noël'],
  },
]

export const GUIDE_BY_ANCHOR: Record<string, Guide> = Object.fromEntries(GUIDES.map((g) => [g.anchor, g]))
