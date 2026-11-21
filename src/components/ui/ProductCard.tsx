import type { Product } from '../../data/types'
import { TIER_LABEL } from '../../data/products'
import { AISLE_BY_ID } from '../../data/aisles'
import { useShop } from '../../state/shop'
import { useUI } from '../../state/ui'
import { Thumb } from './Thumb'
import { AmazonButton } from './Amazon'
import { IconHeart } from './Icons'

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const fav = useShop((s) => s.favorites.includes(product.id))
  const toggleFavorite = useShop((s) => s.toggleFavorite)
  const openProduct = useUI((s) => s.openProduct)
  const notify = useUI((s) => s.notify)
  const aisle = AISLE_BY_ID[product.aisle]
  return (
    <article className="group relative flex flex-col rounded-2xl bg-white/70 ring-1 ring-encre/8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(27,18,13,.55)] hover:ring-or/50">
      <button className="relative block text-left" onClick={() => openProduct(product.id)} aria-label={`Découvrir ${product.name}`}>
        <Thumb product={product} className={`${compact ? 'aspect-square' : 'aspect-[4/5]'} transition-transform duration-500 group-hover:scale-[1.03]`} />
        <span className="absolute left-3 bottom-3 flex flex-wrap gap-1.5">
          <span className="eyebrow !text-[0.58rem] !tracking-[0.18em] rounded-full bg-encre/80 text-neige px-2.5 py-1 backdrop-blur">{TIER_LABEL[product.tier]}</span>
          {product.isNew && <span className="eyebrow !text-[0.58rem] !tracking-[0.18em] rounded-full bg-sapin text-neige px-2.5 py-1">Nouveau</span>}
        </span>
      </button>
      <button
        onClick={() => { toggleFavorite(product.id); notify(fav ? 'Retiré de vos coups de cœur' : 'Gardé dans vos coups de cœur') }}
        className={`icon-btn absolute right-2.5 top-2.5 bg-white/85 backdrop-blur ${fav ? 'text-carmin' : 'text-encre/70 hover:text-carmin'}`}
        aria-label={fav ? 'Retirer des coups de cœur' : 'Garder dans mes coups de cœur'} aria-pressed={fav}
      >
        <IconHeart filled={fav} width={18} height={18} />
      </button>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="eyebrow !text-[0.6rem] text-bois/80">{aisle.number} · {aisle.title}</span>
        <h3 className="font-display text-[1.35rem] font-semibold leading-tight">
          <button onClick={() => openProduct(product.id)} className="text-left hover:text-carmin transition-colors">{product.name}</button>
        </h3>
        <p className="text-sm text-encre/65 leading-snug">{product.short}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          <AmazonButton product={product} size="sm" className="!px-3.5" />
          <button className="btn btn-sm btn-outline !px-3" onClick={() => openProduct(product.id)}>Voir en 3D</button>
        </div>
      </div>
    </article>
  )
}
