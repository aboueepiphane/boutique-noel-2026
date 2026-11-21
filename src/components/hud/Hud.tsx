import { useEffect, useState } from 'react'
import { AISLES, AISLE_BY_ID, ENTRANCE_VIEW } from '../../data/aisles'
import { useNav } from '../../state/nav'
import { useUI, type Quality } from '../../state/ui'
import { useShop } from '../../state/shop'
import { startMusic, stopMusic } from '../../lib/music'
import { Minimap } from './Minimap'
import { Joystick } from './Joystick'
import { SearchOverlay } from './SearchOverlay'
import { Logo } from '../ui/Logo'
import { IconHeart, IconSearch, IconMusic, IconHome, IconDoor, IconMap, IconHelp, IconGauge, IconClose, IconMenu } from '../ui/Icons'

const QUALITY_LABEL: Record<Quality, string> = { haute: 'Haute', moyenne: 'Moyenne', basse: 'Économie' }
const NEXT_Q: Record<Quality, Quality> = { haute: 'moyenne', moyenne: 'basse', basse: 'haute' }

function AisleList({ onPick }: { onPick?: () => void }) {
  const travelTo = useNav((s) => s.travelTo)
  const current = useNav((s) => s.currentAisle)
  const items = [
    { key: 'entree', n: '↩', label: 'Entrée de la boutique', go: () => travelTo(ENTRANCE_VIEW[0], ENTRANCE_VIEW[1], ENTRANCE_VIEW[2], 0.06), active: false },
    { key: 'sapin', n: '✦', label: 'Le grand sapin', go: () => travelTo(0, 7.2, 0, 0.16), active: false },
    ...AISLES.map((a) => ({ key: a.id, n: a.number, label: a.address.split('— ')[1], go: () => travelTo(a.viewpoint[0], a.viewpoint[1], a.viewpoint[2]), active: current === a.id })),
  ]
  return (
    <ul className="space-y-1">
      {items.map((it) => (
        <li key={it.key}>
          <button onClick={() => { it.go(); onPick?.() }}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${it.active ? 'bg-or/20 text-or-light' : 'hover:bg-white/8 text-neige/85'}`}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold ${it.active ? 'bg-or text-encre' : 'bg-white/8 text-or-light group-hover:bg-white/15'}`}>{it.n}</span>
            <span className="leading-tight">{it.label}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function HelpOverlay({ onClose }: { onClose: () => void }) {
  const touch = useUI((s) => s.touch)
  const rows = touch
    ? [['Joystick (en bas à gauche)', 'Se déplacer'], ['Glisser un doigt', 'Regarder autour de soi'], ['Pincer', 'Zoomer'], ['Toucher un produit', 'Ouvrir sa fiche'], ['Toucher un panneau ou la mini-carte', 'Rejoindre une allée']]
    : [['Z Q S D  ou  W A S D', 'Avancer, se décaler, reculer'], ['Flèches ↑ ↓', 'Avancer, reculer'], ['Flèches ← →', 'Tourner sur place'], ['Maj (Shift)', 'Marcher plus vite'], ['Glisser la souris', 'Regarder autour de soi'], ['Molette', 'Zoomer / dézoomer'], ['Clic sur un produit', 'Ouvrir sa fiche'], ['Clic sur un panneau, un médaillon ou la mini-carte', 'Rejoindre une allée']]
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Aide à la navigation">
      <button className="absolute inset-0 bg-encre/50 fade-in" onClick={onClose} aria-label="Fermer" />
      <div className="relative glass rounded-3xl p-7 w-full max-w-lg slide-up">
        <button className="icon-btn absolute right-3 top-3" onClick={onClose} aria-label="Fermer"><IconClose /></button>
        <span className="eyebrow text-or">Bienvenue</span>
        <h2 className="font-display text-3xl font-semibold mt-1 mb-5">Comment visiter la boutique</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-5 gap-y-1 sm:gap-y-3 text-sm">
          {rows.flatMap(([k, v]) => [<dt key={k + 'k'} className="font-semibold text-or-light whitespace-nowrap">{k}</dt>, <dd key={k + 'v'} className="text-neige/75 mb-2 sm:mb-0">{v}</dd>])}
        </dl>
        <button className="btn btn-gold mt-7 w-full" onClick={onClose}>Commencer la visite</button>
      </div>
    </div>
  )
}

/** Interface superposée à la boutique 3D. */
export function Hud() {
  const { go, music, setMusic, quality, setQuality, touch, helpOpen, setHelp, notify } = useUI()
  const current = useNav((s) => s.currentAisle)
  const travelTo = useNav((s) => s.travelTo)
  const favs = useShop((s) => s.favorites.length)
  const [overlay, setOverlay] = useState<null | 'recherche' | 'favoris'>(null)
  const [aisleSheet, setAisleSheet] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [hint, setHint] = useState(true)
  const [menuOpen, setMenuOpen] = useState(true)

  useEffect(() => { const t = setTimeout(() => setHint(false), 9000); return () => clearTimeout(t) }, [])
  useEffect(() => () => { stopMusic() }, [])

  const toggleMusic = async () => {
    try {
      if (music) { stopMusic(); setMusic(false) }
      else { await startMusic(); setMusic(true) }
    } catch { notify('La musique ne peut pas être lue sur cet appareil') }
  }
  const where = current ? (touch ? AISLE_BY_ID[current].address.split('— ')[1] : AISLE_BY_ID[current].address) : 'Hall principal'
  const btn = 'icon-btn text-neige/90'

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      {/* barre du haut */}
      <div className="pointer-events-auto absolute left-3 right-3 top-3 md:left-5 md:right-5 md:top-5 flex items-center gap-2">
        <div className="glass rounded-full pl-2 pr-4 h-12 flex items-center gap-3 min-w-0">
          <button onClick={() => go('accueil')} className="shrink-0 rounded-full px-2 py-1 hover:bg-white/5" aria-label="Quitter la boutique et revenir à l'accueil">
            <span className="hidden sm:inline"><Logo light compact /></span>
            <span className="sm:hidden"><IconHome /></span>
          </button>
          <span className="hidden sm:block h-6 w-px bg-white/15" />
          <span className="truncate text-sm"><span className="text-neige/55 hidden md:inline">Vous êtes : </span><b className="font-semibold text-or-light">{where}</b></span>
        </div>
        <div className="glass ml-auto rounded-full h-12 px-1.5 flex items-center">
          <button className={btn} onClick={() => setOverlay('recherche')} aria-label="Rechercher un produit"><IconSearch /></button>
          <button className={btn} onClick={() => setOverlay('favoris')} aria-label={`Coups de cœur (${favs})`}><IconHeart />{favs > 0 && <span className="badge">{favs}</span>}</button>
          <span className="mx-1 h-6 w-px bg-white/15 hidden sm:block" />
          <button className={`${btn} hidden sm:inline-flex ${music ? '!text-or-light' : ''}`} onClick={toggleMusic} aria-pressed={music} aria-label={music ? 'Couper la musique' : 'Activer la musique d’ambiance'}><IconMusic off={!music} /></button>
          <button className={`${btn} hidden sm:inline-flex`} onClick={() => { setQuality(NEXT_Q[quality]); notify(`Qualité graphique : ${QUALITY_LABEL[NEXT_Q[quality]]}`) }} aria-label={`Qualité graphique : ${QUALITY_LABEL[quality]}. Changer`} title={`Qualité : ${QUALITY_LABEL[quality]}`}><IconGauge /></button>
          <button className={`${btn} hidden sm:inline-flex`} onClick={() => setHelp(true)} aria-label="Aide"><IconHelp /></button>
          <button className={`${btn} sm:hidden`} onClick={() => setAisleSheet(true)} aria-label="Menu de la boutique"><IconMenu /></button>
        </div>
      </div>

      {/* menu des allées (bureau) */}
      {!touch && (
        <nav className="pointer-events-auto absolute left-5 top-24 hidden lg:block glass rounded-3xl p-3 w-[250px] fade-in" aria-label="Rayons de la boutique">
          <button className="flex w-full items-center justify-between eyebrow text-or px-3 pt-1 pb-2" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
            Se rendre à <span className={`transition-transform ${menuOpen ? '' : '-rotate-90'}`}>▾</span>
          </button>
          {menuOpen && <AisleList />}
        </nav>
      )}

      {/* mini-carte */}
      <div className={`pointer-events-auto absolute ${touch ? 'left-3 top-[4.6rem]' : 'left-5 bottom-5'} glass rounded-2xl p-2.5 fade-in`}>
        <div className="flex items-center justify-between px-1 pb-1.5 gap-3">
          <span className="eyebrow !text-[0.58rem] text-or">Plan</span>
          <button className="text-neige/60 hover:text-neige" onClick={() => setShowMap(!showMap)} aria-label={showMap ? 'Masquer la mini-carte' : 'Afficher la mini-carte'}><IconMap width={16} height={16} /></button>
        </div>
        {showMap && <Minimap size={touch ? 112 : 190} />}
      </div>

      {/* bouton entrée */}
      <div className={`pointer-events-auto absolute ${touch ? 'right-3 bottom-6' : 'right-5 bottom-5'} flex flex-col items-end gap-2`}>
        <button className="glass rounded-full h-12 px-5 inline-flex items-center gap-2 text-sm font-semibold hover:!border-or/60 transition"
          onClick={() => travelTo(ENTRANCE_VIEW[0], ENTRANCE_VIEW[1], ENTRANCE_VIEW[2], 0.06)}>
          <IconDoor width={18} /> Retour à l’entrée
        </button>
        {!touch && (
          <div className="hidden md:flex lg:hidden glass rounded-full h-11 px-4 items-center">
            <button className="text-sm" onClick={() => setAisleSheet(true)}>Allées</button>
          </div>
        )}
      </div>

      {/* joystick mobile */}
      {touch && <div className="pointer-events-auto absolute left-4 bottom-6"><Joystick /></div>}

      {/* astuce */}
      {hint && !touch && (
        <div className="absolute left-1/2 bottom-6 -translate-x-1/2 glass rounded-full px-5 py-2.5 text-xs text-neige/80 fade-in hidden md:block">
          <b className="text-or-light">Z Q S D / W A S D</b> pour marcher · <b className="text-or-light">glisser</b> pour regarder · <b className="text-or-light">cliquer</b> sur un produit pour le découvrir
        </div>
      )}

      {/* feuille des allées (mobile / tablette) */}
      {aisleSheet && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Menu de la boutique">
          <button className="absolute inset-0 bg-encre/50 fade-in" onClick={() => setAisleSheet(false)} aria-label="Fermer" />
          <div className="relative glass w-full max-w-md rounded-t-3xl p-4 pb-8 slide-up">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25" />
            <div className="eyebrow text-or px-3 pb-2">Se rendre à</div>
            <AisleList onPick={() => setAisleSheet(false)} />
            <div className="mt-4 grid grid-cols-3 gap-2 px-1">
              <button className="glass rounded-2xl py-3 text-xs flex flex-col items-center gap-1" onClick={toggleMusic}><IconMusic off={!music} />{music ? 'Musique : oui' : 'Musique : non'}</button>
              <button className="glass rounded-2xl py-3 text-xs flex flex-col items-center gap-1" onClick={() => setQuality(NEXT_Q[quality])}><IconGauge />Qualité : {QUALITY_LABEL[quality]}</button>
              <button className="glass rounded-2xl py-3 text-xs flex flex-col items-center gap-1" onClick={() => { setAisleSheet(false); setHelp(true) }}><IconHelp />Aide</button>
            </div>
          </div>
        </div>
      )}

      {overlay && <div className="pointer-events-auto"><SearchOverlay mode={overlay} onClose={() => setOverlay(null)} /></div>}
      {helpOpen && <div className="pointer-events-auto"><HelpOverlay onClose={() => setHelp(false)} /></div>}
    </div>
  )
}
