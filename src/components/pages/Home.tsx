import { lazy, Suspense } from 'react'
import { PRODUCTS, productsOf } from '../../data/products'
import { AISLES } from '../../data/aisles'
import { GUIDES } from '../../data/guides'
import { SHOP_NAME } from '../../config'
import { useUI } from '../../state/ui'
import { useNav } from '../../state/nav'
import { hasWebGL } from '../../lib/webgl'
import { Header, Footer } from '../ui/Chrome'
import { ProductCard } from '../ui/ProductCard'
import { AffiliateNotice } from '../ui/Amazon'
import { Thumb } from '../ui/Thumb'
import { LogoMark } from '../ui/Logo'
import { IconCube, IconArrowRight, IconSparkle, IconShield, IconGift, IconHelp } from '../ui/Icons'
import type { Aisle } from '../../data/types'

const HeroScene = lazy(() => import('../../three/HeroScene'))

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <span className="eyebrow text-or">{eyebrow}</span>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2 leading-[1.05]">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function AisleCard({ aisle, index }: { aisle: Aisle; index: number }) {
  const { go, goAisle } = useUI()
  const travelTo = useNav((s) => s.travelTo)
  const items = productsOf(aisle.id)
  return (
    <article className="group relative overflow-hidden rounded-3xl text-neige min-h-[420px] flex flex-col"
      style={{ background: `linear-gradient(160deg, ${aisle.color} 0%, #1b120d 120%)` }}>
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,#fff_1px,transparent_1.5px)] bg-[length:22px_22px]" />
      <div className="relative p-7 flex flex-col gap-2">
        <span className="font-display text-6xl font-semibold text-or-light/30 leading-none">{aisle.number}</span>
        <span className="eyebrow text-or-light/80">{aisle.address}</span>
        <h3 className="font-display text-3xl font-semibold leading-tight">{aisle.title}</h3>
        <p className="text-sm text-neige/70">{aisle.tagline}</p>
      </div>
      <div className="relative mt-auto grid grid-cols-3 gap-2 px-7">
        {items.slice(index % 2, (index % 2) + 3).map((p) => (
          <Thumb key={p.id} product={p} className="aspect-square rounded-xl ring-1 ring-white/10" />
        ))}
      </div>
      <div className="relative flex flex-wrap gap-2 p-7 pt-5">
        <button className="btn btn-sm btn-gold" onClick={() => { travelTo(aisle.viewpoint[0], aisle.viewpoint[1], aisle.viewpoint[2]); go('boutique') }}>
          <IconCube width={15} /> S’y rendre en 3D
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => goAisle(aisle.anchor)}>
          {items.length} articles <IconArrowRight width={15} />
        </button>
      </div>
    </article>
  )
}

export function Home() {
  const { go, goGuide } = useUI()
  const best = PRODUCTS.filter((p) => p.bestseller).slice(0, 8)
  const fresh = PRODUCTS.filter((p) => p.isNew)
  const webgl = hasWebGL()
  return (
    <div className="min-h-full">
      {/* ─── Accueil : s'affiche immédiatement, la 3D se charge derrière ─── */}
      <section className="relative min-h-[100svh] overflow-hidden bg-encre text-neige">
        <div className="absolute inset-0">
          {webgl ? (
            <Suspense fallback={<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,#4a1a14,#140d09_70%)]" />}>
              <HeroScene />
            </Suspense>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,#4a1a14,#140d09_70%)]" />
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-encre/90 via-encre/45 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-encre/45 md:hidden" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-encre to-transparent" />
        <Header transparent />
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 min-h-[100svh] flex flex-col justify-center pt-24 pb-16 pointer-events-none">
          <div className="max-w-xl slide-up pointer-events-auto">
            <div className="flex items-center gap-3 mb-6">
              <LogoMark size={54} />
              <div className="leading-tight">
                <div className="font-display text-2xl font-semibold tracking-[0.12em]">{SHOP_NAME}</div>
                <div className="eyebrow text-or-light/75 !text-[0.6rem] !tracking-[0.4em]">Boutique de Noël en 3D</div>
              </div>
            </div>
            <h1 className="font-display text-[3.4rem] leading-[0.95] md:text-[5.6rem] font-semibold">
              Entrez dans la <em className="text-or-light not-italic md:italic">magie</em> de Noël
            </h1>
            <p className="mt-6 text-lg text-neige/75 max-w-md leading-relaxed">
              Poussez la porte d’une grande boutique de fêtes : flânez entre cinq rayons, approchez les sapins, faites tourner les ornements, puis commandez sur Amazon.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <button className="btn btn-primary !py-4 !px-7 text-[0.82rem]" onClick={() => go('boutique')}><IconCube width={18} /> Visiter la boutique</button>
              <button className="btn btn-ghost !py-4 !px-7 text-[0.82rem]" onClick={() => go('inspiration')}>Lire nos guides déco</button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neige/60">
              <span>✦ 5 rayons à visiter</span>
              <span>✦ {PRODUCTS.length} pièces à explorer</span>
              <span>✦ {GUIDES.length} guides déco</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Les cinq rayons ─── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pt-24" id="rayons-apercu">
        <SectionTitle eyebrow="Le plan de la boutique" title="Cinq rayons, cinq univers">
          <p className="max-w-sm text-encre/65">Chaque rayon a son adresse et son décor. Entrez directement dans celui qui vous attire.</p>
        </SectionTitle>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {AISLES.map((a, i) => <AisleCard key={a.id} aisle={a} index={i} />)}
          <article className="relative overflow-hidden rounded-3xl bg-creme p-8 flex flex-col justify-between min-h-[420px] ring-1 ring-encre/8">
            <div>
              <span className="eyebrow text-carmin">Au centre</span>
              <h3 className="font-display text-3xl font-semibold mt-2">Le grand sapin</h3>
              <p className="mt-3 text-encre/70 leading-relaxed">Sept mètres de branches, plus de six cents lumières et une étoile dorée : le cœur de la boutique, d’où partent tous les rayons.</p>
            </div>
            <button className="btn btn-primary self-start" onClick={() => go('boutique')}>Pousser la porte <IconArrowRight width={16} /></button>
          </article>
        </div>
      </section>

      {/* ─── Espace Inspiration ─── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pt-28" id="inspiration-apercu">
        <SectionTitle eyebrow="Espace Inspiration" title="Décorer sans se tromper">
          <button className="btn btn-outline btn-sm self-start md:self-auto" onClick={() => go('inspiration')}>Tous les guides <IconArrowRight width={15} /></button>
        </SectionTitle>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((g) => (
            <button key={g.anchor} onClick={() => goGuide(g.anchor)}
              className="group text-left rounded-2xl bg-white/70 ring-1 ring-encre/8 p-6 transition-all hover:-translate-y-1 hover:ring-or/50 hover:shadow-[0_24px_50px_-28px_rgba(27,18,13,.45)]">
              <span className="font-display text-5xl font-semibold text-or/30 leading-none">{g.number}</span>
              <h3 className="font-display text-[1.4rem] font-semibold mt-3 leading-tight group-hover:text-carmin transition-colors">{g.title}</h3>
              <p className="mt-2 text-sm text-encre/65 leading-snug">{g.tagline}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-carmin">Lire le guide <IconArrowRight width={14} /></span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Sélection ─── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pt-28">
        <SectionTitle eyebrow="Nos coups de cœur" title="La sélection de la saison">
          <button className="btn btn-outline btn-sm self-start md:self-auto" onClick={() => go('rayons')}>Toute la boutique <IconArrowRight width={15} /></button>
        </SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {best.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ─── Expérience ─── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pt-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-sapin-deep text-neige px-7 py-14 md:p-16 grid md:grid-cols-2 gap-10 items-center">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-or/10 blur-3xl" />
          <div className="relative">
            <span className="eyebrow text-or">Comme en magasin</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2 leading-[1.05]">Promenez-vous, approchez, choisissez.</h2>
            <p className="mt-5 text-neige/70 leading-relaxed max-w-md">Avancez avec le clavier ou du bout du doigt, cliquez sur un panneau pour rejoindre un rayon, puis sur un produit pour ouvrir sa fiche et le faire tourner en 3D.</p>
            <button className="btn btn-gold mt-8" onClick={() => go('boutique')}><IconCube width={17} /> Commencer la visite</button>
          </div>
          <ul className="relative grid grid-cols-2 gap-4 text-sm">
            {[
              ['Z Q S D / W A S D', 'Avancer, reculer, se décaler'],
              ['Flèches', 'Avancer et tourner'],
              ['Glisser la souris', 'Regarder autour de soi'],
              ['Molette', 'Zoomer et dézoomer'],
              ['Joystick tactile', 'Se déplacer sur mobile'],
              ['Mini-carte', 'Toucher un rayon pour s’y rendre'],
            ].map(([k, v]) => (
              <li key={k} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <span className="block font-semibold text-or-light">{k}</span>
                <span className="text-neige/65">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Nouveautés ─── */}
      {fresh.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 md:px-8 pt-28">
          <SectionTitle eyebrow="Noël 2026" title="Nouveautés de la saison" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {fresh.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ─── Comment ça marche : la confiance, à la place de l'ancienne réassurance boutique ─── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pt-24">
        <SectionTitle eyebrow="En toute transparence" title="Comment ça marche" />
        <div className="grid gap-6 md:grid-cols-4 border-y border-encre/10 py-10">
          {[
            [IconCube, 'Vous visitez', 'Cinq rayons en 3D, les pièces se tournent et s’observent de près.'],
            [IconHelp, 'Vous vous décidez', 'Nos guides expliquent les erreurs à éviter et les palettes qui tiennent.'],
            [IconGift, 'Vous commandez sur Amazon', 'Le bouton ouvre la fiche du produit. Prix, stock et livraison sont chez eux.'],
            [IconShield, 'Rien de caché', 'Aucun prix affiché, aucun avis inventé, aucun compte à rebours.'],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof IconCube
            return (
              <div key={t as string} className="flex gap-3">
                <I width={26} height={26} className="text-or shrink-0" />
                <div><div className="font-semibold">{t as string}</div><div className="text-sm text-encre/60 leading-snug">{d as string}</div></div>
              </div>
            )
          })}
        </div>
        <div className="mt-6 flex items-start gap-2">
          <IconSparkle width={16} className="text-or shrink-0 mt-0.5" />
          <AffiliateNotice />
        </div>
      </section>
      <Footer />
    </div>
  )
}
