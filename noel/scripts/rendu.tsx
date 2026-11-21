/**
 * Contrôle de rendu : chaque ancre du dossier doit produire la bonne page.
 * Rendu client complet dans un DOM simulé (jsdom), sans WebGL : c'est donc
 * aussi un test du mode de secours 2D.
 * Lancer : npm run rendu
 */
import { JSDOM } from 'jsdom'
import { SITE_URL } from '../src/config'

const dom = new JSDOM('<!doctype html><html><head><meta name="description" content=""></head><body><div id="root"></div></body></html>', {
  url: SITE_URL.endsWith('/') ? SITE_URL : SITE_URL + '/',
  pretendToBeVisual: true,
})
const g = globalThis as unknown as Record<string, unknown>
g.window = dom.window
g.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true })
Object.defineProperty(globalThis, 'location', { value: dom.window.location, configurable: true })
Object.defineProperty(globalThis, 'history', { value: dom.window.history, configurable: true })
g.localStorage = dom.window.localStorage
g.HashChangeEvent = dom.window.HashChangeEvent
g.HTMLElement = dom.window.HTMLElement
g.Element = dom.window.Element
g.Node = dom.window.Node
g.requestAnimationFrame = (cb: FrameRequestCallback) => dom.window.setTimeout(() => cb(0), 0) as unknown as number
g.cancelAnimationFrame = (id: number) => dom.window.clearTimeout(id)
g.IS_REACT_ACT_ENVIRONMENT = true

async function main() {
  const { createRoot } = await import('react-dom/client')
  const { act } = await import('react')
  const { createElement } = await import('react')
  const App = (await import('../src/App')).default
  const { AISLES } = await import('../src/data/aisles')
  const { GUIDES } = await import('../src/data/guides')
  const { useInfo } = await import('../src/components/ui/InfoDialog')

  const root = createRoot(document.getElementById('root')!)
  await act(async () => { root.render(createElement(App)) })

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const MENTION = 'En tant que Partenaire Amazon'
  let ko = 0

  const html = () => document.getElementById('root')!.innerHTML
  const goto = async (hash: string) => {
    await act(async () => {
      dom.window.location.hash = hash
      dom.window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))
    })
  }
  const check = (nom: string, attendus: string[], interdits: string[] = []) => {
    const h = html()
    const manquants = attendus.filter((a) => !h.includes(a))
    const presents = interdits.filter((a) => h.includes(a))
    const bon = !manquants.length && !presents.length
    if (!bon) ko++
    console.log(
      `${bon ? '✓' : '✗'} ${nom.padEnd(38)} ${String(h.length).padStart(7)} octets · titre « ${document.title.slice(0, 46)} »` +
        (manquants.length ? `\n    manque : ${manquants.join(' | ')}` : '') +
        (presents.length ? `\n    interdit présent : ${presents.join(' | ')}` : ''),
    )
  }

  // Mentions qui ne doivent apparaître sur aucune page : prix, panier, avis, fausse urgence.
  const INTERDITS = ['Ajouter au panier', 'avis)', 'Livraison offerte', 'TVA', 'Prix TTC', '€']

  await goto('')
  check('Accueil (#)', [MENTION, 'Espace Inspiration', 'Voir sur Amazon', esc('Guirlandes & LED')], INTERDITS)

  for (const a of AISLES) {
    await goto(a.anchor)
    check(`Rayon #${a.anchor}`, [MENTION, esc(a.title), esc(a.seo.slice(0, 70)), 'Visiter ce rayon en 3D', 'Voir sur Amazon', `id="${a.anchor}"`], INTERDITS)
  }

  for (const gd of GUIDES) {
    await goto(gd.anchor)
    check(`Guide #${gd.anchor}`, [MENTION, esc(gd.title), esc(gd.items[0].title), esc(gd.intro.slice(0, 60)), `id="${gd.anchor}"`, 'ring-or/60'], INTERDITS)
  }

  await goto('inspiration')
  check('Espace Inspiration (#inspiration)', [MENTION, ...GUIDES.map((x) => esc(x.title))], INTERDITS)

  await goto('rayons')
  check('Tous les rayons (#rayons)', [MENTION, 'Toute la boutique'], INTERDITS)

  await goto('nimportequoi')
  check('Ancre inconnue → accueil', [MENTION, esc('Entrez dans la')], INTERDITS)

  // boutique 3D : sans WebGL, c'est le mode plan 2D qui doit s'afficher
  await goto('boutique')
  check('Boutique #boutique (repli sans 3D)', ['Plan de la boutique'], ['Ajouter au panier', '€'])

  // fenêtres de confiance
  await goto('')
  for (const k of ['propos', 'contact', 'mentions', 'affiliation'] as const) {
    await act(async () => { useInfo.setState({ open: k }) })
    check(`Fenêtre « ${k} »`, ['info-title'], [])
  }
  await act(async () => { useInfo.setState({ open: null }) })

  console.log(ko ? `\n${ko} PROBLÈME(S)` : '\nRENDU CONFORME SUR TOUTES LES PAGES ET TOUTES LES ANCRES')
  process.exit(ko ? 1 : 0)
}
main()
