import { useEffect, useRef } from 'react'
import { GUIDES } from '../../data/guides'
import { AISLE_BY_ID } from '../../data/aisles'
import { productsOf } from '../../data/products'
import { useUI } from '../../state/ui'
import { Header, Footer } from '../ui/Chrome'
import { Thumb } from '../ui/Thumb'
import { IconArrowRight, IconCube } from '../ui/Icons'
import type { Guide } from '../../data/guides'

/**
 * L'Espace Inspiration : les 4 guides, destinations des épingles de la vague 1.
 * Chaque guide est ancré (#guide-sapin…) et se termine par un renvoi vers son rayon.
 */
function GuideBlock({ guide, highlight }: { guide: Guide; highlight: boolean }) {
  const { goAisle, openProduct } = useUI()
  const aisle = AISLE_BY_ID[guide.aisle]
  const items = productsOf(guide.aisle).slice(0, 4)
  return (
    <section id={guide.anchor} className="scroll-mt-24">
      <div className={`rounded-[2rem] p-7 md:p-12 ring-1 transition-shadow ${highlight ? 'bg-white ring-or/60 shadow-[0_30px_70px_-40px_rgba(27,18,13,.5)]' : 'bg-white/60 ring-encre/8'}`}>
        <span className="eyebrow text-or">Guide {guide.number}</span>
        <h2 className="font-display text-3xl md:text-[2.75rem] font-semibold mt-2 leading-[1.05]">{guide.title}</h2>
        <p className="mt-2 font-display text-xl italic text-bois">{guide.tagline}</p>
        <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-encre/75">{guide.intro}</p>

        <ol className={`mt-9 grid gap-5 ${guide.items.length > 5 ? 'md:grid-cols-2' : 'md:grid-cols-2'}`}>
          {guide.items.map((it, i) => (
            <li key={it.title} className="flex gap-4">
              {guide.numbered && (
                <span className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-encre text-neige font-display text-lg font-semibold">{i + 1}</span>
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-[1.05rem] leading-snug">{it.title}</h3>
                <p className="mt-1 text-[0.92rem] leading-relaxed text-encre/70">{it.text}</p>
                {it.colors && (
                  <ul className="mt-3 flex flex-wrap gap-3">
                    {it.colors.map((c) => (
                      <li key={c.name} className="flex flex-col items-center gap-1 w-[64px] text-center">
                        <span className="h-9 w-9 rounded-full ring-1 ring-encre/15" style={{ background: c.hex }} />
                        <span className="text-[0.68rem] leading-tight text-encre/65">{c.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 border-t border-encre/10 pt-7 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <span className="eyebrow text-bois">Pour passer à la pratique</span>
            <p className="mt-1 text-encre/75">Le rayon <b>{aisle.title}</b> réunit les pièces dont parle ce guide.</p>
          </div>
          <button className="btn btn-primary justify-self-start md:justify-self-end" onClick={() => goAisle(aisle.anchor)}>
            Voir le rayon {aisle.title} <IconArrowRight width={16} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-3">
          {items.map((p) => (
            <button key={p.id} onClick={() => openProduct(p.id)} className="group text-left" aria-label={`Découvrir ${p.name}`}>
              <Thumb product={p} className="aspect-square rounded-xl ring-1 ring-encre/8 group-hover:ring-or transition" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Inspiration() {
  const { guide, go, goGuide } = useUI()
  const scrolled = useRef<string | null>(null)

  // Épingle de la vague 1 → l'ancre #guide-… doit amener directement au bon guide.
  useEffect(() => {
    if (!guide || scrolled.current === guide) return
    scrolled.current = guide
    const el = document.getElementById(guide)
    if (!el) return
    requestAnimationFrame(() => {
      // scrollIntoView manque dans certains environnements (DOM simulé, vieux WebView)
      try { el.scrollIntoView?.({ behavior: 'smooth', block: 'start' }) } catch { /* sans défilement */ }
    })
  }, [guide])

  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 md:px-8 pt-10 flex-1">
        <span className="eyebrow text-or">Espace Inspiration</span>
        <h1 className="font-display text-5xl md:text-6xl font-semibold mt-2">Décorer sans se tromper</h1>
        <p className="mt-3 text-encre/65 max-w-2xl">Quatre guides courts, écrits pour être lus avant d’acheter : la méthode pour le sapin, les palettes de couleurs de la saison, les erreurs qui gâchent un salon, et les styles de l’hiver.</p>

        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Les guides">
          {GUIDES.map((g) => (
            <button key={g.anchor} onClick={() => goGuide(g.anchor)}
              className={`rounded-full px-4 py-2 text-sm transition-all ${guide === g.anchor ? 'bg-encre text-neige' : 'bg-white ring-1 ring-encre/12 hover:ring-encre/35'}`}>
              {g.number} · {g.title}
            </button>
          ))}
        </nav>

        <div className="mt-10 space-y-10">
          {GUIDES.map((g) => <GuideBlock key={g.anchor} guide={g} highlight={guide === g.anchor} />)}
        </div>

        <div className="mt-14 rounded-[2rem] bg-sapin-deep text-neige p-8 md:p-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Et maintenant, la visite</h2>
          <p className="mt-3 text-neige/70 max-w-xl mx-auto">Tous les produits cités se touchent et se tournent dans la boutique en 3D, rayon par rayon.</p>
          <button className="btn btn-gold mt-7" onClick={() => go('boutique')}><IconCube width={17} /> Entrer dans la boutique</button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
