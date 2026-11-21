import { useMemo } from 'react'
import * as THREE from 'three'
import { mat } from '../models/materials'
import { Baubles, Bulbs } from '../models/common'
import { starGeometry } from '../models/geometry'
import { rng, woodTexture } from '../../lib/textures'

const Z0 = -15.6, Z1 = -4.2
const LEN = Z1 - Z0
const ZC = (Z0 + Z1) / 2

/** Allée 02 — vitrine murale éclairée, table d'exposition, boules suspendues. */
export function OrnementsAisle({ quality }: { quality: string }) {
  const lacquer = mat.lacquer('#173a2b', 0.35, 0.1)
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ map: woodTexture('fonce'), color: '#8a5a3a', roughness: 0.55 }), [])
  const shelfDecor = useMemo(() => {
    const r = rng(17)
    const pts: THREE.Vector3[] = []
    const cols: string[] = []
    for (const y of [0.92, 2.0]) {
      for (let i = 0; i < 26; i++) {
        pts.push(new THREE.Vector3(-16.1 + r() * 0.35, y + 0.07, Z0 + 0.4 + (i / 25) * (LEN - 0.8)))
        cols.push(['#9b1c23', '#c9a45c', '#d7dbe0', '#1f4d36', '#7d141c'][Math.floor(r() * 5)])
      }
    }
    return { pts, cols }
  }, [])
  const hanging = useMemo(() => {
    const r = rng(23)
    const n = quality === 'basse' ? 24 : 46
    return Array.from({ length: n }, () => ({
      p: new THREE.Vector3(-14.6 + (r() - 0.5) * 3.4, 3.2 + r() * 1.9, ZC + (r() - 0.5) * 9),
      c: ['#9b1c23', '#c9a45c', '#d7dbe0', '#f3efe6'][Math.floor(r() * 4)],
      s: 0.1 + r() * 0.12,
    }))
  }, [quality])
  const stripLights = useMemo(() => [1.36, 1.9].flatMap((y) => Array.from({ length: 40 }, (_, i) => new THREE.Vector3(-15.45, y, Z0 + 0.2 + (i / 39) * (LEN - 0.4)))), [])
  return (
    <group>
      {/* vitrine murale */}
      <mesh material={lacquer} position={[-16.75, 1.5, ZC]} castShadow receiveShadow><boxGeometry args={[0.3, 3, LEN]} /></mesh>
      {[0.9, 1.4, 1.98].map((y) => (
        <mesh key={y} material={wood} position={[-16.05, y, ZC]} castShadow receiveShadow><boxGeometry args={[1.1, 0.06, LEN]} /></mesh>
      ))}
      <mesh material={wood} position={[-16.05, 0.45, ZC]} castShadow receiveShadow><boxGeometry args={[1.1, 0.9, LEN]} /></mesh>
      {[Z0, Z1, ZC - LEN / 6, ZC + LEN / 6].map((z) => (
        <mesh key={z} material={mat.goldSoft()} position={[-15.52, 1.5, z]}><boxGeometry args={[0.06, 3, 0.08]} /></mesh>
      ))}
      <mesh material={mat.goldSoft()} position={[-16.05, 3.02, ZC]}><boxGeometry args={[1.2, 0.1, LEN + 0.2]} /></mesh>
      {/* fronton arrondi */}
      <mesh material={lacquer} position={[-16.6, 3.0, ZC]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[1.6, 40, 0, Math.PI]} /></mesh>
      <mesh geometry={starGeometry(0.2)} material={mat.gold()} position={[-16.55, 3.9, ZC]} rotation={[0, Math.PI / 2, 0]} scale={0.32} />
      <Baubles points={shelfDecor.pts} colors={shelfDecor.cols} size={0.06} />
      <Bulbs points={stripLights} color="#fff1d0" size={0.02} intensity={2} twinkle={0} />
      {/* table d'exposition */}
      <mesh material={wood} position={[-12.2, 0.88, -10]} castShadow receiveShadow><boxGeometry args={[1.3, 0.06, 8.6]} /></mesh>
      <mesh material={mat.velvet('#4e0c12')} position={[-12.2, 0.915, -10]} receiveShadow><boxGeometry args={[0.7, 0.01, 8.6]} /></mesh>
      {[[-12.75, -14.1], [-11.65, -14.1], [-12.75, -5.9], [-11.65, -5.9], [-12.75, -10], [-11.65, -10]].map(([x, z], i) => (
        <mesh key={i} material={mat.goldSoft()} position={[x, 0.43, z]} castShadow><cylinderGeometry args={[0.035, 0.025, 0.86, 10]} /></mesh>
      ))}
      <mesh material={wood} position={[-12.2, 0.2, -10]}><boxGeometry args={[1.1, 0.04, 8.3]} /></mesh>
      {/* boules suspendues au plafond */}
      {hanging.map((h, i) => (
        <group key={i} position={h.p}>
          <mesh material={mat.goldSoft()} position={[0, (7.5 - h.p.y) / 2, 0]}><cylinderGeometry args={[0.003, 0.003, 7.5 - h.p.y, 3]} /></mesh>
          <mesh material={mat.lacquer(h.c, 0.12, 0.6)} scale={h.s}><sphereGeometry args={[1, 24, 16]} /></mesh>
        </group>
      ))}
      <pointLight position={[-10.5, 4.6, -10]} color="#ffe2b0" intensity={16} distance={11} decay={1.6} />
    </group>
  )
}
