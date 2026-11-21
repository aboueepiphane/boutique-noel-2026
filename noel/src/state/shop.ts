import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import type { Product } from '../data/types'

export type Selection = Record<string, string> // nom du groupe -> id de l'option

/** Sélection par défaut : la première option de chaque groupe de variantes. */
export const defaultSelection = (p: Product): Selection =>
  Object.fromEntries(p.variants.map((g) => [g.name, g.options[0].id]))

export const selectionLabel = (p: Product, sel: Selection) =>
  p.variants
    .map((g) => g.options.find((o) => o.id === sel[g.name])?.label)
    .filter(Boolean)
    .join(' · ')

export const selectionColor = (p: Product, sel: Selection) => {
  for (const g of p.variants) {
    const o = g.options.find((x) => x.id === sel[g.name])
    if (o?.color) return o.color
  }
  return p.color
}

/** localStorage peut être indisponible (navigation privée, iframe) : on bascule sur la mémoire. */
const memory = new Map<string, string>()
const safeStorage: StateStorage = {
  getItem: (k) => { try { return localStorage.getItem(k) } catch { return memory.get(k) ?? null } },
  setItem: (k, v) => { try { localStorage.setItem(k, v) } catch { memory.set(k, v) } },
  removeItem: (k) => { try { localStorage.removeItem(k) } catch { memory.delete(k) } },
}

/**
 * Il n'y a plus ni panier ni commande : la boutique est une vitrine
 * d'affiliation, l'achat se fait sur Amazon. Ne restent que les coups de cœur,
 * gardés dans le navigateur du visiteur, qui n'engagent rien.
 */
interface ShopState {
  favorites: string[]
  toggleFavorite: (productId: string) => void
}

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] })),
    }),
    {
      name: 'noel-merveilles-shop',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ favorites: s.favorites }),
    },
  ),
)
