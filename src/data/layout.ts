/**
 * Emplacement de chaque produit dans la boutique 3D.
 * pos = position au sol (ou sur le présentoir), size = hauteur d'affichage voulue (m),
 * rotY = orientation (le devant du modèle regarde +z avant rotation),
 * base = type de support dessiné sous le produit.
 */
export type Base = 'none' | 'pedestal' | 'stump' | 'shelf' | 'table' | 'dais' | 'wall'

export interface Slot {
  productId: string
  pos: [number, number, number]
  rotY: number
  size: number
  base: Base
}

const W = Math.PI / 2 // face à l'est (+x) : produits des allées ouest
const E = -Math.PI / 2 // face à l'ouest (−x) : produits des allées est

export const SLOTS: Slot[] = [
  // Allée 01 — Univers des sapins (estrade enneigée à x ≈ −15)
  { productId: 'sapin-nordmann', pos: [-14.6, 0.25, 3.6], rotY: W, size: 2.05, base: 'none' },
  { productId: 'sapin-enneige', pos: [-14.9, 0.25, 6.6], rotY: W, size: 2.05, base: 'none' },
  { productId: 'sapin-premium', pos: [-16.2, 0.45, 9.4], rotY: W, size: 2.45, base: 'dais' },
  { productId: 'sapin-lumineux', pos: [-14.6, 0.25, 12.4], rotY: W, size: 2.05, base: 'none' },
  { productId: 'mini-sapin', pos: [-11.9, 0.62, 5.2], rotY: W, size: 0.6, base: 'stump' },
  { productId: 'pied-sapin-bois', pos: [-11.9, 0.62, 11.0], rotY: W + 0.4, size: 0.3, base: 'stump' },

  // Allée 02 — Galerie des ornements (vitrine murale à x = −16, table à x = −12.2)
  { productId: 'boules-rouges', pos: [-15.9, 1.42, -14.2], rotY: W, size: 0.4, base: 'shelf' },
  { productId: 'boules-or', pos: [-15.9, 1.42, -12.0], rotY: W, size: 0.4, base: 'shelf' },
  { productId: 'boules-argent', pos: [-15.9, 1.42, -9.8], rotY: W, size: 0.4, base: 'shelf' },
  { productId: 'figurines-suspendues', pos: [-15.9, 1.42, -7.6], rotY: W, size: 0.48, base: 'shelf' },
  { productId: 'guirlande-perles', pos: [-15.9, 1.42, -5.4], rotY: W, size: 0.48, base: 'shelf' },
  { productId: 'boule-personnalisee', pos: [-12.2, 0.92, -13.0], rotY: W, size: 0.44, base: 'table' },
  { productId: 'boules-transparentes', pos: [-12.2, 0.92, -11.0], rotY: W, size: 0.4, base: 'table' },
  { productId: 'etoile-cime', pos: [-12.2, 0.92, -9.0], rotY: W, size: 0.48, base: 'table' },
  { productId: 'flocons-cristal', pos: [-12.2, 0.92, -7.0], rotY: W, size: 0.46, base: 'table' },

  // Allée 03 — Avenue des lumières (fond de boutique)
  { productId: 'guirlande-led-or', pos: [-4.2, 1.0, -18.0], rotY: 0.3, size: 0.46, base: 'pedestal' },
  { productId: 'rideau-lumineux', pos: [-2.4, 0, -21.4], rotY: 0.12, size: 1.9, base: 'none' },
  { productId: 'etoile-lumineuse', pos: [0, 1.0, -18.6], rotY: 0, size: 0.8, base: 'pedestal' },
  { productId: 'projecteur-flocons', pos: [2.8, 0, -21.2], rotY: -0.15, size: 1.0, base: 'none' },
  { productId: 'bougies-led', pos: [4.2, 1.0, -18.0], rotY: -0.3, size: 0.3, base: 'pedestal' },
  { productId: 'renne-lumineux', pos: [-5.4, 0, -22.6], rotY: 0.7, size: 1.3, base: 'none' },

  // Allée 04 — Village enchanté (rebord du diorama à x = 11.6)
  { productId: 'pere-noel', pos: [11.6, 0.95, -15.0], rotY: E, size: 0.75, base: 'none' },
  { productId: 'renne-peluche', pos: [11.6, 0.95, -13.3], rotY: E, size: 0.68, base: 'none' },
  { productId: 'bonhomme-neige', pos: [11.6, 0.95, -11.6], rotY: E, size: 0.62, base: 'none' },
  { productId: 'creche', pos: [11.6, 0.95, -9.9], rotY: E, size: 0.58, base: 'none' },
  { productId: 'casse-noisette', pos: [11.6, 0.95, -8.2], rotY: E, size: 0.74, base: 'none' },
  { productId: 'lutin', pos: [11.6, 0.95, -6.5], rotY: E, size: 0.58, base: 'none' },
  { productId: 'carrousel', pos: [11.6, 0.95, -4.8], rotY: E, size: 0.56, base: 'none' },

  // Allée 05 — Maison des festivités (table de fête, cheminée, consoles)
  { productId: 'centre-table', pos: [14.6, 0.8, 8.0], rotY: E, size: 0.3, base: 'none' },
  { productId: 'vaisselle-festive', pos: [14.1, 0.8, 6.2], rotY: E, size: 0.15, base: 'none' },
  { productId: 'nappe-lin', pos: [11.4, 0.88, 10.6], rotY: E, size: 0.22, base: 'none' },
  { productId: 'rubans-velours', pos: [11.4, 0.88, 4.9], rotY: E, size: 0.12, base: 'none' },
  { productId: 'couronne-porte', pos: [19.22, 1.72, 8.0], rotY: E, size: 0.8, base: 'wall' },
  { productId: 'chaussette-brodee', pos: [17.6, 0, 5.0], rotY: E - 0.3, size: 0.6, base: 'none' },
  { productId: 'coffret-cadeau', pos: [17.4, 0, 11.6], rotY: E + 0.4, size: 0.34, base: 'none' },
  { productId: 'deco-murale', pos: [11.4, 0.88, 11.8], rotY: E, size: 0.62, base: 'none' },
]

export const SLOT_BY_PRODUCT: Record<string, Slot> = Object.fromEntries(SLOTS.map((s) => [s.productId, s]))

/** Point de vue pour admirer un produit précis : 2,6 m devant lui, regard vers lui. */
export const viewpointFor = (s: Slot): [number, number, number, number] => {
  const dist = s.size > 1.5 ? 4.2 : s.size > 0.7 ? 3.0 : 2.3
  const fx = Math.sin(s.rotY)
  const fz = Math.cos(s.rotY)
  const x = s.pos[0] + fx * dist
  const z = s.pos[2] + fz * dist
  const yaw = Math.atan2(-(s.pos[0] - x), -(s.pos[2] - z))
  // inclinaison : viser le centre du produit depuis 1,65 m
  const targetY = s.pos[1] + s.size * 0.55
  const pitch = Math.atan2(targetY - 1.65, dist)
  return [x, z, yaw, pitch]
}

