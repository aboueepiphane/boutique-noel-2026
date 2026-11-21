import { useState } from 'react'
import { useUI, type View } from '../../state/ui'
import { AISLES } from '../../data/aisles'
import { GUIDES } from '../../data/guides'
import { SHOP_NAME } from '../../config'
import { useInfo, type InfoKey } from './InfoDialog'
import { AffiliateNotice } from './Amazon'
import { Logo } from './Logo'
import { IconSearch, IconCube, IconMenu, IconClose } from './Icons'

const NAV: { view: View; label: string }[] = [
  { view: 'accueil', label: 'Accueil' },
  { view: 'rayons', label: 'Les rayons' },
  { view: 'inspiration', label: 'Inspiration' },
]

export function Header({ transparent = false }: { transparent?: boolean }) {
  const { view, go } = useUI()
  const [menu, setMenu] = useState(false)
  const light = transparent
  return (
    <header className={`${transparent ? 'absolute' : 'sticky bg-neige/90 backdrop-blur border-b border-encre/8'} top-0 inset-x-0 z-40`}>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 md:px-8 h-[72px]">
        <button onClick={() => go('accueil')} aria-label={`Accueil ${SHOP_NAME}`} className="whitespace-nowrap"><span className="sm:hidden"><Logo light={light} compact /></span><span className="hidden sm:inline"><Logo light={light} /></span></button>
        <nav className="ml-8 hidden md:flex items-center gap-7" aria-label="Navigation principale">
          {NAV.map((n) => (
            <button key={n.view} onClick={() => go(n.view)}
              className={`eyebrow !text-[0.68rem] transition-colors ${view === n.view ? (light ? 'text-or-light' : 'text-carmin') : light ? 'text-neige/80 hover:text-or-light' : 'text-encre/70 hover:text-carmin'}`}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className={`ml-auto flex items-center gap-1 ${light ? 'text-neige' : 'text-encre'}`}>
          <button className="btn btn-sm btn-gold hidden sm:inline-flex mr-2" onClick={() => go('boutique')}><IconCube width={16} /> Visiter en 3D</button>
          <button className={`icon-btn ${light ? 'hover:bg-white/10' : 'hover:bg-encre/5'}`} onClick={() => { go('rayons'); setTimeout(() => document.getElementById('search-input')?.focus(), 60) }} aria-label="Rechercher"><IconSearch /></button>
          <button className={`icon-btn md:hidden ${light ? 'hover:bg-white/10' : 'hover:bg-encre/5'}`} onClick={() => setMenu(!menu)} aria-label="Menu" aria-expanded={menu}>{menu ? <IconClose /> : <IconMenu />}</button>
        </div>
      </div>
      {menu && (
        <nav className="md:hidden mx-4 mb-3 rounded-2xl bg-neige text-encre shadow-xl ring-1 ring-encre/10 p-3 flex flex-col slide-up" aria-label="Menu mobile">
          {[...NAV, { view: 'boutique' as View, label: 'Visiter la boutique 3D' }].map((n) => (
            <button key={n.view} onClick={() => { setMenu(false); go(n.view) }} className="text-left px-3 py-3 rounded-xl hover:bg-creme font-medium">{n.label}</button>
          ))}
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  const { go, goAisle, goGuide } = useUI()
  const show = useInfo((s) => s.show)
  const link = 'text-left text-sm text-neige/70 hover:text-or-light transition-colors'
  const info = (k: InfoKey, label: string) => <li><button className={link} onClick={() => show(k)}>{label}</button></li>
  return (
    <footer className="bg-encre text-neige mt-24">
      <div className="h-1 bg-gradient-to-r from-carmin via-or to-sapin" />
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-16 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo light />
          <p className="text-sm text-neige/65 max-w-xs leading-relaxed">La boutique de Noël virtuelle où l’on flâne entre les rayons comme dans un grand magasin, avant de commander sur Amazon.</p>
          <button className="btn btn-sm btn-gold" onClick={() => go('boutique')}><IconCube width={16} /> Entrer dans la boutique</button>
        </div>
        <div>
          <h3 className="eyebrow text-or mb-4">Les rayons</h3>
          <ul className="space-y-2.5">
            {AISLES.map((a) => (
              <li key={a.id}><button className={link} onClick={() => goAisle(a.anchor)}>{a.number} · {a.title}</button></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="eyebrow text-or mb-4">Inspiration</h3>
          <ul className="space-y-2.5">
            {GUIDES.map((g) => (
              <li key={g.anchor}><button className={link} onClick={() => goGuide(g.anchor)}>{g.title}</button></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="eyebrow text-or mb-4">La boutique</h3>
          <ul className="space-y-2.5">
            {info('propos', 'À propos')}
            {info('contact', 'Contact')}
            {info('mentions', 'Mentions légales')}
            {info('affiliation', 'Affiliation Amazon')}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 flex flex-col gap-3">
          <AffiliateNotice light />
          <div className="flex flex-col md:flex-row gap-2 justify-between text-xs text-neige/45">
            <span>© {new Date().getFullYear()} {SHOP_NAME}</span>
            <span>Aucune vente sur ce site : les commandes se font sur Amazon.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
