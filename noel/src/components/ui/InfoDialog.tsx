import { create } from 'zustand'
import { CONTACT, SHOP_NAME, AFFILIATE_NOTICE } from '../../config'
import { IconClose } from './Icons'

export type InfoKey = 'propos' | 'contact' | 'mentions' | 'affiliation'

export const useInfo = create<{ open: InfoKey | null; show: (k: InfoKey | null) => void }>()((set) => ({
  open: null,
  show: (open) => set({ open }),
}))

const CONTENT: Record<InfoKey, { title: string; body: React.ReactNode }> = {
  propos: {
    title: 'À propos',
    body: (
      <>
        <p>{SHOP_NAME} est une boutique de Noël <b>virtuelle</b> : cinq rayons en 3D que l’on visite comme un vrai magasin, pour choisir sa décoration tranquillement, de chez soi.</p>
        <p>Nous ne vendons rien nous-mêmes et ne stockons aucun produit. Chaque pièce présentée est une représentation 3D ; le bouton « Voir sur Amazon » ouvre la fiche du produit chez Amazon, qui se charge de la vente, du paiement et de la livraison.</p>
        <p>Notre travail : sélectionner des articles bien notés, les classer par style et par rayon, et écrire des guides utiles pour décorer sans se tromper.</p>
      </>
    ),
  },
  contact: {
    title: 'Contact',
    body: (
      <>
        <p>Une question sur un produit, un style, un guide ? Écrivez-nous, nous répondons sous 48 heures.</p>
        <p>E-mail : <b>{CONTACT.email}</b></p>
        <p className="text-encre/55 text-sm">Pour une commande déjà passée, un retour ou une livraison, le service client d’Amazon est seul compétent : nous n’avons accès à aucune commande.</p>
      </>
    ),
  },
  mentions: {
    title: 'Mentions légales',
    body: (
      <>
        <p><b>Éditeur du site</b><br />{CONTACT.editeur}<br />{CONTACT.adresse}<br />{CONTACT.siren}</p>
        <p><b>Hébergeur</b><br />{CONTACT.hebergeur}</p>
        <p><b>Données personnelles</b><br />Ce site ne demande aucune inscription et ne collecte aucune donnée personnelle. Vos coups de cœur restent dans votre navigateur et ne sont envoyés à aucun serveur.</p>
        <p><b>Liens sortants</b><br />Les boutons « Voir sur Amazon » sont des liens affiliés. {AFFILIATE_NOTICE}</p>
      </>
    ),
  },
  affiliation: {
    title: 'Affiliation Amazon',
    body: (
      <>
        <p>{AFFILIATE_NOTICE}</p>
        <p>Concrètement : lorsque vous cliquez sur « Voir sur Amazon » puis achetez, Amazon nous verse une commission. <b>Le prix que vous payez est exactement le même</b> que si vous étiez arrivé sur Amazon par vous-même.</p>
        <p>Nous n’affichons aucun prix sur ce site : ils changent plusieurs fois par jour chez Amazon, et un prix périmé serait trompeur. Prix, stock et délais sont donc à vérifier sur la fiche Amazon.</p>
        <p>Nous ne publions ni avis de clients, ni note, ni compte à rebours : les avis se lisent sur Amazon, à la source.</p>
      </>
    ),
  },
}

export function InfoDialog() {
  const { open, show } = useInfo()
  if (!open) return null
  const c = CONTENT[open]
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="info-title">
      <button className="absolute inset-0 bg-encre/55 backdrop-blur-sm fade-in" onClick={() => show(null)} aria-label="Fermer" />
      <div className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto scrollbar-thin rounded-3xl bg-neige p-7 shadow-2xl slide-up">
        <button className="icon-btn absolute right-4 top-4 hover:bg-encre/5" onClick={() => show(null)} aria-label="Fermer"><IconClose /></button>
        <span className="eyebrow text-or">{SHOP_NAME}</span>
        <h2 id="info-title" className="font-display text-3xl font-semibold mt-1 mb-4">{c.title}</h2>
        <div className="space-y-3 text-[0.95rem] leading-relaxed text-encre/80">{c.body}</div>
      </div>
    </div>
  )
}
