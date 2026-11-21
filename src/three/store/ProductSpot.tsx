import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Slot } from '../../data/layout'
import { PRODUCT_BY_ID, TIER_LABEL } from '../../data/products'
import { ProductModel, MODEL_HEIGHT } from '../models/ProductModel'
import { mat } from '../models/materials'
import { shelfLabelTexture } from '../../lib/textures'
import { useUI } from '../../state/ui'
import { useShop } from '../../state/shop'
import { setCursor } from '../core/cursor'
import { StaticMerge } from '../core/StaticMerge'

function Base({ kind, y }: { kind: Slot['base']; y: number }) {
  if (kind === 'pedestal')
    return (
      <group>
        <mesh material={mat.lacquer('#173a2b', 0.4, 0.05)} position={[0, y / 2, 0]} castShadow receiveShadow><cylinderGeometry args={[0.32, 0.38, y, 32]} /></mesh>
        <mesh material={mat.goldSoft()} position={[0, y - 0.01, 0]}><cylinderGeometry args={[0.36, 0.36, 0.03, 32]} /></mesh>
        <mesh material={mat.goldSoft()} position={[0, 0.03, 0]}><cylinderGeometry args={[0.42, 0.42, 0.06, 32]} /></mesh>
      </group>
    )
  if (kind === 'stump')
    return (
      <group>
        <mesh material={mat.std('#5a3a22', 0.95)} position={[0, y / 2, 0]} castShadow receiveShadow><cylinderGeometry args={[0.33, 0.4, y, 18]} /></mesh>
        <mesh material={mat.std('#c9a476', 0.85)} position={[0, y + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.33, 24]} /></mesh>
        {[0.1, 0.18, 0.26].map((r) => (
          <mesh key={r} material={mat.std('#9c7448', 0.9)} position={[0, y + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r, r + 0.008, 24]} /></mesh>
        ))}
      </group>
    )
  if (kind === 'dais')
    return (
      <group>
        <mesh material={mat.wood('#3b2416')} position={[0, y / 2, 0]} castShadow receiveShadow><cylinderGeometry args={[1.25, 1.35, y, 40]} /></mesh>
        <mesh material={mat.goldSoft()} position={[0, y, 0]}><torusGeometry args={[1.25, 0.03, 8, 60]} /></mesh>
        <mesh material={mat.snow()} position={[0, y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.2, 40]} /></mesh>
      </group>
    )
  return null
}

const sel = new THREE.Box3()

/** Un produit dans la boutique : modèle 3D, support, étiquette, survol et clic. */
export function ProductSpot({ slot }: { slot: Slot }) {
  const product = PRODUCT_BY_ID[slot.productId]
  const openProduct = useUI((s) => s.openProduct)
  const isFav = useShop((s) => s.favorites.includes(slot.productId))
  const [hover, setHover] = useState(false)
  const modelRef = useRef<THREE.Group>(null!)
  const liftRef = useRef<THREE.Group>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  const [box, setBox] = useState<{ size: THREE.Vector3; center: THREE.Vector3 } | null>(null)
  const scale = slot.size / MODEL_HEIGHT[product.kind]
  const tierText = TIER_LABEL[product.tier]
  const tag = useMemo(() => shelfLabelTexture(product.name, tierText), [product, tierText])

  // Boîte de sélection calculée depuis la géométrie réelle du modèle (repère local).
  useLayoutEffect(() => {
    const g = modelRef.current
    g.updateWorldMatrix(true, true)
    const inv = new THREE.Matrix4().copy(liftRef.current.matrixWorld).invert()
    sel.makeEmpty()
    g.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh || !m.geometry) return
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
      const b = (m as THREE.InstancedMesh).isInstancedMesh ? ((m as THREE.InstancedMesh).computeBoundingBox(), (m as THREE.InstancedMesh).boundingBox!) : m.geometry.boundingBox!
      const bb = b.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld))
      sel.union(bb)
    })
    if (!sel.isEmpty()) {
      const size = sel.getSize(new THREE.Vector3()).max(new THREE.Vector3(0.25, 0.25, 0.25)).multiplyScalar(1.08)
      setBox({ size, center: sel.getCenter(new THREE.Vector3()) })
    }
  }, [])

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 10)
    const target = hover ? 1.045 : 1
    const s = THREE.MathUtils.lerp(liftRef.current.scale.x, target, k)
    liftRef.current.scale.setScalar(s)
    liftRef.current.position.y = THREE.MathUtils.lerp(liftRef.current.position.y, hover ? slot.size * 0.015 : 0, k)
    const rm = ringRef.current.material as THREE.MeshBasicMaterial
    rm.opacity = THREE.MathUtils.lerp(rm.opacity, hover ? 0.85 : 0.0, k)
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 8) return // c'était un glisser pour tourner la caméra
    openProduct(product.id)
  }

  const floor = slot.pos[1] < 0.5
  const footprint = box ? Math.max(box.size.x, box.size.z) / 2 : slot.size * 0.4
  const big = slot.size > 1.5

  return (
    <group position={[slot.pos[0], 0, slot.pos[2]]} rotation={[0, slot.rotY, 0]}>
      <Base kind={slot.base} y={slot.pos[1]} />
      <group position={[0, slot.pos[1], 0]}>
        {/* anneau doré au survol */}
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <ringGeometry args={[footprint + 0.04, footprint + 0.09, 48]} />
          <meshBasicMaterial color="#f2d58e" transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
        <group ref={liftRef}>
          <group ref={modelRef} scale={scale}>
            <StaticMerge><ProductModel product={product} /></StaticMerge>
          </group>
          {box && (
            <mesh
              position={box.center}
              onClick={onClick}
              onPointerOver={(e) => { e.stopPropagation(); setHover(true); setCursor('pointer') }}
              onPointerOut={() => { setHover(false); setCursor(null) }}
            >
              <boxGeometry args={[box.size.x, box.size.y, box.size.z]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
          )}
        </group>
        {/* étiquette prix */}
        {slot.base !== 'wall' && (
          <group position={[0, floor ? (big ? 0.55 : 0.4) : 0.0, footprint + (floor ? 0.25 : 0.06)]} rotation={[floor ? -0.25 : -0.9, 0, 0]}>
            {floor && <mesh material={mat.goldSoft()} position={[0, -0.25 - (big ? 0.1 : 0) / 2, -0.02]}><cylinderGeometry args={[0.008, 0.008, 0.5 + (big ? 0.1 : 0), 6]} /></mesh>}
            <mesh position={[0, 0.03, 0]} scale={floor ? 1 : 0.7}>
              <planeGeometry args={[0.42, 0.158]} />
              <meshStandardMaterial map={tag} roughness={0.7} emissive="#ffffff" emissiveMap={tag} emissiveIntensity={hover ? 0.18 : 0.04} />
            </mesh>
          </group>
        )}
        {hover && box && (
          <Html position={[0, box.center.y + box.size.y / 2 + 0.12, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div className="hover-card">
              <span className="hover-card__name">{product.name}{isFav ? ' ♥' : ''}</span>
              <span className="hover-card__price">{tierText}</span>
              <span className="hover-card__hint">Cliquer pour découvrir</span>
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}
