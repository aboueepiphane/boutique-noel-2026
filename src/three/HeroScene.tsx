import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { ChristmasTree } from './models/trees'
import { GiftBoxes, Wreath } from './models/home'
import { Ornament } from './models/common'
import { Snow } from './core/Snow'
import { useUI } from '../state/ui'

function Rig() {
  useFrame(({ camera, clock, pointer, size }) => {
    const t = clock.elapsedTime * 0.05
    const r = 11
    const wide = size.width > 900
    const tx = Math.sin(t) * r + pointer.x * 0.5
    const tz = Math.cos(t) * r
    camera.position.lerp(new THREE.Vector3(tx, 3.0 + pointer.y * 0.3, tz), 0.05)
    // Sur grand écran, on vise à gauche du sapin pour le décaler à droite du texte.
    const right = new THREE.Vector3(Math.cos(t), 0, -Math.sin(t))
    const target = new THREE.Vector3(0, 2.7, 0).addScaledVector(right, wide ? -3.6 : 0)
    camera.lookAt(target)
  })
  return null
}

function Floating() {
  const g = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    g.current.children.forEach((c, i) => {
      c.position.y = 3.2 + Math.sin(clock.elapsedTime * 0.6 + i * 1.7) * 0.25 + (i % 3) * 0.9
      c.rotation.y = clock.elapsedTime * 0.3 + i
    })
  })
  const colors = ['#9b1c23', '#c9a45c', '#f3efe6', '#9b1c23', '#c9a45c', '#1f4d36']
  return (
    <group ref={g}>
      {colors.map((c, i) => {
        const a = (i / colors.length) * Math.PI * 2
        return <group key={i} position={[Math.cos(a) * 3.6, 3, Math.sin(a) * 3.6]}><Ornament color={c} radius={0.22} /></group>
      })}
    </group>
  )
}

/** Visuel d'accueil : un sapin illuminé, des cadeaux et une neige douce, caméra en orbite lente. */
export default function HeroScene() {
  const quality = useUI((s) => s.quality)
  return (
    <Canvas dpr={quality === 'basse' ? 1 : [1, 1.75]} camera={{ fov: 40, position: [0, 3, 11] }}
      gl={{ antialias: quality !== 'basse', powerPreference: 'high-performance' }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        scene.background = new THREE.Color('#140d09')
        scene.fog = new THREE.Fog('#140d09', 9, 22)
      }}>
      <Rig />
      <hemisphereLight args={['#ffe0b8', '#2a1a10', 0.5]} />
      <pointLight position={[0, 3, 3.5]} intensity={40} color="#ffc887" decay={1.6} />
      <pointLight position={[-4, 5, -2]} intensity={20} color="#ffd9a8" decay={1.6} />
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={1.4} position={[0, 5, 3]} scale={[8, 4, 1]} color="#ffdcb0" />
        <Lightformer intensity={0.6} position={[-5, 2, 0]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#9b1c23" />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color="#efe7da" roughness={0.75} />
      </mesh>
      <ChristmasTree height={5.2} radius={2.0} lights={quality === 'basse' ? 220 : 420} baubles={110} tiers={10} star seed={77}
        baubleColors={['#9b1c23', '#c9a45c', '#f3efe6', '#d4af6a']} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.5
        return (
          <group key={i} position={[Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2]} rotation={[0, -a, 0]} scale={2.2 + (i % 3) * 0.5}>
            <GiftBoxes color={['#9b1c23', '#1f4d36', '#c9a45c'][i % 3]} accent={['#c9a45c', '#f3efe6', '#9b1c23'][i % 3]} />
          </group>
        )
      })}
      <group position={[-4.2, 0.1, -1.5]} scale={2.5} rotation={[0, 0.8, 0]}><Wreath /></group>
      <Floating />
      <Snow count={quality === 'basse' ? 400 : 900} area={{ minX: -8, maxX: 8, minZ: -8, maxZ: 8 }} top={8} />
      {quality !== 'basse' && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.9} radius={0.75} />
          <Vignette offset={0.2} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
