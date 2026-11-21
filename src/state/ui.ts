import { create } from 'zustand'
import type { AisleId } from '../data/types'
import { AISLES, ANCHOR_TO_AISLE } from '../data/aisles'
import { GUIDE_BY_ANCHOR } from '../data/guides'

export type View = 'accueil' | 'boutique' | 'rayons' | 'inspiration'
export type Quality = 'haute' | 'moyenne' | 'basse'

export const VIEWS: View[] = ['accueil', 'boutique', 'rayons', 'inspiration']

const isTouch = () => typeof window !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)

/** Qualité de départ estimée selon l'appareil ; modifiable dans le menu. */
export const detectQuality = (): Quality => {
  if (typeof window === 'undefined') return 'moyenne'
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 4
  const small = Math.min(window.innerWidth, window.innerHeight) < 700
  if (isTouch() && small) return 'basse'
  if (mem <= 4 || cores <= 4) return 'moyenne'
  return 'haute'
}

interface UIState {
  view: View
  /** Rayon affiché sur la page Rayons ('tous' = tout le catalogue). */
  aisle: AisleId | 'tous'
  /** Guide ouvert dans l'Espace Inspiration (ancre, ex. 'guide-sapin'). */
  guide: string | null
  productId: string | null
  music: boolean
  quality: Quality
  touch: boolean
  helpOpen: boolean
  toast: string | null
  go: (v: View) => void
  /** Ouvre un rayon par son ancre publique (#sapins, #guirlandes…). */
  goAisle: (anchor: string) => void
  /** Ouvre un rayon par son identifiant interne. */
  goAisleId: (id: AisleId | 'tous') => void
  /** Ouvre un guide par son ancre publique (#guide-sapin…). */
  goGuide: (anchor: string) => void
  openProduct: (id: string | null) => void
  setMusic: (m: boolean) => void
  setQuality: (q: Quality) => void
  setHelp: (o: boolean) => void
  notify: (t: string) => void
}

/**
 * Lecture de l'adresse. Une seule ancre par page, et toutes les ancres du
 * dossier sont reconnues ici :
 *   #boutique #rayons #inspiration
 *   #sapins #guirlandes #boules #figurines #table
 *   #guide-sapin #guide-palettes #guide-erreurs #guide-styles
 */
type Route = { view: View; aisle: AisleId | 'tous'; guide: string | null }

export const routeFromHash = (raw?: string): Route => {
  const h = (raw ?? (typeof location !== 'undefined' ? location.hash.slice(1) : '')).toLowerCase()
  if (ANCHOR_TO_AISLE[h]) return { view: 'rayons', aisle: ANCHOR_TO_AISLE[h], guide: null }
  if (GUIDE_BY_ANCHOR[h]) return { view: 'inspiration', aisle: 'tous', guide: h }
  if ((VIEWS as string[]).includes(h)) return { view: h as View, aisle: 'tous', guide: null }
  // anciennes adresses, conservées pour ne pas casser un lien déjà partagé
  if (h === 'collections') return { view: 'rayons', aisle: 'tous', guide: null }
  return { view: 'accueil', aisle: 'tous', guide: null }
}

const setHash = (h: string) => {
  try {
    if (location.hash === `#${h}`) return
    if (h) location.hash = h
    else history.replaceState(null, '', location.pathname + location.search)
  } catch { /* adresse indisponible */ }
}

let toastTimer: ReturnType<typeof setTimeout> | undefined
const initial = routeFromHash()

export const useUI = create<UIState>()((set) => ({
  view: initial.view,
  aisle: initial.aisle,
  guide: initial.guide,
  productId: null,
  music: false,
  quality: detectQuality(),
  touch: isTouch(),
  helpOpen: false,
  toast: null,
  go: (view) => {
    set({ view, productId: null, guide: null, aisle: 'tous' })
    setHash(view === 'accueil' ? '' : view)
    window.scrollTo({ top: 0 })
  },
  goAisle: (anchor) => {
    const id = ANCHOR_TO_AISLE[anchor]
    if (!id) return
    set({ view: 'rayons', aisle: id, guide: null, productId: null })
    setHash(anchor)
    window.scrollTo({ top: 0 })
  },
  goAisleId: (id) => {
    const anchor = id === 'tous' ? 'rayons' : AISLES.find((a) => a.id === id)?.anchor
    set({ view: 'rayons', aisle: id, guide: null, productId: null })
    setHash(anchor ?? 'rayons')
    window.scrollTo({ top: 0 })
  },
  goGuide: (anchor) => {
    set({ view: 'inspiration', guide: GUIDE_BY_ANCHOR[anchor] ? anchor : null, productId: null })
    setHash(GUIDE_BY_ANCHOR[anchor] ? anchor : 'inspiration')
    window.scrollTo({ top: 0 })
  },
  openProduct: (productId) => set({ productId }),
  setMusic: (music) => set({ music }),
  setQuality: (quality) => set({ quality }),
  setHelp: (helpOpen) => set({ helpOpen }),
  notify: (toast) => {
    set({ toast })
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => set({ toast: null }), 2600)
  },
}))

export const syncViewFromHash = () => {
  const r = routeFromHash()
  const s = useUI.getState()
  if (s.view !== r.view || s.aisle !== r.aisle || s.guide !== r.guide) {
    useUI.setState({ ...r, productId: null })
  }
}
