import { useEffect, useRef, useState } from 'react'
import { PRODUCT_BY_ID, TIER_LABEL } from '../../data/products'
import { AISLE_BY_ID } from '../../data/aisles'
import { SLOT_BY_PRODUCT, viewpointFor } from '../../data/layout'
import { useNav } from '../../state/nav'
import { useUI } from '../../state/ui'
import { useShop } from '../../state/shop'
import { searchProducts } from '../../lib/search'
import { Thumb } from '../ui/Thumb'
import { IconSearch, IconClose, IconHeart } from '../ui/Icons'

/** Recherche et favoris depuis la boutique 3D : un clic emmène devant le produit. */
export function SearchOverlay({ mode, onClose }: { mode: 'recherche' | 'favoris'; onClose: () => void }) {
  const [tab, setTab] = useState(mode)
  const [q, setQ] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const favorites = useShop((s) => s.favorites)
  const travelTo = useNav((s) => s.travelTo)
  const openProduct = useUI((s) => s.openProduct)
  useEffect(() => { if (tab === 'recherche') input.current?.focus() }, [tab])
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const results = tab === 'recherche' ? (q.trim() ? searchProducts(q) : []) : favorites.map((f) => PRODUCT_BY_ID[f]).filter(Boolean)
  const goTo = (id: string) => {
    const slot = SLOT_BY_PRODUCT[id]
    if (slot) {
      const [x, z, yaw, pitch] = viewpointFor(slot)
      travelTo(x, z, yaw, pitch)
    }
    onClose()
  }
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-3 pt-20 md:pt-24" role="dialog" aria-modal="true" aria-label="Recherche dans la boutique">
      <button className="absolute inset-0 bg-encre/40 fade-in" onClick={onClose} aria-label="Fermer" />
      <div className="relative w-full max-w-xl glass rounded-3xl p-4 slide-up">
        <div className="flex items-center gap-2 mb-3">
          {(['recherche', 'favoris'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm ${tab === t ? 'bg-or text-encre font-semibold' : 'text-neige/70 hover:text-neige'}`}>
              {t === 'recherche' ? 'Rechercher' : `Coups de cœur (${favorites.length})`}
            </button>
          ))}
          <button className="icon-btn ml-auto" onClick={onClose} aria-label="Fermer"><IconClose /></button>
        </div>
        {tab === 'recherche' && (
          <label className="relative block mb-3">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neige/50" />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Que cherchez-vous ? (ex. : étoile, renne, bougie)"
              className="w-full rounded-full bg-white/10 border border-white/15 pl-12 pr-4 py-3 text-neige placeholder:text-neige/45 outline-none focus:border-or" />
          </label>
        )}
        <ul className="max-h-[56vh] overflow-y-auto scrollbar-thin space-y-1">
          {results.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-white/5">
              <Thumb product={p} className="w-14 h-14 rounded-xl shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg font-semibold leading-tight truncate">{p.name}</div>
                <div className="text-xs text-neige/60">{AISLE_BY_ID[p.aisle].address} · {TIER_LABEL[p.tier]}</div>
              </div>
              <button className="btn btn-sm btn-gold !px-3" onClick={() => goTo(p.id)}>Y aller</button>
              <button className="btn btn-sm btn-ghost !px-3" onClick={() => { onClose(); openProduct(p.id) }}>Fiche</button>
            </li>
          ))}
          {tab === 'recherche' && q.trim() && results.length === 0 && <li className="p-4 text-center text-neige/60">Aucun produit ne correspond à « {q} ».</li>}
          {tab === 'recherche' && !q.trim() && <li className="p-4 text-center text-sm text-neige/55">Tapez un mot : le produit vous attend dans son rayon.</li>}
          {tab === 'favoris' && results.length === 0 && <li className="p-6 text-center text-neige/60 flex flex-col items-center gap-2"><IconHeart className="text-or" />Touchez le cœur d’une fiche produit pour le garder ici.</li>}
        </ul>
      </div>
    </div>
  )
}
