import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mat } from './materials'
import { Bulbs, Flame } from './common'
import { starCurve } from './geometry'

/** Guirlande fil d'or : bobine en bois + fil qui retombe en festons lumineux. */
export function LedString({ color = '#ffd38a' }: { color?: string }) {
  const { curve, pts } = useMemo(() => {
    const ctrl: THREE.Vector3[] = []
    // spirale autour de la bobine puis festons vers la droite
    for (let i = 0; i <= 24; i++) {
      const a = i * 0.9
      ctrl.push(new THREE.Vector3(-0.18 + Math.cos(a) * 0.075, 0.12 + i * 0.008, Math.sin(a) * 0.075))
    }
    for (let i = 1; i <= 16; i++) {
      const t = i / 16
      ctrl.push(new THREE.Vector3(-0.1 + t * 0.42, 0.34 - Math.abs(Math.sin(t * Math.PI * 2.5)) * 0.18, 0.02 * Math.sin(t * 9)))
    }
    const c = new THREE.CatmullRomCurve3(ctrl)
    return { curve: c, pts: c.getSpacedPoints(90) }
  }, [])
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 300, 0.0018, 4), [curve])
  return (
    <group>
      {/* bobine */}
      <mesh material={mat.wood('#b0824f')} position={[-0.18, 0.21, 0]} castShadow><cylinderGeometry args={[0.065, 0.065, 0.2, 24]} /></mesh>
      {[0.1, 0.32].map((y) => (
        <mesh key={y} material={mat.wood('#7a5230')} position={[-0.18, y, 0]} castShadow><cylinderGeometry args={[0.11, 0.11, 0.02, 28]} /></mesh>
      ))}
      <mesh geometry={tube} material={mat.metal('#c08a4a', 0.35)} />
      <Bulbs points={pts} color={color} size={0.006} intensity={3} />
      {/* poteau de suspension à droite */}
      <mesh material={mat.wood('#4a2e1a')} position={[0.33, 0.18, 0]} castShadow><cylinderGeometry args={[0.01, 0.012, 0.36, 8]} /></mesh>
      <mesh material={mat.wood('#4a2e1a')} position={[0.33, 0.005, 0]}><cylinderGeometry args={[0.05, 0.055, 0.015, 16]} /></mesh>
    </group>
  )
}

/** Rideau lumineux : tringle dorée et fils tombants d'ampoules en cascade. */
export function LightCurtain({ color = '#ffd9a0' }: { color?: string }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const strands = 14, per = 18
  const tmp = useMemo(() => new THREE.Object3D(), [])
  const c = useMemo(() => new THREE.Color(), [])
  const base = useMemo(() => new THREE.Color(color), [color])
  useFrame(({ clock }) => {
    const m = ref.current
    const t = clock.elapsedTime
    let k = 0
    for (let s = 0; s < strands; s++) {
      for (let i = 0; i < per; i++) {
        tmp.position.set(-0.45 + (s / (strands - 1)) * 0.9, 1.05 - i * 0.055 - (s % 2) * 0.02, Math.sin(s * 1.7) * 0.01)
        tmp.scale.setScalar(0.009)
        tmp.updateMatrix()
        m.setMatrixAt(k, tmp.matrix)
        // effet cascade : une vague lumineuse descend le long des fils
        const wave = Math.max(0, Math.sin(i * 0.5 - t * 3 + s * 0.4))
        m.setColorAt(k, c.copy(base).multiplyScalar(0.8 + wave * 2.6))
        k++
      }
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), [])
  const bulbGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])
  return (
    <group>
      <mesh material={mat.gold()} position={[0, 1.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.012, 0.012, 1.0, 10]} /></mesh>
      {Array.from({ length: strands }, (_, s) => (
        <mesh key={s} material={mat.std('#6b5a40', 0.5)} position={[-0.45 + (s / (strands - 1)) * 0.9, 1.08 - per * 0.0275, 0]}>
          <cylinderGeometry args={[0.0012, 0.0012, per * 0.055, 3]} />
        </mesh>
      ))}
      <instancedMesh ref={ref} args={[bulbGeo, material, strands * per]} frustumCulled={false} />
      {/* pieds du portant */}
      {[-0.5, 0.5].map((x) => (
        <group key={x}>
          <mesh material={mat.wood('#3b2416')} position={[x, 0.55, 0]} castShadow><boxGeometry args={[0.03, 1.1, 0.03]} /></mesh>
          <mesh material={mat.wood('#3b2416')} position={[x, 0.01, 0]}><boxGeometry args={[0.08, 0.02, 0.25]} /></mesh>
        </group>
      ))}
    </group>
  )
}

/** Étoile lumineuse en rotin tressé. */
export function RattanStar({ color = '#d8b27a' }: { color?: string }) {
  const tubes = useMemo(() => [0, 1, 2].map((i) => new THREE.TubeGeometry(starCurve(0.3 - i * 0.004, 0.14 + i * 0.006), 160, 0.009, 6, true)), [])
  const lights = useMemo(() => starCurve(0.26, 0.13).getSpacedPoints(40).slice(0, 40), [])
  return (
    <group position={[0, 0.36, 0]}>
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g} material={mat.std(color, 0.85)} position={[0, 0, (i - 1) * 0.014]} rotation={[0, 0, i * 0.01]} castShadow />
      ))}
      <Bulbs points={lights} color="#ffcf87" size={0.007} intensity={3} twinkle={0.4} />
      <mesh material={mat.basicGlow('#ffcf87', 0.12)} scale={0.3}><circleGeometry args={[1, 32]} /></mesh>
      <mesh material={mat.std('#3b2b1c', 0.6)} position={[0, 0.48, 0]}><cylinderGeometry args={[0.0015, 0.0015, 0.36, 4]} /></mesh>
    </group>
  )
}

/** Projecteur extérieur : boîtier, lentille et cône de lumière animé. */
export function Projector({ color = '#2b2b30' }: { color?: string }) {
  const cone = useRef<THREE.Mesh>(null!)
  const dots = useMemo(() => Array.from({ length: 26 }, (_, i) => new THREE.Vector3(Math.cos(i * 2.3) * (0.05 + (i % 6) * 0.03), 0.62 + Math.sin(i * 1.7) * 0.12, -0.02)), [])
  useFrame(({ clock }) => {
    const m = cone.current.material as THREE.MeshBasicMaterial
    m.opacity = 0.09 + Math.sin(clock.elapsedTime * 2) * 0.02
  })
  return (
    <group>
      <mesh material={mat.metal('#3a3a3f', 0.5)} position={[0, 0.06, 0]}><coneGeometry args={[0.012, 0.12, 6]} /></mesh>
      <group position={[0, 0.17, 0]} rotation={[-0.6, 0, 0]}>
        <mesh material={mat.std(color, 0.35, 0.6)} castShadow><cylinderGeometry args={[0.06, 0.07, 0.16, 24]} /></mesh>
        <mesh material={mat.glow('#e9f3ff', 2.2)} position={[0, 0.081, 0]}><cylinderGeometry args={[0.045, 0.045, 0.004, 24]} /></mesh>
        <mesh material={mat.metal('#5a5a60', 0.3)} position={[0, 0.082, 0]}><torusGeometry args={[0.05, 0.008, 8, 24]} /></mesh>
        <mesh ref={cone} position={[0, 0.33, 0]}>
          <coneGeometry args={[0.2, 0.5, 24, 1, true]} />
          <meshBasicMaterial color="#cfe4ff" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>
      {/* étoiles projetées sur un panneau */}
      <mesh material={mat.std('#20232b', 0.9)} position={[0, 0.62, -0.05]}><planeGeometry args={[0.5, 0.36]} /></mesh>
      <Bulbs points={dots} color="#eaf4ff" size={0.006} intensity={2.4} twinkle={1.4} />
    </group>
  )
}

/** Trois bougies en cire avec flammes LED vacillantes. */
export function LedCandles({ color = '#efe6d2' }: { color?: string }) {
  const wax = mat.std(color, 0.55)
  const specs: [number, number, number][] = [[-0.07, 0.1, 0.035], [0.0, 0.15, 0.04], [0.075, 0.125, 0.036]]
  return (
    <group>
      <mesh material={mat.wood('#3b2416')} position={[0, 0.01, 0]} receiveShadow castShadow><cylinderGeometry args={[0.15, 0.16, 0.02, 32]} /></mesh>
      {specs.map(([x, h, r], i) => (
        <group key={i} position={[x, 0.02, i === 1 ? -0.03 : 0.025]}>
          <mesh material={wax} position={[0, h / 2, 0]} castShadow><cylinderGeometry args={[r, r, h, 28]} /></mesh>
          {/* bord irrégulier de cire fondue */}
          <mesh material={wax} position={[0, h - 0.004, 0]}><torusGeometry args={[r * 0.92, 0.006, 6, 24]} /></mesh>
          <Flame position={[0, h - 0.008, 0]} scale={1} />
        </group>
      ))}
    </group>
  )
}

/** Renne lumineux d'extérieur : structure en fil avec LED intégrées. */
export function OutdoorDeer({ color = '#ffe0a8' }: { color?: string }) {
  const curves = useMemo(() => {
    const V = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z)
    const paths = [
      [V(-0.25, 0.48), V(-0.1, 0.52), V(0.1, 0.52), V(0.22, 0.5), V(0.24, 0.4), V(0.1, 0.36), V(-0.1, 0.36), V(-0.26, 0.4), V(-0.25, 0.48)], // corps
      [V(0.2, 0.5), V(0.26, 0.62), V(0.3, 0.72)], // cou
      [V(0.28, 0.74), V(0.36, 0.76), V(0.4, 0.72), V(0.33, 0.69), V(0.28, 0.74)], // tête
      [V(0.29, 0.76), V(0.26, 0.86), V(0.2, 0.92)], [V(0.27, 0.84), V(0.32, 0.9)], // bois
      [V(0.32, 0.76), V(0.36, 0.88), V(0.42, 0.93)], [V(0.36, 0.86), V(0.31, 0.92)],
      [V(0.18, 0.37, 0.04), V(0.2, 0.18, 0.04), V(0.2, 0.0, 0.04)], [V(0.12, 0.37, -0.04), V(0.13, 0.18, -0.04), V(0.12, 0.0, -0.04)], // pattes
      [V(-0.18, 0.37, 0.04), V(-0.2, 0.18, 0.04), V(-0.2, 0.0, 0.04)], [V(-0.12, 0.37, -0.04), V(-0.1, 0.18, -0.04), V(-0.1, 0.0, -0.04)],
      [V(-0.25, 0.47), V(-0.3, 0.52)], // queue
    ]
    return paths.map((p) => new THREE.CatmullRomCurve3(p))
  }, [])
  const tubes = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 40, 0.006, 5)), [curves])
  const pts = useMemo(() => curves.flatMap((c) => c.getSpacedPoints(Math.max(4, Math.round(c.getLength() * 60)))), [curves])
  return (
    <group scale={1.4} position={[-0.05, 0, 0]}>
      {tubes.map((g, i) => <mesh key={i} geometry={g} material={mat.std('#d8d2c4', 0.4, 0.6)} />)}
      <Bulbs points={pts} color={color} size={0.007} intensity={2.6} twinkle={0.3} />
    </group>
  )
}
