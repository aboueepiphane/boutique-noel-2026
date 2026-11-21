import type { Product } from '../../data/types'
import { useThumbs, ProductIllustration } from '../../three/ProductViewer'
import { hasWebGL } from '../../lib/webgl'

/** Vignette d'un produit : photo de studio générée en 3D, ou illustration de secours. */
export function Thumb({ product, className = '' }: { product: Product; className?: string }) {
  const url = useThumbs((s) => s.thumbs[product.id])
  return (
    <div className={`thumb-bg relative overflow-hidden ${className}`}>
      {url ? (
        <img src={url} alt={product.name} className="absolute inset-0 w-full h-full object-contain p-[6%] fade-in" draggable={false} />
      ) : hasWebGL() ? (
        <div className="absolute inset-0 shimmer" aria-label={`Image de ${product.name} en préparation`} />
      ) : (
        <div className="absolute inset-0"><ProductIllustration product={product} /></div>
      )}
    </div>
  )
}
