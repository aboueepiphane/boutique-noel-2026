import type { Aisle, AisleId } from './types'

/**
 * Plan de la boutique (unités = mètres).
 * La salle s'étend de x = -20 à 20 et de z = -26 à 22. L'entrée est au sud (z = 22),
 * le grand sapin au centre (0, 0). Yaw = 0 regarde vers le fond (z négatif).
 *
 * ATTENTION — identifiants internes et ancres publiques ne coïncident pas.
 * Les identifiants (`id`) datent de la première version et sont utilisés partout
 * dans la 3D (composants d'allées, emplacements produits). Les ancres (`anchor`)
 * sont celles imposées par le dossier : ce sont elles que visent les épingles
 * Pinterest. La correspondance est faite une seule fois, ici et dans ANCHOR_TO_AISLE.
 *
 *   id interne   ancre publique   rayon du dossier
 *   sapins    →  #sapins          Sapins
 *   lumieres  →  #guirlandes      Guirlandes & LED
 *   ornements →  #boules          Boules & ornements
 *   village   →  #figurines       Figurines & villages
 *   maison    →  #table           Table & extérieur
 */
export const AISLES: Aisle[] = [
  {
    id: 'sapins',
    number: '01',
    anchor: 'sapins',
    title: 'Sapins',
    address: 'Rayon 01 — Sapins',
    tagline: 'Une forêt enneigée, des sapins pour chaque intérieur.',
    color: '#2f5d46',
    center: [-14, 8],
    viewpoint: [-7.5, 8, Math.PI / 2],
    seo:
      'Le rayon Sapins réunit les sapins de Noël artificiels que l’on garde plusieurs années : le grand Nordmann au port large, ' +
      'le sapin floqué neige dont le floquage est fixé à la main, le sapin lumineux déjà équipé de ses micro-LED blanc chaud, ' +
      'et le petit sapin de table pour une entrée, un bureau ou un studio. Chaque modèle existe en plusieurs hauteurs, de 150 cm ' +
      'à 240 cm : mesurez la hauteur sous plafond avant de choisir, et comptez vingt centimètres pour la cime. Un sapin dense ' +
      'demande moins de décorations qu’un sapin clairsemé, car ses branches remplissent déjà le volume. Le pied est le détail que ' +
      'l’on oublie : un pied métal large tient un arbre de deux mètres sans se renverser, et une jupe de sapin tricotée cache le ' +
      'socle tout en réchauffant l’ensemble. Promenez-vous dans le rayon en 3D, approchez chaque sapin, faites-le tourner, puis ' +
      'ouvrez sa fiche pour le retrouver sur Amazon.',
  },
  {
    id: 'lumieres',
    number: '02',
    anchor: 'guirlandes',
    title: 'Guirlandes & LED',
    address: 'Rayon 02 — Guirlandes & LED',
    tagline: 'Guirlandes, rideaux et étoiles qui scintillent.',
    color: '#b8914a',
    center: [0, -20],
    viewpoint: [0, -12.8, 0],
    seo:
      'Le rayon Guirlandes & LED rassemble tout ce qui éclaire la maison en décembre : guirlande lumineuse à fil d’or presque ' +
      'invisible le jour, rideau lumineux en cascade pour une fenêtre, étoile en rotin à suspendre, projecteur de flocons et ' +
      'bougies LED en cire véritable. Deux chiffres suffisent à choisir : la longueur, environ cent LED par mètre de fenêtre, et ' +
      'la température de lumière. Le blanc chaud, autour de 2 700 K, réchauffe un salon ; le blanc froid convient mieux à une ' +
      'façade enneigée. Pour l’extérieur, vérifiez la mention IP44 au minimum, et pour une guirlande extérieure, un ' +
      'transformateur basse tension plutôt qu’un branchement direct. Une minuterie intégrée évite d’éteindre chaque soir. ' +
      'Entrez dans l’avenue des lumières en 3D, allumez les vitrines, comparez les ambiances, puis ouvrez la fiche d’un modèle ' +
      'pour le commander sur Amazon.',
  },
  {
    id: 'ornements',
    number: '03',
    anchor: 'boules',
    title: 'Boules & ornements',
    address: 'Rayon 03 — Boules & ornements',
    tagline: 'Verre soufflé, dorures et pièces personnalisées.',
    color: '#8e1b26',
    center: [-14, -10],
    viewpoint: [-7.4, -10, Math.PI / 2],
    seo:
      'Le rayon Boules & ornements est celui qui donne son style au sapin. On y trouve les coffrets de boules de Noël rouge et or, ' +
      'les boules dorées et champagne, les boules argent givré, les boules transparentes à garnir soi-même, la boule ' +
      'personnalisée au prénom, l’étoile de cime en filigrane et les suspensions en bois. La règle la plus simple pour un sapin ' +
      'qui se tient : trois tailles de boules, deux finitions sur trois seulement, brillante, mate ou pailletée, et une seule ' +
      'couleur dominante. Comptez une trentaine de boules pour un sapin de 180 cm, placées en profondeur, près du tronc autant ' +
      'qu’au bout des branches, sinon le sapin paraît plat. Les boules en verre soufflé se rangent dans leur alvéole d’origine. ' +
      'Parcourez la galerie des ornements en 3D, approchez une vitrine, ouvrez une fiche et retrouvez le coffret sur Amazon.',
  },
  {
    id: 'village',
    number: '04',
    anchor: 'figurines',
    title: 'Figurines & villages',
    address: 'Rayon 04 — Figurines & villages',
    tagline: 'Pères Noël, rennes, lutins et crèches artisanales.',
    color: '#5b3a29',
    center: [14, -10],
    viewpoint: [7.2, -10, -Math.PI / 2],
    seo:
      'Le rayon Figurines & villages réunit les pièces que l’on installe sur une console, un buffet ou un rebord de cheminée : ' +
      'père Noël en velours, renne en bois flotté, bonhomme de neige tricoté, lutin farceur, casse-noisette soldat, carrousel ' +
      'musical animé et crèche de Noël artisanale en bois. Un village de Noël lumineux se compose par étapes plutôt que d’un ' +
      'seul coup : une maison de noël miniature, puis une deuxième, puis les personnages, en gardant la même échelle, sinon ' +
      'l’illusion tombe. Posez le tout sur un tissu clair pour figurer la neige et faites passer les fils derrière les maisons. ' +
      'Les crèches se transmettent : une étable en bois massif supporte vingt saisons de rangement. Visitez le village enchanté ' +
      'en 3D, tournez autour des figurines, ouvrez une fiche et commandez la pièce sur Amazon.',
  },
  {
    id: 'maison',
    number: '05',
    anchor: 'table',
    title: 'Table & extérieur',
    address: 'Rayon 05 — Table & extérieur',
    tagline: 'La table de fête, les couronnes et la déco extérieure.',
    color: '#6e4b2a',
    center: [14, 8],
    viewpoint: [8.4, 8, -Math.PI / 2],
    seo:
      'Le rayon Table & extérieur s’occupe du jour même : déco table de noël avec nappe en lin brodée, service de table houx et ' +
      'or, centre de table chandelier, rubans de velours, chaussette de Noël brodée pour la cheminée, couronne de porte ' +
      'forestière et décoration murale à suspendre. Pour un centre de table réussi, restez bas, vingt-cinq centimètres au ' +
      'maximum, afin que les convives se voient, et long plutôt que large. Trois matières suffisent : du végétal, du métal et ' +
      'du textile. Côté déco noël extérieur et balcon, une couronne de porte et deux lanternes font plus d’effet qu’une ' +
      'accumulation, et tout ce qui reste dehors doit résister à la pluie. Entrez dans la maison des festivités en 3D, faites ' +
      'le tour de la table dressée, ouvrez une fiche et retrouvez la pièce sur Amazon.',
  },
]

export const AISLE_BY_ID: Record<AisleId, Aisle> = Object.fromEntries(
  AISLES.map((a) => [a.id, a]),
) as Record<AisleId, Aisle>

/** Ancre publique (#sapins, #guirlandes…) → identifiant interne de l'allée. */
export const ANCHOR_TO_AISLE: Record<string, AisleId> = Object.fromEntries(
  AISLES.map((a) => [a.anchor, a.id]),
)

/** Point de départ : juste derrière l'arche d'entrée, face au grand sapin. */
export const ENTRANCE_VIEW: [number, number, number] = [0, 20.6, 0]

/** Emprise de chaque allée au sol : [x0, z0, largeur, profondeur] (m). Sert à la mini-carte et au « Vous êtes ». */
export const AISLE_ZONES: Record<AisleId, [number, number, number, number]> = {
  sapins: [-20, 1.4, 9, 13.8],
  ornements: [-20, -16, 9, 12.4],
  lumieres: [-9, -26, 18, 10.5],
  village: [11, -16, 9, 12.4],
  maison: [11, 1.4, 9, 13.8],
}

export const ROOM = { minX: -20, maxX: 20, minZ: -26, maxZ: 22, height: 7.5 }
