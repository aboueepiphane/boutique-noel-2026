import { useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { AISLES } from '../../data/aisles'
import type { AisleId } from '../../data/types'
import { signTexture, textTexture } from '../../lib/textures'
import { mat } from '../models/materials'
import { useNav } from '../../state/nav'
import { setCursor } from '../core/cursor'

const SIGN_POS: Record<AisleId, { p: [number, number, number]; r: number }> = {
  sapins: { p: [-10.4, 4.4, 8.3], r: Math.PI / 2 },
  ornements: { p: [-10.4, 4.4, -10], r: Math.PI / 2 },
  lumieres: { p: [0, 4.9, -14.4], r: 0 },
  village: { p: [10.4, 4.4, -10], r: -Math.PI / 2 },
  maison: { p: [10.4, 4.4, 8.3], r: -Math.PI / 2 },
}

/** Panneaux suspendus des allées et médaillons au sol : cliquer pour s'y rendre. */
export function AisleSigns() {
  const travelTo = useNav((s) => s.travelTo)
  const [hover, setHover] = useState<AisleId | null>(null)
  return (
    <group>
      {AISLES.map((a) => {
        const { p, r } = SIGN_POS[a.id]
        const tex = signTexture(a.number, a.title, a.address, a.color)
        const go = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          if (e.delta > 8) return
          travelTo(a.viewpoint[0], a.viewpoint[1], a.viewpoint[2])
        }
        const over = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(a.id); setCursor('pointer') }
        const out = () => { setHover(null); setCursor(null) }
        const h = hover === a.id
        return (
          <group key={a.id}>
            <group position={p} rotation={[0, r, 0]} onClick={go} onPointerOver={over} onPointerOut={out}>
              {[-1.15, 1.15].map((x) => (
                <mesh key={x} material={mat.goldSoft()} position={[x, (7.5 - p[1]) / 2 + 0.4, 0]}><cylinderGeometry args={[0.012, 0.012, 7.5 - p[1] - 0.8, 4]} /></mesh>
              ))}
              <mesh material={mat.goldSoft()}><boxGeometry args={[2.86, 1.1, 0.07]} /></mesh>
              {[1, -1].map((s) => (
                <mesh key={s} position={[0, 0, 0.04 * s]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
                  <planeGeometry args={[2.8, 1.05]} />
                  <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={h ? 0.55 : 0.25} roughness={0.5} />
                </mesh>
              ))}
            </group>
            <FloorMedallion aisle={a.id} number={a.number} position={[a.viewpoint[0], a.viewpoint[1]]} onClick={go} onOver={over} onOut={out} hovered={h} />
          </group>
        )
      })}
    </group>
  )
}

function FloorMedallion({ number, position, onClick, onOver, onOut, hovered }: {
  aisle: AisleId; number: string; position: [number, number]; hovered: boolean
  onClick: (e: ThreeEvent<MouseEvent>) => void; onOver: (e: ThreeEvent<PointerEvent>) => void; onOut: () => void
}) {
  const ring = useRef<THREE.Mesh>(null!)
  const tex = textTexture(number, { w: 256, h: 256, size: 150, color: '#e8cf93' })
  useFrame(({ clock }) => {
    const m = ring.current.material as THREE.MeshBasicMaterial
    m.opacity = (hovered ? 0.9 : 0.35) + Math.sin(clock.elapsedTime * 2) * 0.1
  })
  return (
    <group position={[position[0], 0.015, position[1]]} rotation={[-Math.PI / 2, 0, 0]} onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
      <mesh ref={ring}>
        <ringGeometry args={[0.55, 0.62, 48]} />
        <meshBasicMaterial color="#e9c97d" transparent opacity={0.4} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.5, 40]} />
        <meshStandardMaterial color="#2a1a12" roughness={0.4} metalness={0.3} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}
