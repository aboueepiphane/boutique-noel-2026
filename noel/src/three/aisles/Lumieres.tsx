import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mat } from '../models/materials'
import { Bulbs } from '../models/common'
import { starGeometry } from '../models/geometry'
import { rng } from '../../lib/textures'

/** Allée 03 — ambiance nocturne : mur étoilé, arches lumineuses, lampadaires. */
export function LumieresAisle({ quality }: { quality: string }) {
  const sky = useMemo(() => {
    const r = rng(61)
    const n = quality === 'basse' ? 160 : 320
    return Array.from({ length: n }, () => new THREE.Vector3(-9.5 + r() * 19, 0.4 + r() * 6.6, -25.85))
  }, [quality])
  const arches = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (const z of [-15.6, -19.2, -22.8]) {
      for (let i = 0; i <= 50; i++) {
        const a = (i / 50) * Math.PI
        pts.push(new THREE.Vector3(Math.cos(a) * 7.2, 0.2 + Math.sin(a) * 6.3, z))
      }
    }
    return pts
  }, [])
  const curtainWall = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let s = 0; s < 34; s++) for (let i = 0; i < 18; i++) pts.push(new THREE.Vector3(-8.2 + s * 0.5, 5.6 - i * 0.28 - (s % 3) * 0.1, -25.7))
    return pts
  }, [])
  const shooting = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.25) % 1
    shooting.current.position.set(-8 + t * 16, 6.2 - t * 1.6, -25.6)
    ;(shooting.current.children[0] as THREE.Mesh).scale.x = 0.8 + Math.sin(t * Math.PI) * 1.2
  })
  return (
    <group>
      {/* tapis bleu nuit */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, -20.5]} receiveShadow>
        <planeGeometry args={[18, 11]} />
        <meshStandardMaterial color="#121a2e" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.009, -20.5]}>
        <ringGeometry args={[4.3, 4.36, 64, 1]} />
        <meshStandardMaterial color="#c9a45c" metalness={1} roughness={0.3} />
      </mesh>
      {/* toile de fond nocturne */}
      <mesh position={[0, 3.75, -25.9]}><planeGeometry args={[20, 7.5]} /><meshStandardMaterial color="#0c1224" roughness={1} /></mesh>
      <Bulbs points={sky} color="#eef4ff" size={0.025} intensity={1.8} twinkle={1.6} palette={['#eef4ff', '#fff3d6', '#dbe8ff']} />
      <Bulbs points={curtainWall} color="#ffd9a0" size={0.018} intensity={1.6} twinkle={0.9} />
      <group ref={shooting} userData={{ noMerge: true }}>
        <mesh material={mat.basicGlow('#fff6dc', 0.7)} scale={[1, 0.02, 1]}><planeGeometry args={[0.6, 1]} /></mesh>
      </group>
      {/* lune */}
      <mesh position={[6.4, 5.6, -25.8]} material={mat.glow('#fff2d0', 1.3)}><circleGeometry args={[0.55, 40]} /></mesh>
      <mesh position={[6.4, 5.6, -25.82]} material={mat.basicGlow('#fff2d0', 0.15)}><circleGeometry args={[1.1, 40]} /></mesh>
      {/* arches lumineuses */}
      <Bulbs points={arches} color="#ffd38a" size={0.05} intensity={2.4} twinkle={1} />
      {[-15.6, -19.2, -22.8].map((z) => (
        <mesh key={z} position={[0, 0.2, z]} material={mat.metal('#3a3530', 0.5)}><torusGeometry args={[7.2, 0.035, 6, 60, Math.PI]} /></mesh>
      ))}
      {/* lampadaires */}
      {[[-7.6, -17], [7.6, -17], [-7.6, -22.5], [7.6, -22.5]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh material={mat.metal('#1d2a26', 0.45)} position={[0, 1.6, 0]} castShadow><cylinderGeometry args={[0.06, 0.1, 3.2, 10]} /></mesh>
          <mesh material={mat.metal('#1d2a26', 0.45)} position={[0, 0.1, 0]}><cylinderGeometry args={[0.18, 0.22, 0.2, 12]} /></mesh>
          <mesh material={mat.glass('#ffe9b8', 0.4)} position={[0, 3.45, 0]}><cylinderGeometry args={[0.16, 0.11, 0.4, 6]} /></mesh>
          <mesh material={mat.glow('#ffcf87', 2.6)} position={[0, 3.45, 0]}><sphereGeometry args={[0.07, 10, 8]} /></mesh>
          <mesh material={mat.metal('#1d2a26', 0.45)} position={[0, 3.72, 0]}><coneGeometry args={[0.25, 0.18, 6]} /></mesh>
          <mesh material={mat.velvet('#8e1b26')} position={[0, 2.6, 0.08]}><torusGeometry args={[0.16, 0.05, 8, 16]} /></mesh>
        </group>
      ))}
      {/* étoiles géantes suspendues */}
      {[[-4.5, 5.2, -21], [4.5, 5.6, -20], [0, 6.0, -23.5]].map((p, i) => (
        <mesh key={i} geometry={starGeometry(0.12)} material={mat.glow('#ffe3a0', 0.9)} position={p as [number, number, number]} scale={0.38 + i * 0.08} rotation={[0, 0, i * 0.3]} />
      ))}
      <pointLight position={[0, 4, -19.5]} color="#9fb7ff" intensity={18} distance={12} decay={1.6} />
      <pointLight position={[0, 1.6, -18]} color="#ffc98a" intensity={10} distance={7} decay={1.8} />
    </group>
  )
}
