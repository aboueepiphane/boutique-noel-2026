import { useMemo, useState } from 'react'
import { PRODUCTS, TIER_LABEL, productsOf } from '../../data/products'
import { AISLES, AISLE_BY_ID } from '../../data/aisles'
import { GUIDES } from '../../data/guides'
import { useUI } from '../../state/ui'
import { useNav } from '../../state/nav'
import { Header, Footer } from '../ui/Chrome'
import { ProductCard } from '../ui/ProductCard'
import { AffiliateNotice } from '../ui/Amazon'
import { IconSearch, IconClose, IconCube, IconArrowRight } from '../ui/Icons'
import { searchProducts } from '../../lib/search'
import type { Tier } from '../../data/types'

const TIERS: { id: Tier | 'toutes'; label: string }[] = [
  { id: 'toutes', label: 'Toutes les gammes' },
  { id: 'petit-prix', label: 'Petit prix' },
  { id: 'coeur', label: 'Cœur de gamme' },
  { id: 'premium', label: 'Premium' },
]

/** En-tête du rayon : titre, texte de référencement, entrée 3D. Destination des épingles des vagues 2 et 3. */
function AisleHeader() {
  const aisle = useUI((s) => (s.aisle === 'tous' ? null : AISLE_BY_ID[s.aisle]))
  const travelTo = useNav((s) => s.travelTo)
  const { go, goGuide } = useUI()
  if (!aisle) return null
  const guide = GUIDES.find((g) => g.aisle === aisle.id)
  return (
    <section id={aisle.anchor} className="scroll-mt-24 mt-8 overflow-hidden rounded-[2rem] text-neige"
      style={{ background: `linear-gradient(150deg, ${aisle.color} 0%, #1b120d 130%)` }}>
      <div className="p-7 md:p-12 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-start">
        <div>
          <span className="eyebrow text-or-light/80">{aisle.address}</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2 leading-[1.03]">{aisle.title}</h2>
          <p className="mt-3 font-display text-xl italic text-or-light/90">{aisle.tagline}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            <button className="btn btn-gold" onClick={() => { travelTo(aisle.viewpoint[0], aisle.viewpoint[1], aisle.viewpoint[2]); go('boutique') }}>
              <IconCube width={16} /> Visiter ce rayon en 3D
            </button>
            {guide && (
              <button className="btn btn-ghost" onClick={() => goGuide(guide.anchor)}>
                Lire « {guide.title} » <IconArrowRight width={15} />
              </button>
            )}
          </div>
        </div>
        <p className="text-[0.92rem] leading-relaxed text-neige/70">{aisle.seo}</p>
      </div>
    </section>
  )
}

export function Rayons() {
  const { aisle, goAisleId } = useUI()
  const [q, setQ] = useState('')
  const [tier, setTier] = useState<Tier | 'toutes'>('toutes')

  const list = useMemo(() => {
    const base = aisle === 'tous' ? PRODUCTS : productsOf(aisle)
    return searchProducts(q, base).filter((p) => tier === 'toutes' || p.tier === tier)
  }, [q, aisle, tier])

  const reset = () => { setQ(''); setTier('toutes'); goAisleId('tous') }
  const filtered = Boolean(q) || tier !== 'toutes' || aisle !== 'tous'
  const current = aisle === 'tous' ? null : AISLE_BY_ID[aisle]

  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 md:px-8 pt-10 flex-1">
        <span className="eyebrow text-or">{current ? 'Le rayon' : 'Les cinq rayons'}</span>
        <h1 className="font-display text-5xl md:text-6xl font-semibold mt-2">
          {current ? current.title : 'Toute la boutique'}
        </h1>
        <p className="mt-3 text-encre/65 max-w-2xl">
          {current
            ? `Les pièces du rayon ${current.title}, à voir en 3D puis à commander sur Amazon.`
            : 'Cinq rayons, des sapins à la table de fête. Ouvrez une fiche pour faire tourner la pièce en 3D, puis retrouvez-la sur Amazon.'}
        </p>

        {/* choix du rayon : les 5 ancres du dossier */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-thin" role="group" aria-label="Choisir un rayon">
          {[{ id: 'tous' as const, label: 'Tous les rayons' }, ...AISLES.map((a) => ({ id: a.id, label: `${a.number} · ${a.title}` }))].map((c) => (
            <button key={c.id} onClick={() => goAisleId(c.id)} aria-pressed={aisle === c.id}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition-all ${aisle === c.id ? 'bg-encre text-neige' : 'bg-white ring-1 ring-encre/12 hover:ring-encre/35'}`}>
              {c.label}
            </button>
          ))}
        </div>

        <AisleHeader />

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto] items-end">
          <label className="relative block">
            <span className="sr-only">Rechercher un produit</span>
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-encre/45" />
            <input id="search-input" className="field !pl-12 !py-3.5 !rounded-full" placeholder="Rechercher : boule dorée, guirlande, renne…" value={q} onChange={(e) => setQ(e.target.value)} />
            {q && <button className="icon-btn absolute right-1.5 top-1/2 -translate-y-1/2" onClick={() => setQ('')} aria-label="Effacer"><IconClose width={16} /></button>}
          </label>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin" role="group" aria-label="Filtrer par gamme">
            {TIERS.map((t) => (
              <button key={t.id} onClick={() => setTier(t.id)} aria-pressed={tier === t.id}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm transition-all ${tier === t.id ? 'bg-carmin text-neige' : 'bg-white ring-1 ring-encre/12 hover:ring-encre/35'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-encre/60">
          <span>{list.length} article{list.length > 1 ? 's' : ''}{tier !== 'toutes' ? ` · ${TIER_LABEL[tier]}` : ''}</span>
          {filtered && <button className="underline underline-offset-4 hover:text-carmin" onClick={reset}>Tout afficher</button>}
        </div>

        {list.length ? (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {list.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl bg-creme p-12 text-center">
            <p className="font-display text-3xl">Aucun article ne correspond</p>
            <p className="mt-2 text-encre/60">Essayez un autre mot ou changez de gamme.</p>
            <button className="btn btn-primary mt-6" onClick={reset}>Voir tous les articles</button>
          </div>
        )}
        <AffiliateNotice className="mt-10" />
      </main>
      <Footer />
    </div>
  )
}
