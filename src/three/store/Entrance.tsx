import { useMemo, useState } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { mat } from '../models/materials'
import { Bulbs, Bow } from '../models/common'
import { Greenery } from '../models/home'
import { ChristmasTree } from '../models/trees'
import { Nutcracker, } from '../models/figures'
import { GiftBoxes } from '../models/home'
import { textTexture } from '../../lib/textures'
import { AISLES } from '../../data/aisles'
import { useNav } from '../../state/nav'
import { setCursor } from '../core/cursor'

const ARCH_Z = 14.6
const R = 3.3
const PH = 2.3 // hauteur des piliers

/** Arche d'entrée décorée de guirlandes, avec l'enseigne de la boutique. */
export function EntranceArch({ quality }: { quality: string }) {
  const { greens, bulbs } = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const n = quality === 'basse' ? 120 : 240
    // piliers + arc
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const total = PH + Math.PI * R + PH
      const s = t * total
      let p: THREE.Vector3
      if (s < PH) p = new THREE.Vector3(-R, s, 0)
      else if (s < PH + Math.PI * R) {
        const a = Math.PI - (s - PH) / R
        p = new THREE.Vector3(Math.cos(a) * R, PH + Math.sin(a) * R, 0)
      } else p = new THREE.Vector3(R, PH - (s - PH - Math.PI * R), 0)
      pts.push(p)
    }
    const bulbs = pts.filter((_, i) => i % 2 === 0).flatMap((p, i) => [p.clone().add(new THREE.Vector3(Math.sin(i) * 0.25, Math.cos(i * 1.3) * 0.2, 0.32)), p.clone().add(new THREE.Vector3(Math.cos(i) * 0.25, Math.sin(i * 1.7) * 0.2, -0.32))])
    return { greens: pts, bulbs }
  }, [quality])
  const sign = textTexture('NOËL & MERVEILLES', { w: 1024, h: 180, size: 104, color: '#f6e6bd' })
  const sub = textTexture('Maison de Noël — depuis 1926', { w: 1024, h: 120, size: 54, color: '#d8c08a', italic: true })
  return (
    <group position={[0, 0, ARCH_Z]}>
      {[-R, R].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh material={mat.wood('#3b2416')} position={[0, PH / 2, 0]} castShadow><boxGeometry args={[0.5, PH, 0.5]} /></mesh>
          <mesh material={mat.goldSoft()} position={[0, 0.1, 0]}><boxGeometry args={[0.7, 0.2, 0.7]} /></mesh>
          <mesh material={mat.goldSoft()} position={[0, PH, 0]}><boxGeometry args={[0.65, 0.12, 0.65]} /></mesh>
        </group>
      ))}
      <mesh material={mat.wood('#3b2416')} position={[0, PH, 0]} castShadow>
        <torusGeometry args={[R, 0.25, 10, 48, Math.PI]} />
      </mesh>
      <Greenery points={greens} size={0.3} spread={0.42} color="#1f4d36" />
      <Greenery points={greens} size={0.24} spread={0.5} color="#2e6247" seed={8} />
      <Greenery points={greens.filter((_, i) => i % 3 === 0)} size={0.2} spread={0.55} color="#4d7a5f" seed={9} />
      <Bulbs points={bulbs} color="#ffd38a" size={0.035} intensity={2.6} twinkle={0.6} />
      <group position={[0, PH + R + 0.15, 0.35]}><Bow color="#9b1c23" size={0.7} /></group>
      {[-1, 1].map((s) => <group key={s} position={[s * R * 0.72, PH + R * 0.7, 0.35]}><Bow color="#9b1c23" size={0.34} /></group>)}
      {/* enseigne suspendue */}
      <group position={[0, PH + R - 0.85, 0.05]}>
        {[-1.6, 1.6].map((x) => <mesh key={x} material={mat.goldSoft()} position={[x, 0.6, 0]}><cylinderGeometry args={[0.012, 0.012, 1.0, 4]} /></mesh>)}
        <mesh material={mat.wood('#4b1015')}><boxGeometry args={[3.9, 0.85, 0.08]} /></mesh>
        <mesh material={mat.goldSoft()} position={[0, 0, 0.0]}><boxGeometry args={[4.0, 0.95, 0.06]} /></mesh>
        {[1, -1].map((side) => (
          <group key={side} rotation={[0, side > 0 ? 0 : Math.PI, 0]}>
            <mesh position={[0, 0.09, 0.05]}><planeGeometry args={[3.6, 0.63]} /><meshBasicMaterial map={sign} transparent toneMapped={false} /></mesh>
            <mesh position={[0, -0.27, 0.05]}><planeGeometry args={[2.6, 0.3]} /><meshBasicMaterial map={sub} transparent /></mesh>
          </group>
        ))}
      </group>
      {/* casse-noisettes géants qui gardent l'entrée */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 4.9, 0, 0.6]} rotation={[0, s * -0.3, 0]} scale={3.6}>
          <Nutcracker color="#8e1b26" />
        </group>
      ))}
      {/* sapins en pot de part et d'autre */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 7.4, 0.35, 0.2]}>
          <ChristmasTree height={2.8} pot lights={quality === 'basse' ? 40 : 80} baubles={24} seed={s > 0 ? 12 : 13} />
        </group>
      ))}
    </group>
  )
}

/** Le grand sapin central, son estrade et ses cadeaux. */
export function CentralTree({ quality }: { quality: string }) {
  const lights = quality === 'basse' ? 260 : quality === 'moyenne' ? 420 : 620
  return (
    <group>
      <mesh material={mat.velvet('#7d141c')} position={[0, 0.18, 0]} castShadow receiveShadow><cylinderGeometry args={[3.2, 3.35, 0.36, 64]} /></mesh>
      <mesh material={mat.goldSoft()} position={[0, 0.37, 0]}><torusGeometry args={[3.2, 0.04, 8, 96]} /></mesh>
      <mesh material={mat.fur()} position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.6, 2.2, 48]} /></mesh>
      <group position={[0, 0.36, 0]}>
        <ChristmasTree height={6.6} radius={2.55} lights={lights} baubles={quality === 'basse' ? 90 : 170} tiers={11} star seed={42}
          baubleColors={['#9b1c23', '#c9a45c', '#f3efe6', '#7d141c', '#d4af6a']} />
      </group>
      {/* cadeaux au pied */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.3
        const d = 2.35 + (i % 2) * 0.35
        return (
          <group key={i} position={[Math.cos(a) * d, 0.36, Math.sin(a) * d]} rotation={[0, -a + Math.PI / 2, 0]} scale={2.4 + (i % 3) * 0.4}>
            <GiftBoxes color={['#9b1c23', '#1f4d36', '#c9a45c'][i % 3]} accent={['#c9a45c', '#9b1c23', '#f3efe6'][i % 3]} />
          </group>
        )
      })}
    </group>
  )
}

const ARROW_SPECS = AISLES.map((a, i) => ({ aisle: a, y: 2.55 - i * 0.38 }))

/** Poteau indicateur près de l'entrée : un panneau par allée, cliquable. */
export function Signpost() {
  const travelTo = useNav((s) => s.travelTo)
  const [hover, setHover] = useState<number | null>(null)
  const pos: [number, number, number] = [2.8, 0, 9.6]
  return (
    <group position={pos}>
      <mesh material={mat.wood('#4a2e1a')} position={[0, 1.45, 0]} castShadow><cylinderGeometry args={[0.07, 0.09, 2.9, 12]} /></mesh>
      <mesh material={mat.goldSoft()} position={[0, 2.95, 0]}><sphereGeometry args={[0.1, 14, 12]} /></mesh>
      <mesh material={mat.snow()} position={[0, 3.0, 0]} scale={[1, 0.4, 1]}><sphereGeometry args={[0.13, 12, 8]} /></mesh>
      {ARROW_SPECS.map(({ aisle, y }, i) => {
        const dx = aisle.center[0] - pos[0]
        const dz = aisle.center[1] - pos[2]
        const ang = Math.atan2(-dz, dx) // rotation autour de y pour pointer vers l'allée
        const tex = textTexture(`${aisle.number} · ${aisle.address.split('— ')[1]}`, { w: 1024, h: 160, size: 74, color: '#f4e4bd' })
        const onClick = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          if (e.delta > 8) return
          travelTo(aisle.viewpoint[0], aisle.viewpoint[1], aisle.viewpoint[2])
        }
        const hovered = hover === i
        return (
          <group key={aisle.id} position={[0, y, 0]} rotation={[0, ang, 0]}>
            <group position={[0.75, 0, 0]}
              onClick={onClick}
              onPointerOver={(e) => { e.stopPropagation(); setHover(i); setCursor('pointer') }}
              onPointerOut={() => { setHover(null); setCursor(null) }}>
              <mesh material={mat.wood(hovered ? '#7a1720' : '#3b2416')} castShadow><boxGeometry args={[1.5, 0.3, 0.05]} /></mesh>
              <mesh material={mat.wood(hovered ? '#7a1720' : '#3b2416')} position={[0.82, 0, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.212, 0.212, 0.05]} /></mesh>
              {[1, -1].map((s) => (
                <mesh key={s} position={[0, 0, 0.03 * s]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
                  <planeGeometry args={[1.42, 0.22]} />
                  <meshBasicMaterial map={tex} transparent toneMapped={false} color={hovered ? '#ffffff' : '#e8dcc0'} />
                </mesh>
              ))}
            </group>
          </group>
        )
      })}
    </group>
  )
}
