import { amazonUrl } from '../../data/amazon'
import { AFFILIATE_NOTICE } from '../../config'
import type { Product } from '../../data/types'
import { IconArrowRight } from './Icons'

/**
 * Bouton « Voir sur Amazon ».
 * Toujours un nouvel onglet, toujours rel="sponsored noopener" (exigence du
 * programme Partenaires et du moteur de recherche), jamais de prix affiché.
 */
export function AmazonButton({
  product,
  size = 'md',
  className = '',
}: {
  product: Product
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const cls = size === 'sm' ? 'btn btn-sm' : size === 'lg' ? 'btn !py-4 !px-7 text-[0.82rem]' : 'btn'
  return (
    <a
      href={amazonUrl(product.id)}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`${cls} btn-primary ${className}`}
      aria-label={`Voir « ${product.name} » sur Amazon (nouvel onglet)`}
    >
      Voir sur Amazon <IconArrowRight width={size === 'sm' ? 15 : 17} />
    </a>
  )
}

/** Mention d'affiliation, à afficher en pied de chaque écran (exigence B3 du dossier). */
export function AffiliateNotice({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <p className={`text-xs leading-relaxed ${light ? 'text-neige/50' : 'text-encre/55'} ${className}`}>
      {AFFILIATE_NOTICE}
    </p>
  )
}

/** Rappel affiché sur les fiches : les prix et les délais vivent chez Amazon, pas ici. */
export function PriceDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-encre/60 leading-relaxed ${className}`}>
      Prix, disponibilité et délais de livraison sont à vérifier sur Amazon : ils changent plusieurs fois par jour et ne
      sont donc pas affichés ici.
    </p>
  )
}
