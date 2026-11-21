import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mat } from '../models/materials'
import { Bulbs, Flame } from '../models/common'
import { ChristmasTree } from '../models/trees'
import { Greenery } from '../models/home'
import { plateGeometry } from '../models/geometry'
import { woodTexture, rng } from '../../lib/textures'

/** Feu de cheminée : flammes animées et lumière vacillante. */
function Fire() {
  const light = useRef<THREE.PointLight>(null!)
  const flames = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    light.current.intensity = 9 + Math.sin(t * 9) * 1.6 + Math.sin(t * 23) * 1.2
    flames.current.children.forEach((f, i) => {
      f.scale.y = 1 + Math.sin(t * (7 + i) + i) * 0.18
      f.rotation.z = Math.sin(t * 4 + i) * 0.08
    })
  })
  return (
    <group>
      {[[-0.15, 0], [0.15, 0.3], [0, -0.3]].map(([z, r], i) => (
        <mesh key={i} material={mat.wood('#3b2416')} position={[0, 0.08 + i * 0.05, z]} rotation={[r, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.07, 0.6, 8]} /></mesh>
      ))}
      <group ref={flames} position={[0, 0.15, 0]} userData={{ noMerge: true }}>
        {[[-0.12, 0.34, '#ff8a2a'], [0.05, 0.42, '#ffb347'], [0.16, 0.3, '#ff7a1a'], [0, 0.26, '#ffd27a']].map(([z, h, c], i) => (
          <mesh key={i} material={mat.glow(c as string, 2.4)} position={[0, (h as number) / 2, z as number]}><coneGeometry args={[0.08, h as number, 10]} /></mesh>
        ))}
      </group>
      <mesh material={mat.glow('#ff5a1a', 1.2)} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.35, 20]} /></mesh>
      <pointLight ref={light} position={[-0.5, 0.6, 0]} color="#ff9a4a" intensity={10} distance={7} decay={1.6} />
    </group>
  )
}

function Chair({ position, rot }: { position: [number, number, number]; rot: number }) {
  const w = mat.wood('#5a3620')
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh material={w} position={[0, 0.46, 0]} castShadow><boxGeometry args={[0.46, 0.05, 0.46]} /></mesh>
      <mesh material={mat.velvet('#7d141c')} position={[0, 0.5, 0]}><boxGeometry args={[0.42, 0.04, 0.42]} /></mesh>
      <mesh material={w} position={[0, 0.7, -0.21]} castShadow><boxGeometry args={[0.46, 0.45, 0.05]} /></mesh>
      {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z], i) => (
        <mesh key={i} material={w} position={[x, 0.22, z]}><boxGeometry args={[0.045, 0.45, 0.045]} /></mesh>
      ))}
    </group>
  )
}

function Console({ z, len = 1.8 }: { z: number; len?: number }) {
  const w = useMemo(() => new THREE.MeshStandardMaterial({ map: woodTexture('fonce'), color: '#9a6a48', roughness: 0.5 }), [])
  return (
    <group position={[11.4, 0, z]}>
      <mesh material={w} position={[0, 0.85, 0]} castShadow receiveShadow><boxGeometry args={[0.6, 0.06, len]} /></mesh>
      <mesh material={w} position={[0, 0.6, 0]}><boxGeometry args={[0.55, 0.4, len - 0.1]} /></mesh>
      <mesh material={mat.goldSoft()} position={[-0.28, 0.6, -len / 4]}><sphereGeometry args={[0.02, 8, 6]} /></mesh>
      <mesh material={mat.goldSoft()} position={[-0.28, 0.6, len / 4]}><sphereGeometry args={[0.02, 8, 6]} /></mesh>
      {[-1, 1].map((s) => [-1, 1].map((t) => (
        <mesh key={`${s}${t}`} material={w} position={[0.25 * s, 0.2, (len / 2 - 0.08) * t]}><boxGeometry args={[0.05, 0.4, 0.05]} /></mesh>
      )))}
    </group>
  )
}

/** Allée 05 — intérieur chaleureux : cheminée, table de fête, consoles. */
export function MaisonAisle({ quality }: { quality: string }) {
  const table = useMemo(() => new THREE.MeshStandardMaterial({ map: woodTexture('fonce'), color: '#8a5a3a', roughness: 0.45 }), [])
  const settings = useMemo(() => {
    const list: { p: [number, number, number]; r: number }[] = []
    for (const z of [5.4, 7.0, 9.0, 10.6]) {
      list.push({ p: [13.95, 0.8, z], r: Math.PI / 2 })
      list.push({ p: [15.25, 0.8, z], r: -Math.PI / 2 })
    }
    return list.filter((s) => !(Math.abs(s.p[0] - 14.1) < 0.3 && Math.abs(s.p[2] - 6) < 0.8))
  }, [])
  const garland = useMemo(() => Array.from({ length: 40 }, (_, i) => new THREE.Vector3(19.3, 1.58 + Math.sin((i / 39) * Math.PI) * -0.18, 6.6 + (i / 39) * 2.8)), [])
  const garLights = useMemo(() => garland.filter((_, i) => i % 2).map((p) => p.clone().add(new THREE.Vector3(-0.08, 0.02, 0))), [garland])
  const books = useMemo(() => {
    const r = rng(8)
    return Array.from({ length: 6 }, (_, i) => ({ z: 4.3 + i * 0.07, h: 0.18 + r() * 0.08, c: ['#7d141c', '#1f4d36', '#c9a45c', '#3b2416'][i % 4] }))
  }, [])
  return (
    <group>
      {/* tapis d'Orient */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14.6, 0.008, 8.2]} receiveShadow>
        <planeGeometry args={[6.4, 9.6]} />
        <meshStandardMaterial color="#5b1a1f" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14.6, 0.01, 8.2]}>
        <ringGeometry args={[3.0, 3.12, 4, 1, Math.PI / 4]} />
        <meshStandardMaterial color="#c9a45c" roughness={0.6} />
      </mesh>
      {/* table dressée */}
      <mesh material={table} position={[14.6, 0.76, 8]} castShadow receiveShadow><boxGeometry args={[1.9, 0.06, 6.6]} /></mesh>
      <mesh material={mat.std('#ddd3bf', 0.9)} position={[14.6, 0.795, 8]} receiveShadow><boxGeometry args={[1.94, 0.012, 6.64]} /></mesh>
      <mesh material={mat.std('#ddd3bf', 0.9)} position={[13.64, 0.62, 8]}><boxGeometry args={[0.012, 0.36, 6.64]} /></mesh>
      <mesh material={mat.std('#ddd3bf', 0.9)} position={[15.56, 0.62, 8]}><boxGeometry args={[0.012, 0.36, 6.64]} /></mesh>
      <mesh material={mat.velvet('#7d141c')} position={[14.6, 0.803, 8]}><boxGeometry args={[0.5, 0.006, 6.66]} /></mesh>
      {[[13.8, 5], [15.4, 5], [13.8, 11], [15.4, 11]].map(([x, z], i) => (
        <mesh key={i} material={table} position={[x, 0.37, z]} castShadow><boxGeometry args={[0.08, 0.74, 0.08]} /></mesh>
      ))}
      {settings.map((s, i) => (
        <group key={i} position={s.p} rotation={[0, s.r, 0]}>
          <mesh geometry={plateGeometry(0.13, 0.016)} material={mat.lacquer('#f6f2ea', 0.12, 0)} position={[0, 0.005, 0]} castShadow />
          <mesh material={mat.gold()} position={[0, 0.021, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.126, 0.0016, 4, 40]} /></mesh>
          <mesh material={mat.glass('#f6fbff', 0.3)} position={[0.17, 0.08, -0.12]}><cylinderGeometry args={[0.03, 0.022, 0.12, 14, 1, true]} /></mesh>
          <mesh material={mat.glass('#f6fbff', 0.4)} position={[0.17, 0.02, -0.12]}><cylinderGeometry args={[0.004, 0.004, 0.04, 5]} /></mesh>
          <mesh material={mat.velvet('#1f4d36')} position={[0, 0.03, 0]} rotation={[0, 0.7, 0]}><boxGeometry args={[0.05, 0.03, 0.08]} /></mesh>
        </group>
      ))}
      {[5.4, 7.0, 9.0, 10.6].flatMap((z) => [
        <Chair key={`w${z}`} position={[13.25, 0, z]} rot={Math.PI / 2} />,
        <Chair key={`e${z}`} position={[15.95, 0, z]} rot={-Math.PI / 2} />,
      ])}
      {[5.0, 11.0].map((z) => (
        <group key={z} position={[14.6, 0.8, z]}>
          <mesh material={mat.gold()} position={[0, 0.15, 0]}><cylinderGeometry args={[0.02, 0.06, 0.3, 12]} /></mesh>
          <mesh material={mat.std('#efe6d2', 0.6)} position={[0, 0.4, 0]}><cylinderGeometry args={[0.02, 0.02, 0.2, 10]} /></mesh>
          <Flame position={[0, 0.5, 0]} />
        </group>
      ))}
      {/* cheminée */}
      <group position={[19.6, 0, 8]}>
        <mesh material={mat.std('#b8aa92', 0.85)} position={[-0.3, 0.75, 0]} castShadow receiveShadow><boxGeometry args={[0.6, 1.5, 2.6]} /></mesh>
        <mesh material={mat.std('#1a1210', 0.95)} position={[-0.61, 0.5, 0]}><boxGeometry args={[0.02, 0.85, 1.3]} /></mesh>
        <mesh material={mat.wood('#3b2416')} position={[-0.42, 1.55, 0]} castShadow><boxGeometry args={[0.9, 0.1, 2.9]} /></mesh>
        <mesh material={mat.std('#b8aa92', 0.85)} position={[-0.15, 2.8, 0]}><boxGeometry args={[0.3, 2.4, 2.0]} /></mesh>
        <group position={[-0.7, 0, 0]}><Fire /></group>
        {[-0.9, 0.9].map((z) => (
          <group key={z} position={[-0.45, 1.6, z]}>
            <mesh material={mat.gold()} position={[0, 0.1, 0]}><cylinderGeometry args={[0.03, 0.05, 0.2, 10]} /></mesh>
            <mesh material={mat.std('#efe6d2', 0.6)} position={[0, 0.3, 0]}><cylinderGeometry args={[0.025, 0.025, 0.2, 10]} /></mesh>
            <Flame position={[0, 0.4, 0]} />
          </group>
        ))}
      </group>
      <Greenery points={garland} size={0.12} spread={0.08} />
      <Bulbs points={garLights} color="#ffd38a" size={0.016} intensity={2.4} twinkle={0.6} />
      <Console z={4.9} len={1.4} />
      <Console z={11.2} len={2.0} />
      {books.map((b, i) => <mesh key={i} material={mat.std(b.c, 0.7)} position={[11.4, 0.88 + b.h / 2, b.z]} castShadow><boxGeometry args={[0.2, b.h, 0.06]} /></mesh>)}
      {/* sapin décoré du salon */}
      <group position={[18.7, 0, 13]}><ChristmasTree height={2.6} lights={quality === 'basse' ? 50 : 110} baubles={30} star seed={55} /></group>
      {/* lampadaire */}
      <group position={[18.9, 0, 3.0]}>
        <mesh material={mat.metal('#b8914a', 0.35)} position={[0, 0.85, 0]}><cylinderGeometry args={[0.02, 0.03, 1.7, 8]} /></mesh>
        <mesh material={mat.std('#f1e6cf', 0.9)} position={[0, 1.75, 0]}><cylinderGeometry args={[0.18, 0.26, 0.3, 20, 1, true]} /></mesh>
        <mesh material={mat.glow('#ffd59a', 1.2)} position={[0, 1.7, 0]}><sphereGeometry args={[0.06, 10, 8]} /></mesh>
        <mesh material={mat.metal('#b8914a', 0.35)} position={[0, 0.02, 0]}><cylinderGeometry args={[0.18, 0.2, 0.04, 16]} /></mesh>
      </group>
      {/* cadres au mur */}
      {[[4.3, 2.6], [11.8, 2.4]].map(([z, y], i) => (
        <group key={i} position={[19.95, y, z]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh material={mat.goldSoft()}><boxGeometry args={[1.1, 0.8, 0.05]} /></mesh>
          <mesh position={[0, 0, 0.03]}><planeGeometry args={[0.95, 0.65]} /><meshStandardMaterial color={i ? '#2f4a3a' : '#5b1a1f'} roughness={0.9} /></mesh>
        </group>
      ))}
      <pointLight position={[11, 3.4, 8]} color="#ffd2a0" intensity={16} distance={10} decay={1.6} />
    </group>
  )
}
