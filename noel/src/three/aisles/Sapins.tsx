import { useMemo } from 'react'
import * as THREE from 'three'
import { mat } from '../models/materials'
import { ChristmasTree } from '../models/trees'
import { Bulbs } from '../models/common'
import { rng } from '../../lib/textures'

/** Allée 01 — forêt miniature enneigée, éclairage vert et doré. */
export function SapinsAisle({ quality }: { quality: string }) {
  const forest = useMemo(() => {
    const r = rng(101)
    const n = quality === 'basse' ? 6 : 9
    return Array.from({ length: n }, (_, i) => ({
      x: -19.0 + r() * 0.8,
      z: 1.8 + (i / (n - 1)) * 12.8 + (r() - 0.5) * 0.6,
      h: 3.2 + r() * 1.6,
      seed: 200 + i,
      tint: ['#163a2a', '#1a4030', '#143526'][i % 3],
    }))
  }, [quality])
  const mounds = useMemo(() => {
    const r = rng(77)
    return Array.from({ length: 16 }, () => ({ x: -19 + r() * 6, z: 1.8 + r() * 13, s: 0.35 + r() * 0.6 }))
  }, [])
  const fairy = useMemo(() => {
    const r = rng(5)
    return Array.from({ length: 70 }, () => new THREE.Vector3(-19.4 + r() * 6.4, 0.6 + r() * 3.6, 1.8 + r() * 13))
  }, [])
  return (
    <group>
      {/* estrade enneigée */}
      <mesh material={mat.wood('#3b2416')} position={[-16.2, 0.12, 8.3]} castShadow receiveShadow><boxGeometry args={[7.4, 0.24, 13.6]} /></mesh>
      <mesh material={mat.snow()} position={[-16.2, 0.25, 8.3]} receiveShadow><boxGeometry args={[7.3, 0.04, 13.5]} /></mesh>
      <mesh material={mat.goldSoft()} position={[-12.48, 0.24, 8.3]}><boxGeometry args={[0.04, 0.04, 13.6]} /></mesh>
      {mounds.map((m, i) => (
        <mesh key={i} material={mat.snow()} position={[m.x, 0.25, m.z]} scale={[m.s * 1.6, m.s * 0.35, m.s * 1.2]} receiveShadow>
          <sphereGeometry args={[1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      ))}
      {/* forêt de fond */}
      {forest.map((t, i) => (
        <group key={i} position={[t.x, 0.25, t.z]}>
          <ChristmasTree height={t.h} color={t.tint} seed={t.seed} tiers={6} />
        </group>
      ))}
      <Bulbs points={fairy} color="#e8ffd8" size={0.025} intensity={2} twinkle={1.2} palette={['#fff1c4', '#d7f5c8', '#ffd38a']} />
      {/* clôture de bois au bord de l'estrade */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} material={mat.wood('#6b4428')} position={[-12.7, 0.55, 2.0 + i * 1.15]} castShadow><boxGeometry args={[0.07, 0.6, 0.07]} /></mesh>
      ))}
      {[0.45, 0.72].map((y) => (
        <group key={y}>
          <mesh material={mat.wood('#6b4428')} position={[-12.7, y, 4.1]}><boxGeometry args={[0.05, 0.06, 4.4]} /></mesh>
          <mesh material={mat.wood('#6b4428')} position={[-12.7, y, 13.6]}><boxGeometry args={[0.05, 0.06, 2.4]} /></mesh>
        </group>
      ))}
      {/* lanternes */}
      {[2.4, 14.2].map((z) => (
        <group key={z} position={[-12.7, 0, z]}>
          <mesh material={mat.metal('#2b2b30', 0.5)} position={[0, 1.1, 0]}><cylinderGeometry args={[0.04, 0.05, 2.2, 8]} /></mesh>
          <mesh material={mat.glass('#fff0c8', 0.35)} position={[0, 2.35, 0]}><boxGeometry args={[0.24, 0.32, 0.24]} /></mesh>
          <mesh material={mat.glow('#ffcf87', 2.2)} position={[0, 2.35, 0]}><sphereGeometry args={[0.06, 10, 8]} /></mesh>
          <mesh material={mat.metal('#2b2b30', 0.5)} position={[0, 2.57, 0]}><coneGeometry args={[0.2, 0.14, 4]} /></mesh>
        </group>
      ))}
      <pointLight position={[-11.5, 3.8, 8]} color="#cfe8c8" intensity={18} distance={12} decay={1.6} />
      <pointLight position={[-12, 2.4, 12]} color="#ffcf87" intensity={8} distance={8} decay={1.8} />
    </group>
  )
}
