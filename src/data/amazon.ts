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
  'mini-sapin':            'https://www.amazon.fr/dp/B0FGX34XX2?tag=noelmerveille-21',
  'sapin-lumineux':        'https://www.amazon.fr/dp/B08G8598BJ?tag=noelmerveille-21',
  'pied-sapin-bois':       'https://www.amazon.fr/dp/B0HNPHG3ZL?tag=noelmerveille-21',
  'sapin-premium':         'https://www.amazon.fr/dp/B0CJ2GQPP8?tag=noelmerveille-21',
  'boules-rouges':         'https://www.amazon.fr/dp/B0FDWXK1TS?tag=noelmerveille-21',
  'boules-or':             'https://www.amazon.fr/dp/B093LDWD3D?tag=noelmerveille-21',
  'boules-argent':         'https://www.amazon.fr/dp/B015CLYJHG?tag=noelmerveille-21',
  'boules-transparentes':  'https://www.amazon.fr/dp/B077TJBWMP?tag=noelmerveille-21',
  'boule-personnalisee':   'https://www.amazon.fr/dp/B0CH9ZJRRH?tag=noelmerveille-21',
  'etoile-cime':           'https://www.amazon.fr/dp/B09F2VYJRX?tag=noelmerveille-21',
  'flocons-cristal':       'https://www.amazon.fr/dp/B0B74DFDT5?tag=noelmerveille-21',
  'figurines-suspendues':  'https://www.amazon.fr/dp/B096S5NFN4?tag=noelmerveille-21',
  'guirlande-perles':      'https://www.amazon.fr/dp/B0F9XNSVVY?tag=noelmerveille-21',
  'guirlande-led-or':      'https://www.amazon.fr/dp/B08G8RCVST?tag=noelmerveille-21',
  'rideau-lumineux':       'https://www.amazon.fr/dp/B0H1RM1VJ6?tag=noelmerveille-21',
  'etoile-lumineuse':      'https://www.amazon.fr/dp/B0H9SC49SP?tag=noelmerveille-21',
  'projecteur-flocons':    'https://www.amazon.fr/dp/B0H9Y39QZ5?tag=noelmerveille-21',
  'bougies-led':           'https://www.amazon.fr/dp/B07C3CKYWV?tag=noelmerveille-21',
  'renne-lumineux':        'https://www.amazon.fr/dp/B0DLTYPF4Q?tag=noelmerveille-21',
  'pere-noel':             'https://www.amazon.fr/dp/B0HF73TQCW?tag=noelmerveille-21',
  'renne-peluche':         'https://www.amazon.fr/dp/B0FB2PVQ4R?tag=noelmerveille-21',
  'bonhomme-neige':        'https://www.amazon.fr/dp/B0F93XGG92?tag=noelmerveille-21',
  'lutin':                 'https://www.amazon.fr/dp/B09CPMCJXS?tag=noelmerveille-21',
  'creche':                'https://www.amazon.fr/dp/B07K8QSM34?tag=noelmerveille-21',
  'casse-noisette':        'https://www.amazon.fr/dp/B07YQ2P3XV?tag=noelmerveille-21',
  'carrousel':             'https://www.amazon.fr/dp/B01N8QYFH4?tag=noelmerveille-21',
  'couronne-porte':        'https://www.amazon.fr/dp/B0HJVBCRHR?tag=noelmerveille-21',
  'centre-table':          'https://www.amazon.fr/dp/B0DRVPMLSR?tag=noelmerveille-21',
  'nappe-lin':             'https://www.amazon.fr/dp/B0C9HQ3K4K?tag=noelmerveille-21',
  'vaisselle-festive':     'https://www.amazon.fr/dp/B0H8RKQ9KN?tag=noelmerveille-21',
  'chaussette-brodee':     'https://www.amazon.fr/dp/B0FNQP7S3K?tag=noelmerveille-21',
  'coffret-cadeau':        'https://www.amazon.fr/dp/B0H4R5C2Z8?tag=noelmerveille-21',
  'rubans-velours':        'https://www.amazon.fr/dp/B0HCV3XFJF?tag=noelmerveille-21',
  'deco-murale':           'https://www.amazon.fr/dp/B0HNCV5H9D?tag=noelmerveille-21',
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
