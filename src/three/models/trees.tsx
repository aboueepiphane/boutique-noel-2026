import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { branchTier, pineconeGeometry, starGeometry } from './geometry'
import { mat } from './materials'
import { Bulbs, Baubles } from './common'
import { rng } from '../../lib/textures'

export interface TreeProps {
  height?: number
  radius?: number
  color?: string
  snow?: boolean
  lights?: number
  baubles?: number
  baubleColors?: string[]
  tiers?: number
  star?: boolean
  frosted?: boolean
  seed?: number
  pot?: boolean
  lightPalette?: string[]
}

/** Rayon de la silhouette du sapin à une hauteur relative t (0 = bas du feuillage, 1 = cime). */
const profile = (t: number) => Math.max(0.02, (1 - t) ** 1.05)

export function ChristmasTree({
  height = 2, radius, color = '#1f4d36', snow, lights = 0, baubles = 0,
  baubleColors = ['#9b1c23', '#c9a45c', '#f3efe6'], tiers = 7, star, frosted, seed = 1, pot, lightPalette,
}: TreeProps) {
  const R = radius ?? height * 0.38
  const trunkH = pot ? height * 0.05 : height * 0.1
  const foliageH = height - trunkH

  const data = useMemo(() => {
    const r = rng(seed * 97)
    const base = new THREE.Color(color)
    const list = Array.from({ length: tiers }, (_, i) => {
      const t = i / tiers
      const tierH = foliageH * (0.3 - t * 0.12)
      const y = trunkH + t * (foliageH - tierH * 0.8) + tierH / 2
      const rad = R * profile(t) * 1.05
      const c = base.clone().offsetHSL((r() - 0.5) * 0.02, 0, (i % 2 ? 0.03 : -0.02) + (r() - 0.5) * 0.03)
      return { y, h: tierH, rad, rot: r() * Math.PI, color: '#' + c.getHexString(), geo: branchTier(seed * 10 + i) }
    })
    const spiral = (n: number, turns: number, off = 0) =>
      Array.from({ length: n }, (_, k) => {
        const t = (k + 0.5) / n
        const a = t * turns * Math.PI * 2 + off
        const y = trunkH + foliageH * 0.04 + t * foliageH * 0.86
        const rad = R * profile(t * 0.92) * 0.92
        return new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad)
      })
    const scatter = (n: number) =>
      Array.from({ length: n }, () => {
        const t = 0.05 + r() * 0.8
        const a = r() * Math.PI * 2
        const rad = R * profile(t) * 0.86
        return new THREE.Vector3(Math.cos(a) * rad, trunkH + t * foliageH * 0.88, Math.sin(a) * rad)
      })
    return { list, lightPts: lights ? spiral(lights, 7) : [], baublePts: baubles ? scatter(baubles) : [] }
  }, [seed, color, tiers, foliageH, trunkH, R, lights, baubles])

  return (
    <group>
      {/* tronc */}
      <mesh material={mat.wood('#4a2e1a')} position={[0, trunkH / 2 + height * 0.02, 0]} castShadow>
        <cylinderGeometry args={[R * 0.07, R * 0.1, trunkH + height * 0.05, 10]} />
      </mesh>
      {data.list.map((tier, i) => (
        <group key={i} position={[0, tier.y, 0]} rotation={[0, tier.rot, 0]}>
          <mesh geometry={tier.geo} material={mat.needles(tier.color)} scale={[tier.rad, tier.h, tier.rad]} castShadow receiveShadow />
          {/* second étage décalé pour densifier le feuillage */}
          <mesh geometry={tier.geo} material={mat.needles(tier.color)} scale={[tier.rad * 0.82, tier.h * 0.9, tier.rad * 0.82]} position={[0, tier.h * 0.1, 0]} rotation={[0, 0.3, 0]} />
          {snow && (
            <mesh geometry={tier.geo} material={mat.snow()} scale={[tier.rad * 0.9, tier.h * 0.55, tier.rad * 0.9]} position={[0, tier.h * 0.26, 0]} rotation={[0, 0.15, 0]} />
          )}
          {frosted && (
            <mesh geometry={tier.geo} material={mat.std('#cfe0d6', 0.9)} scale={[tier.rad * 1.01, tier.h * 0.25, tier.rad * 1.01]} position={[0, -tier.h * 0.33, 0]} />
          )}
        </group>
      ))}
      <TreeTips tiers={data.list} color={color} snow={snow} frosted={frosted} seed={seed} />
      {lights > 0 && <Bulbs points={data.lightPts} size={Math.min(0.035, height * 0.0065)} palette={lightPalette} />}
      {baubles > 0 && <Baubles points={data.baublePts} colors={baubleColors} size={[height * 0.022, height * 0.03, height * 0.026]} />}
      {star && (
        <group position={[0, height + height * 0.02, 0]}>
          <mesh geometry={starGeometry(0.1)} material={mat.glow('#ffd88a', 1.6)} scale={height * 0.06} />
          <mesh material={mat.basicGlow('#ffd27a', 0.07)} scale={height * 0.09}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>
        </group>
      )}
      {pot && (
        <group>
          <mesh material={mat.std('#cdbb9a', 0.95)} position={[0, -height * 0.07, 0]} castShadow>
            <cylinderGeometry args={[R * 0.55, R * 0.42, height * 0.2, 24]} />
          </mesh>
          <mesh material={mat.std('#8a6a43', 1)} position={[0, -height * 0.1, 0]}>
            <torusGeometry args={[R * 0.5, R * 0.03, 6, 28]} />
          </mesh>
        </group>
      )}
    </group>
  )
}

const tipGeo = new THREE.ConeGeometry(1, 1, 5, 1)
tipGeo.translate(0, 0.5, 0)
const up = new THREE.Vector3(0, 1, 0)
const tmpO = new THREE.Object3D()
const tmpC = new THREE.Color()

/**
 * Pointes de branches : petits cônes instanciés tout autour du bord de chaque étage,
 * orientés vers l'extérieur et vers le bas, pour casser la silhouette lisse des cônes.
 */
function TreeTips({ tiers, color, snow, frosted, seed }: { tiers: { y: number; h: number; rad: number }[]; color: string; snow?: boolean; frosted?: boolean; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const items = useMemo(() => {
    const r = rng(seed * 31 + 7)
    const out: { p: THREE.Vector3; d: THREE.Vector3; s: number; c: THREE.Color }[] = []
    const base = new THREE.Color(color)
    tiers.forEach((t) => {
      for (const ring of [1.0, 0.8, 0.58]) {
        const n = Math.max(10, Math.round(t.rad * (ring > 0.9 ? 34 : 22)))
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + r() * 0.2
          const rr = t.rad * ring * (0.95 + r() * 0.1)
          const y = t.y - t.h * (ring > 0.9 ? 0.46 : ring > 0.7 ? 0.2 : 0.02) + (r() - 0.5) * t.h * 0.14
          const d = new THREE.Vector3(Math.cos(a), -0.35 - r() * 0.3, Math.sin(a)).normalize()
          const s = t.rad * (0.2 + r() * 0.12)
          let c = base.clone().offsetHSL((r() - 0.5) * 0.03, 0, (r() - 0.5) * 0.08)
          if (snow && r() > 0.45) c = new THREE.Color('#f2f5f8')
          if (frosted && r() > 0.6) c = new THREE.Color('#cfe0d6')
          out.push({ p: new THREE.Vector3(Math.cos(a) * rr * 0.9, y, Math.sin(a) * rr * 0.9), d, s, c })
        }
      }
    })
    return out
  }, [tiers, color, snow, frosted, seed])
  useLayoutEffect(() => {
    const m = ref.current
    items.forEach((it, i) => {
      tmpO.position.copy(it.p)
      tmpO.quaternion.setFromUnitVectors(up, it.d)
      tmpO.scale.set(it.s * 0.22, it.s, it.s * 0.22)
      tmpO.updateMatrix()
      m.setMatrixAt(i, tmpO.matrix)
      m.setColorAt(i, tmpC.copy(it.c))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={ref} args={[tipGeo, mat.needles('#ffffff'), items.length]} castShadow />
}

/** Pied de sapin en croisillon de chêne avec bague de serrage. */
export function TreeStand({ color = '#8a5a33' }: { color?: string }) {
  const w = mat.wood(color)
  return (
    <group>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} material={w} rotation={[0, r, 0]} position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[0.7, 0.08, 0.1]} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} material={w} position={[Math.cos((i * Math.PI) / 2) * 0.33, 0.01, Math.sin((i * Math.PI) / 2) * 0.33]}>
          <boxGeometry args={[0.1, 0.03, 0.1]} />
        </mesh>
      ))}
      <mesh material={mat.metal('#3c3c40', 0.4)} position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.13, 0.16, 24, 1, true]} />
      </mesh>
      <mesh material={mat.metal('#2b2b30', 0.4)} position={[0, 0.23, 0]}>
        <torusGeometry args={[0.115, 0.015, 8, 24]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={mat.gold()} position={[Math.cos(i * 2.1) * 0.13, 0.16, Math.sin(i * 2.1) * 0.13]} rotation={[0, -i * 2.1, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
        </mesh>
      ))}
    </group>
  )
}

export function Pinecone({ scale = 0.06, gold }: { scale?: number; gold?: boolean }) {
  return (
    <mesh geometry={pineconeGeometry()} material={gold ? mat.goldSoft() : mat.std('#5a3a22', 0.9)} scale={[scale, scale * 1.4, scale]} castShadow />
  )
}

/** Modèles produits du rayon Sapins (hauteur ≈ 2 m pour les grands sapins). */
export function TreeProduct({ kind, color }: { kind: string; color: string }) {
  switch (kind) {
    case 'snowTree':
      return (
        <group>
          <ChristmasTree height={2} color={color} snow seed={3} />
          {[0.6, 1.0, 1.35].map((y, i) => (
            <group key={i} position={[Math.cos(i * 2) * (0.62 - y * 0.25), y, Math.sin(i * 2) * (0.62 - y * 0.25)]}>
              <Pinecone scale={0.05} />
            </group>
          ))}
        </group>
      )
    case 'miniTree':
      return <group position={[0, 0.1, 0]}><ChristmasTree height={0.6} color={color} pot seed={5} tiers={6} /></group>
    case 'ledTree':
      return <ChristmasTree height={2} color={color} lights={140} seed={7} />
    case 'premiumTree':
      return <ChristmasTree height={2.3} color={color} frosted lights={180} tiers={9} seed={9} star />
    default:
      return <ChristmasTree height={2} color={color} seed={1} />
  }
}
