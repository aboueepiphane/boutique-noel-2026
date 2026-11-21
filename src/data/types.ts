export type AisleId = 'sapins' | 'ornements' | 'lumieres' | 'village' | 'maison'

/** Type de modèle 3D procédural utilisé pour représenter un produit. */
export type ModelKind =
  | 'tree' | 'snowTree' | 'miniTree' | 'ledTree' | 'treeStand' | 'premiumTree'
  | 'bauble' | 'clearBauble' | 'customBauble' | 'star' | 'snowflake' | 'hangingFigure' | 'beadGarland'
  | 'ledString' | 'lightCurtain' | 'lightStar' | 'projector' | 'ledCandle' | 'outdoorDeer'
  | 'santa' | 'reindeer' | 'snowman' | 'elf' | 'nativity' | 'nutcracker' | 'carousel'
  | 'wreath' | 'centerpiece' | 'tablecloth' | 'dinnerware' | 'stocking' | 'giftBox' | 'ribbon' | 'wallDecor'

export interface VariantOption {
  id: string
  label: string
  /** Couleur appliquée au modèle 3D quand l'option est choisie. */
  color?: string
}

export interface VariantGroup {
  name: string
  options: VariantOption[]
}

/** Gamme de prix du produit sur Amazon, au sens du dossier : < 25 €, 25-80 €, > 80 €. */
export type Tier = 'petit-prix' | 'coeur' | 'premium'

export interface Product {
  id: string
  name: string
  aisle: AisleId
  kind: ModelKind
  tier: Tier
  /** Mot-clé du référentiel que ce produit couvre. Sert au contrôle « épingle = boutique ». */
  keyword: string
  short: string
  description: string
  details: string[]
  variants: VariantGroup[]
  color: string
  accent?: string
  bestseller?: boolean
  isNew?: boolean
  /** Le produit est-il intéressant à faire tourner en 3D dans la fiche ? */
  rotatable: boolean
  related: string[]
}

export interface Aisle {
  id: AisleId
  number: string
  /** Ancre publique du rayon, destination des épingles : #sapins, #guirlandes… */
  anchor: string
  title: string
  address: string
  tagline: string
  /** Texte de référencement du rayon (environ 150 mots). */
  seo: string
  color: string
  /** Centre de la zone dans la boutique (x, z). */
  center: [number, number]
  /** Point où se place le visiteur pour découvrir le rayon (x, z) et direction (yaw en radians). */
  viewpoint: [number, number, number]
}
