import { useEffect } from 'react'
import { useUI, syncViewFromHash } from './state/ui'
import { AISLE_BY_ID } from './data/aisles'
import { GUIDE_BY_ANCHOR } from './data/guides'
import { SHOP_NAME } from './config'
import { Home } from './components/pages/Home'
import { Rayons } from './components/pages/Rayons'
import { Inspiration } from './components/pages/Inspiration'
import { Store } from './components/pages/Store'
import { ProductPanel } from './components/ui/ProductPanel'
import { Toast } from './components/ui/Toast'
import { InfoDialog } from './components/ui/InfoDialog'
import { ThumbnailStudio } from './three/ProductViewer'

export default function App() {
  const { view, aisle, guide } = useUI()

  useEffect(() => {
    window.addEventListener('hashchange', syncViewFromHash)
    return () => window.removeEventListener('hashchange', syncViewFromHash)
  }, [])

  /** Titre et description de la page, pour le référencement et le partage. */
  useEffect(() => {
    let title = `${SHOP_NAME} — Décoration de Noël 2026 en 3D`
    let desc = `Visitez ${SHOP_NAME}, la boutique de Noël virtuelle en 3D : sapins, guirlandes lumineuses, boules, figurines et déco de table, avec nos guides déco 2026.`
    if (view === 'boutique') {
      title = `Visite 3D — ${SHOP_NAME}`
      desc = 'Promenez-vous dans les cinq rayons de la boutique de Noël en 3D : sapins, guirlandes LED, boules, figurines et table de fête.'
    } else if (view === 'rayons') {
      const a = aisle === 'tous' ? null : AISLE_BY_ID[aisle]
      title = a ? `${a.title} — décoration de Noël 2026 | ${SHOP_NAME}` : `Les rayons — décoration de Noël 2026 | ${SHOP_NAME}`
      desc = a ? a.seo.slice(0, 300) : desc
    } else if (view === 'inspiration') {
      const g = guide ? GUIDE_BY_ANCHOR[guide] : null
      title = g ? `${g.title} | ${SHOP_NAME}` : `Espace Inspiration — déco de Noël 2026 | ${SHOP_NAME}`
      desc = g ? `${g.tagline} ${g.intro}`.slice(0, 300) : 'Quatre guides pour décorer sans se tromper : le sapin en 5 étapes, les palettes de Noël 2026, les 7 erreurs à éviter et les 4 styles de la saison.'
    }
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc)
  }, [view, aisle, guide])

  return (
    <>
      {view === 'accueil' && <Home />}
      {view === 'boutique' && <Store />}
      {view === 'rayons' && <Rayons />}
      {view === 'inspiration' && <Inspiration />}
      <ProductPanel />
      <InfoDialog />
      <Toast />
      <ThumbnailStudio />
    </>
  )
}
