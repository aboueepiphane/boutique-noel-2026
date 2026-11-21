import { Component, Suspense, lazy, useCallback, useEffect, useState, type ReactNode } from 'react'
import { useUI } from '../../state/ui'
import { useNav } from '../../state/nav'
import { hasWebGL } from '../../lib/webgl'
import { AISLES } from '../../data/aisles'
import { productsOf, TIER_LABEL } from '../../data/products'
import { Hud } from '../hud/Hud'
import { LogoMark, Logo } from '../ui/Logo'
import { Thumb } from '../ui/Thumb'
import { IconArrowLeft } from '../ui/Icons'
import type { AisleId } from '../../data/types'

const StoreCanvas = lazy(() => import('../../three/StoreCanvas'))

const TIPS = [
  'Cliquez sur un panneau suspendu pour rejoindre directement une allée.',
  'Chaque produit s’ouvre d’un clic et se fait tourner en 3D.',
  'La mini-carte indique votre position : touchez une allée pour vous y rendre.',
  'Le bouton « Retour à l’entrée » vous ramène sous l’arche à tout moment.',
]

/** Écran de chargement : progression réelle des étapes de construction de la scène. */
function LoadingScreen({ done, total, stage }: { done: number; total: number; stage: string }) {
  const pct = Math.round((done / total) * 100)
  const [tip, setTip] = useState(0)
  useEffect(() => { const t = setInterval(() => setTip((n) => (n + 1) % TIPS.length), 2600); return () => clearInterval(t) }, [])
  return (
    <div className="fixed inset-0 z-[45] flex flex-col items-center justify-center bg-encre text-neige">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(155,28,35,.35),transparent_60%)]" />
      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        <div className="animate-[spin_6s_linear_infinite]"><LogoMark size={76} /></div>
        <Logo light />
        <p className="font-display text-2xl italic text-or-light/90">Nous allumons les guirlandes…</p>
        <div className="w-[min(320px,80vw)]">
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-or to-carmin transition-all duration-300" style={{ width: `${pct}%` }} /></div>
          <div className="mt-2 flex justify-between text-xs text-neige/55"><span>{stage}</span><span>{pct} %</span></div>
        </div>
        <p key={tip} className="text-sm text-neige/60 max-w-sm fade-in">{TIPS[tip]}</p>
      </div>
    </div>
  )
}

/** Mode alternatif sans WebGL : plan illustré de la boutique et liste des produits par allée. */
export function Fallback2D({ reason }: { reason: string }) {
  const { go, openProduct } = useUI()
  const [aisle, setAisle] = useState<AisleId>('sapins')
  const a = AISLES.find((x) => x.id === aisle)!
  const cells: Record<AisleId, string> = { sapins: 'col-start-1 row-start-2', ornements: 'col-start-1 row-start-1', lumieres: 'col-start-2 row-start-1', village: 'col-start-3 row-start-1', maison: 'col-start-3 row-start-2' }
  return (
    <div className="min-h-full bg-encre text-neige">
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-8">
        <div className="flex items-center justify-between">
          <button onClick={() => go('accueil')} className="inline-flex items-center gap-2 text-sm text-neige/70 hover:text-or-light"><IconArrowLeft width={16} /> Accueil</button>
          <Logo light compact />
        </div>
        <div className="mt-8 rounded-2xl bg-white/5 ring-1 ring-or/30 p-4 text-sm text-neige/80">
          <b className="text-or-light">Visite en mode plan.</b> {reason} Vous pouvez parcourir la boutique allée par allée ci-dessous.
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold mt-8">Plan de la boutique</h1>
        <div className="mt-6 grid grid-cols-3 grid-rows-[repeat(2,120px)_60px] gap-3">
          {AISLES.map((x) => (
            <button key={x.id} onClick={() => setAisle(x.id)} className={`${cells[x.id]} rounded-2xl p-3 text-left transition ring-2 ${aisle === x.id ? 'ring-or' : 'ring-transparent hover:ring-or/40'}`} style={{ background: x.color }}>
              <span className="font-display text-3xl text-or-light/60">{x.number}</span>
              <span className="block text-sm font-semibold leading-tight">{x.address.split('— ')[1]}</span>
            </button>
          ))}
          <div className="col-start-2 row-start-2 rounded-full bg-sapin flex items-center justify-center font-display text-lg ring-2 ring-or/50">Grand sapin</div>
          <div className="col-start-2 row-start-3 rounded-xl bg-or/20 flex items-center justify-center eyebrow text-or-light">Entrée</div>
        </div>
        <section className="mt-10">
          <span className="eyebrow text-or">{a.address}</span>
          <h2 className="font-display text-3xl font-semibold mt-1">{a.title}</h2>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {productsOf(aisle).map((p) => (
              <button key={p.id} onClick={() => openProduct(p.id)} className="text-left rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden hover:ring-or/60 transition">
                <Thumb product={p} className="aspect-square" />
                <div className="p-3"><div className="font-display text-lg font-semibold leading-tight">{p.name}</div><div className="text-sm text-or-light">{TIER_LABEL[p.tier]}</div></div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

class GLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(e: unknown) { console.error('[Boutique 3D]', e) }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export function Store() {
  const quality = useUI((s) => s.quality)
  const [progress, setProgress] = useState({ done: 0, total: 8, stage: 'Préparation' })
  const [ready, setReady] = useState(false)
  const [lost, setLost] = useState(false)
  const onProgress = useCallback((done: number, total: number, stage: string) => {
    setProgress({ done, total, stage })
    if (done >= total) setTimeout(() => setReady(true), 450)
  }, [])

  useEffect(() => {
    // Première visite : afficher l'aide une fois la scène prête
    if (!ready) return
    try {
      if (!localStorage.getItem('noel-help-seen')) { useUI.getState().setHelp(true); localStorage.setItem('noel-help-seen', '1') }
    } catch { /* stockage indisponible */ }
  }, [ready])

  useEffect(() => () => { useNav.getState().clearTarget() }, [])

  if (!hasWebGL()) return <Fallback2D reason="Votre navigateur ne prend pas en charge la 3D (WebGL)." />
  if (lost) return <Fallback2D reason="La carte graphique a interrompu l’affichage 3D." />

  return (
    <div className="fixed inset-0 bg-encre">
      <GLBoundary fallback={<Fallback2D reason="Une erreur est survenue lors du chargement de la 3D." />}>
        <Suspense fallback={<LoadingScreen done={0} total={8} stage="Téléchargement" />}>
          <StoreCanvas key={quality} quality={quality} onProgress={onProgress} onContextLost={() => setLost(true)} />
        </Suspense>
      </GLBoundary>
      {ready && <Hud />}
      {!ready && <LoadingScreen {...progress} />}
    </div>
  )
}
