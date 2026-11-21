import { PRODUCTS } from '../data/products'
import { AISLES } from '../data/aisles'
import type { Product } from '../data/types'

/** Normalise un texte pour la recherche : minuscules, sans accents. */
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')

export const searchProducts = (q: string, list: Product[] = PRODUCTS) => {
  const terms = norm(q).split(/\s+/).filter(Boolean)
  if (!terms.length) return list
  return list.filter((p) => {
    const hay = norm([p.name, p.short, p.description, AISLES.find((a) => a.id === p.aisle)!.title, ...p.details, ...p.variants.flatMap((g) => g.options.map((o) => o.label))].join(' '))
    return terms.every((t) => hay.includes(t))
  })
}

