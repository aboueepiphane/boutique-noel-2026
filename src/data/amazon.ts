import { AMAZON_HOST, AMAZON_TAG } from '../config'
import { PRODUCTS } from './products'

/**
 * Liens affiliés produit par produit.
 *
 * COMMENT REMPLIR (étape PR-03 du dossier) :
 *  1. ouvrir la fiche du produit sur amazon.fr, connecté au compte Partenaires ;
 *  2. barre SiteStripe en haut → « Texte » → copier le lien ;
 *  3. le coller ci-dessous à la place de la chaîne vide.
 *
 * Tant qu'une case est vide, le bouton renvoie vers une recherche Amazon
 * portant le mot-clé du produit, avec votre identifiant de suivi : le bouton
 * fonctionne donc toujours, mais un lien direct convertit bien mieux.
 *
 * Interdits par le dossier : lien raccourci (amzn.to), lien sans identifiant.
 */
export const AMAZON_LINKS: Record<string, string> = {
  'sapin-nordmann':        'https://www.amazon.fr/dp/B07YFR5FJF?tag=noelmerveille-21',
  'sapin-enneige':         'https://www.amazon.fr/dp/B0CG5VZD6P?tag=noelmerveille-21',
  'mini-sapin':            '',
  'sapin-lumineux':        '',
  'pied-sapin-bois':       '',
  'sapin-premium':         '',
  'boules-rouges':         'https://www.amazon.fr/dp/B0FDWXK1TS?tag=noelmerveille-21',
  'boules-or':             'https://www.amazon.fr/dp/B093LDWD3D?tag=noelmerveille-21',
  'boules-argent':         '',
  'boules-transparentes':  '',
  'boule-personnalisee':   '',
  'etoile-cime':           '',
  'flocons-cristal':       '',
  'figurines-suspendues':  '',
  'guirlande-perles':      '',
  'guirlande-led-or':      'https://www.amazon.fr/dp/B08G8RCVST?tag=noelmerveille-21',
  'rideau-lumineux':       'https://www.amazon.fr/dp/B0H1RM1VJ6?tag=noelmerveille-21',
  'etoile-lumineuse':      '',
  'projecteur-flocons':    '',
  'bougies-led':           '',
  'renne-lumineux':        '',
  'pere-noel':             'https://www.amazon.fr/dp/B0HF73TQCW?tag=noelmerveille-21',
  'renne-peluche':         '',
  'bonhomme-neige':        '',
  'lutin':                 '',
  'creche':                'https://www.amazon.fr/dp/B07K8QSM34?tag=noelmerveille-21',
  'casse-noisette':        '',
  'carrousel':             '',
  'couronne-porte':        'https://www.amazon.fr/dp/B0HJVBCRHR?tag=noelmerveille-21',
  'centre-table':          '',
  'nappe-lin':             'https://www.amazon.fr/dp/B0C9HQ3K4K?tag=noelmerveille-21',
  'vaisselle-festive':     '',
  'chaussette-brodee':     '',
  'coffret-cadeau':        '',
  'rubans-velours':        '',
  'deco-murale':           '',
}

/** Lien de repli : une recherche Amazon sur le mot-clé du produit, identifiant inclus. */
const searchUrl = (keyword: string) =>
  `https://${AMAZON_HOST}/s?k=${encodeURIComponent(keyword)}&tag=${encodeURIComponent(AMAZON_TAG)}`

/** Ajoute l'identifiant de suivi à un lien collé qui ne l'aurait pas. */
const withTag = (url: string) => {
  try {
    const u = new URL(url)
    if (!u.searchParams.has('tag')) u.searchParams.set('tag', AMAZON_TAG)
    return u.toString()
  } catch {
    return url
  }
}

export const amazonUrl = (productId: string): string => {
  const direct = AMAZON_LINKS[productId]?.trim()
  if (direct) return withTag(direct)
  const p = PRODUCTS.find((x) => x.id === productId)
  return searchUrl(p ? `${p.name} ${p.keyword}` : 'décoration de noël')
}

/** Produits encore sans lien direct — à afficher pendant la préparation (B2). */
export const missingLinks = () => PRODUCTS.filter((p) => !AMAZON_LINKS[p.id]?.trim()).map((p) => p.id)
