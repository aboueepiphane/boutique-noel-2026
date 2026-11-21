import { useEffect, useState } from 'react'
import { PRODUCT_BY_ID, TIER_LABEL } from '../../data/products'
import { AISLE_BY_ID } from '../../data/aisles'
import { SLOT_BY_PRODUCT, viewpointFor } from '../../data/layout'
import { useUI } from '../../state/ui'
import { useNav } from '../../state/nav'
import { useShop, defaultSelection, selectionColor, type Selection } from '../../state/shop'
import { ProductViewer } from '../../three/ProductViewer'
import { Thumb } from './Thumb'
import { AmazonButton, AffiliateNotice, PriceDisclaimer } from './Amazon'
import { IconClose, IconHeart, IconCube } from './Icons'

/** Fiche produit : visionneuse 3D, variantes, bouton Amazon, suggestions. */
export function ProductPanel() {
  const id = useUI((s) => s.productId)
  const product = id ? PRODUCT_BY_ID[id] : null
  const close = () => useUI.getState().openProduct(null)

  useEffect(() => {
    if (!product) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [product])

  if (!product) return null
  return <PanelBody key={product.id} productId={product.id} onClose={close} />
}

function PanelBody({ productId, onClose }: { productId: string; onClose: () => void }) {
  const product = PRODUCT_BY_ID[productId]
  const [sel, setSel] = useState<Selection>(() => defaultSelection(product))
  const fav = useShop((s) => s.favorites.includes(product.id))
  const toggleFavorite = useShop((s) => s.toggleFavorite)
  const { view, go, notify, openProduct, goAisle } = useUI()
  const travelTo = useNav((s) => s.travelTo)
  const aisle = AISLE_BY_ID[product.aisle]
  const color = selectionColor(product, sel)
  const related = product.related.map((r) => PRODUCT_BY_ID[r]).filter(Boolean)

  const seeInStore = () => {
    const slot = SLOT_BY_PRODUCT[product.id]
    if (!slot) return
    const [x, z, yaw, pitch] = viewpointFor(slot)
    travelTo(x, z, yaw, pitch)
    if (view !== 'boutique') go('boutique')
    else openProduct(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="pp-title">
      <button className="absolute inset-0 bg-encre/60 backdrop-blur-sm fade-in" onClick={onClose} aria-label="Fermer la fiche produit" />
      <div className="relative w-full md:w-[min(1080px,94vw)] h-[94dvh] md:h-[min(88vh,720px)] overflow-hidden rounded-t-3xl md:rounded-3xl bg-neige shadow-2xl slide-up grid grid-rows-[auto_minmax(0,1fr)] md:grid-rows-1 md:grid-cols-[1.05fr_1fr]">
        {/* visionneuse */}
        <div className="relative thumb-bg h-[38dvh] md:h-full min-h-0">
          <ProductViewer product={product} color={color} />
          <div className="pointer-events-none absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[0.7rem] font-semibold text-encre/70 backdrop-blur">
            <IconCube width={15} height={15} /> {product.rotatable ? 'Faites glisser pour tourner · pincez pour zoomer' : 'Faites glisser pour observer'}
          </div>
        </div>
        {/* informations */}
        <div className="flex min-h-0 flex-col overflow-y-auto scrollbar-thin">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-neige/95 backdrop-blur px-6 pt-5 pb-3">
            <button className="eyebrow text-bois hover:text-carmin transition-colors" onClick={() => { onClose(); goAisle(aisle.anchor) }}>
              {aisle.address}
            </button>
            <button className="icon-btn hover:bg-encre/5 -mr-2" onClick={onClose} aria-label="Fermer"><IconClose /></button>
          </div>
          <div className="px-6 pb-6 flex flex-col gap-5">
            <div>
              <h2 id="pp-title" className="font-display text-[2.1rem] md:text-[2.5rem] font-semibold leading-[1.05]">{product.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="eyebrow !text-[0.58rem] rounded-full bg-encre/8 text-encre/70 px-2.5 py-1">{TIER_LABEL[product.tier]}</span>
                {product.isNew && <span className="eyebrow !text-[0.58rem] rounded-full bg-sapin/10 text-sapin px-2.5 py-1">Nouveauté</span>}
              </div>
            </div>
            <p className="text-[0.95rem] leading-relaxed text-encre/80">{product.description}</p>

            {product.variants.map((g) => (
              <fieldset key={g.name}>
                <legend className="eyebrow text-encre/60 mb-2.5">{g.name} : <span className="normal-case tracking-normal text-encre font-semibold text-sm">{g.options.find((o) => o.id === sel[g.name])?.label}</span></legend>
                <div className="flex flex-wrap gap-2">
                  {g.options.map((o) => {
                    const active = sel[g.name] === o.id
                    return (
                      <button key={o.id} onClick={() => setSel({ ...sel, [g.name]: o.id })} aria-pressed={active}
                        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all ${active ? 'border-carmin bg-carmin/5 text-carmin font-semibold ring-2 ring-carmin/15' : 'border-encre/15 hover:border-encre/40'}`}>
                        {o.color && <span className="h-4 w-4 rounded-full ring-1 ring-black/15" style={{ background: o.color }} />}
                        {o.label}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-encre/50">Les variantes font tourner le modèle 3D. Le choix définitif se fait sur la fiche Amazon.</p>
              </fieldset>
            ))}

            <div className="flex flex-wrap items-center gap-3">
              <AmazonButton product={product} className="flex-1 min-w-[200px]" />
              <button className={`icon-btn border ${fav ? 'border-carmin text-carmin bg-carmin/5' : 'border-encre/15 hover:text-carmin'}`}
                onClick={() => { toggleFavorite(product.id); notify(fav ? 'Retiré de vos coups de cœur' : 'Gardé dans vos coups de cœur') }} aria-pressed={fav} aria-label={fav ? 'Retirer des coups de cœur' : 'Garder dans mes coups de cœur'}>
                <IconHeart filled={fav} />
              </button>
            </div>
            <PriceDisclaimer />
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-sm btn-outline" onClick={seeInStore}><IconCube width={16} /> {view === 'boutique' ? 'Me rendre devant ce produit' : 'Voir dans la boutique 3D'}</button>
              <button className="btn btn-sm btn-outline" onClick={() => { onClose(); goAisle(aisle.anchor) }}>Tout le rayon {aisle.title}</button>
            </div>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-encre/75">
              {product.details.map((d) => <li key={d} className="flex gap-2"><span className="text-or">✦</span>{d}</li>)}
            </ul>

            {related.length > 0 && (
              <div className="border-t border-encre/10 pt-5">
                <h3 className="eyebrow text-bois mb-3">Pour compléter le look</h3>
                <div className="grid grid-cols-3 gap-3">
                  {related.map((r) => (
                    <button key={r.id} onClick={() => openProduct(r.id)} className="group text-left">
                      <Thumb product={r} className="aspect-square rounded-xl ring-1 ring-encre/8 group-hover:ring-or transition" />
                      <span className="mt-1.5 block text-[0.8rem] font-semibold leading-tight group-hover:text-carmin">{r.name}</span>
                      <span className="text-xs text-encre/60">{TIER_LABEL[r.tier]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <AffiliateNotice className="border-t border-encre/10 pt-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
