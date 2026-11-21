import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mat } from '../models/materials'
import { ChristmasTree } from '../models/trees'
import { Bulbs } from '../models/common'
import { rng } from '../../lib/textures'

const TOP = 0.86 // hauteur du plateau du diorama

/** Maisonnette du village : murs, toit enneigé, fenêtres éclairées, cheminée. */
function House({ position, rot = 0, color = '#b5835a', w = 0.8, d = 0.7, h = 0.6, roof = '#5b2a22' }: { position: [number, number, number]; rot?: number; color?: string; w?: number; d?: number; h?: number; roof?: string }) {
  const roofGeo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-w / 2 - 0.08, 0); s.lineTo(0, h * 0.7); s.lineTo(w / 2 + 0.08, 0); s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: d + 0.16, bevelEnabled: false })
    g.translate(0, 0, -(d + 0.16) / 2)
    return g
  }, [w, d, h])
  const win = mat.glow('#ffc46b', 1.6)
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh material={mat.std(color, 0.85)} position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, h, d]} /></mesh>
      <mesh geometry={roofGeo} material={mat.std(roof, 0.8)} position={[0, h, 0]} castShadow />
      <mesh geometry={roofGeo} material={mat.snow()} position={[0, h + 0.04, 0]} scale={[0.98, 0.98, 1.02]} />
      <mesh material={mat.std('#6b4a3a', 0.9)} position={[w * 0.28, h + h * 0.45, 0.1]} castShadow><boxGeometry args={[0.1, h * 0.45, 0.1]} /></mesh>
      {/* fenêtres et porte (face −x, côté visiteur) */}
      {[-0.18, 0.18].map((z) => <mesh key={z} material={win} position={[-w / 2 - 0.005, h * 0.58, z * d * 1.6]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[0.12, 0.14]} /></mesh>)}
      <mesh material={mat.wood('#4a2e1a')} position={[-w / 2 - 0.006, h * 0.22, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[0.14, h * 0.44]} /></mesh>
      {[-0.18, 0.18].map((x) => <mesh key={x} material={win} position={[x * w, h * 0.58, d / 2 + 0.005]}><planeGeometry args={[0.12, 0.14]} /></mesh>)}
    </group>
  )
}

/** Petit train qui fait le tour du village. */
function Train() {
  const ref = useRef<THREE.Group>(null!)
  const cars = [['#8e1b26', 0.26], ['#1f4d36', 0.2], ['#c9a45c', 0.2]] as const
  useFrame((_, dt) => { ref.current.rotation.y += dt * 0.35 })
  const R = 1.7
  return (
    <group position={[16.0, TOP + 0.02, -10]} userData={{ noMerge: true }}>
      <mesh material={mat.metal('#5a5a60', 0.4)} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[R - 0.06, R + 0.06, 64]} /></mesh>
      <group ref={ref}>
        {cars.map(([c, len], i) => {
          const a = -i * 0.17
          return (
            <group key={i} position={[Math.cos(a) * R, 0.07, Math.sin(a) * R]} rotation={[0, -a, 0]}>
              <mesh material={mat.lacquer(c, 0.3)} castShadow><boxGeometry args={[0.1, 0.1, len]} /></mesh>
              {i === 0 && <>
                <mesh material={mat.lacquer('#1a1512', 0.3)} position={[0, 0.09, 0.06]}><cylinderGeometry args={[0.025, 0.03, 0.08, 10]} /></mesh>
                <mesh material={mat.glow('#fff1c4', 2)} position={[0, 0.02, 0.135]}><sphereGeometry args={[0.018, 8, 6]} /></mesh>
              </>}
              {[-1, 1].map((s) => <mesh key={s} material={mat.dark()} position={[0.055 * s, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 0.01, 12]} /></mesh>)}
            </group>
          )
        })}
      </group>
    </group>
  )
}

/** Allée 04 — village de Noël miniature sur un diorama enneigé. */
export function VillageAisle({ quality }: { quality: string }) {
  const trees = useMemo(() => {
    const r = rng(404)
    return Array.from({ length: quality === 'basse' ? 10 : 18 }, () => ({ x: 13.2 + r() * 5.8, z: -15.2 + r() * 10.4, h: 0.35 + r() * 0.5, s: Math.floor(r() * 50) }))
      .filter((t) => Math.hypot(t.x - 16, t.z + 10) > 2.0 || Math.hypot(t.x - 16, t.z + 10) < 1.3)
  }, [quality])
  const lamps = useMemo(() => Array.from({ length: 10 }, (_, i) => new THREE.Vector3(16 + Math.cos(i * 0.63) * 2.05, TOP + 0.3, -10 + Math.sin(i * 0.63) * 2.05)), [])
  const sky = useMemo(() => {
    const r = rng(3)
    return Array.from({ length: 90 }, () => new THREE.Vector3(19.92, 1.2 + r() * 5.6, -15.8 + r() * 11.6))
  }, [])
  return (
    <group>
      {/* socle du diorama */}
      <mesh material={mat.wood('#4a2e1a')} position={[16, TOP / 2, -10]} castShadow receiveShadow><boxGeometry args={[7.2, TOP, 11.8]} /></mesh>
      <mesh material={mat.snow()} position={[16, TOP + 0.01, -10]} receiveShadow><boxGeometry args={[7.1, 0.03, 11.7]} /></mesh>
      <mesh material={mat.goldSoft()} position={[12.39, TOP - 0.05, -10]}><boxGeometry args={[0.03, 0.06, 11.8]} /></mesh>
      {/* étang gelé */}
      <mesh position={[16, TOP + 0.03, -10]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.1, 40]} /><meshPhysicalMaterial color="#a9c6d8" roughness={0.05} metalness={0.1} clearcoat={1} /></mesh>
      {/* maisons */}
      <House position={[14.0, TOP, -14.2]} color="#c99a6b" />
      <House position={[13.8, TOP, -12.2]} color="#e7dcc4" roof="#2f4a3a" w={0.7} />
      <House position={[18.4, TOP, -14.6]} color="#b5835a" h={0.75} rot={-0.3} />
      <House position={[18.6, TOP, -6.0]} color="#d9c7a7" roof="#7d141c" />
      <House position={[13.9, TOP, -6.4]} color="#a8724a" w={0.9} />
      <House position={[18.8, TOP, -9.8]} color="#efe6d2" roof="#3b2b22" w={1.0} d={0.9} h={0.9} />
      {/* église au clocher */}
      <group position={[18.6, TOP, -12.3]}>
        <House position={[0, 0, 0]} color="#efe6d2" roof="#3b4b5b" w={0.9} d={0.6} h={0.7} />
        <mesh material={mat.std('#efe6d2', 0.85)} position={[-0.2, 1.05, 0]} castShadow><boxGeometry args={[0.28, 0.7, 0.28]} /></mesh>
        <mesh material={mat.std('#3b4b5b', 0.8)} position={[-0.2, 1.6, 0]} castShadow><coneGeometry args={[0.22, 0.45, 4]} /></mesh>
        <mesh material={mat.glow('#ffd38a', 1.4)} position={[-0.345, 1.1, 0]} rotation={[0, -Math.PI / 2, 0]}><circleGeometry args={[0.06, 16]} /></mesh>
      </group>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, TOP, t.z]}><ChristmasTree height={t.h} snow seed={300 + t.s} tiers={5} /></group>
      ))}
      <Train />
      <Bulbs points={lamps} color="#ffcf87" size={0.022} intensity={2.4} twinkle={0.3} />
      {lamps.map((p, i) => <mesh key={i} material={mat.metal('#2b2b30', 0.5)} position={[p.x, TOP + 0.15, p.z]}><cylinderGeometry args={[0.008, 0.01, 0.3, 5]} /></mesh>)}
      {/* toile de fond : ciel nocturne et collines */}
      <mesh position={[19.95, 3.8, -10]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[11.8, 6.6]} /><meshStandardMaterial color="#16223a" roughness={1} /></mesh>
      {[[-13.5, 1.9, 3.2], [-9.5, 1.5, 4], [-6.5, 2.1, 3.4]].map(([z, h, w], i) => (
        <mesh key={i} position={[19.9, 0.9 + h / 2, z]} rotation={[0, -Math.PI / 2, 0]} material={mat.std('#33435e', 1)}><circleGeometry args={[w, 32, 0, Math.PI]} /></mesh>
      ))}
      <Bulbs points={sky} color="#eef4ff" size={0.02} intensity={1.8} twinkle={1.2} />
      {/* présentoirs de la façade : le rebord où sont posés les produits */}
      <mesh material={mat.wood('#6b4428')} position={[11.6, 0.46, -9.9]} castShadow receiveShadow><boxGeometry args={[1.1, 0.92, 11.4]} /></mesh>
      <mesh material={mat.velvet('#7d141c')} position={[11.6, 0.93, -9.9]}><boxGeometry args={[1.12, 0.02, 11.42]} /></mesh>
      <mesh material={mat.goldSoft()} position={[11.04, 0.85, -9.9]}><boxGeometry args={[0.02, 0.05, 11.4]} /></mesh>
      <pointLight position={[10.5, 3.6, -10]} color="#ffd6a0" intensity={16} distance={11} decay={1.6} />
    </group>
  )
}
