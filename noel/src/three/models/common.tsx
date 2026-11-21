import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mat } from './materials'

// Ampoules : icosaèdre (20 triangles) — suffisant pour un point lumineux, très léger.
const sphere = new THREE.IcosahedronGeometry(1, 1)
const sphereHi = new THREE.SphereGeometry(1, 18, 14)
const tmp = new THREE.Object3D()
const col = new THREE.Color()

/**
 * Ampoules instanciées (une seule draw call) avec scintillement.
 * La couleur est poussée au-delà de 1 pour déclencher le bloom.
 */
export function Bulbs({ points, color = '#ffcf87', size = 0.03, twinkle = 1, intensity = 2.4, palette }: {
  points: THREE.Vector3[]
  color?: string
  size?: number
  twinkle?: number
  intensity?: number
  palette?: string[]
}) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), [])
  const phases = useMemo(() => points.map((_, i) => Math.sin(i * 12.9898) * 43758.5453 % (Math.PI * 2)), [points])
  const bases = useMemo(() => points.map((_, i) => new THREE.Color(palette ? palette[i % palette.length] : color)), [points, color, palette])

  useLayoutEffect(() => {
    const m = ref.current
    points.forEach((p, i) => {
      tmp.position.copy(p)
      tmp.scale.setScalar(size)
      tmp.updateMatrix()
      m.setMatrixAt(i, tmp.matrix)
      m.setColorAt(i, col.copy(bases[i]).multiplyScalar(intensity))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [points, size, bases, intensity])

  useFrame(({ clock }) => {
    if (!twinkle) return
    const m = ref.current
    if (!m.instanceColor) return
    const t = clock.elapsedTime
    for (let i = 0; i < points.length; i++) {
      const k = 0.55 + 0.45 * Math.sin(t * (1.3 + (i % 5) * 0.35) * twinkle + phases[i])
      m.setColorAt(i, col.copy(bases[i]).multiplyScalar(intensity * (0.35 + k * 0.75)))
    }
    m.instanceColor.needsUpdate = true
  })

  return <instancedMesh ref={ref} args={[sphere, material, points.length]} frustumCulled={false} />
}

/** Boules colorées instanciées (décor du grand sapin, présentoirs). */
export function Baubles({ points, colors, size = 0.08 }: { points: THREE.Vector3[]; colors: string[]; size?: number | number[] }) {
  const groups = useMemo(() => {
    const m = new Map<string, { p: THREE.Vector3; s: number }[]>()
    points.forEach((p, i) => {
      const c = colors[i % colors.length]
      if (!m.has(c)) m.set(c, [])
      m.get(c)!.push({ p, s: Array.isArray(size) ? size[i % size.length] : size })
    })
    return [...m.entries()]
  }, [points, colors, size])
  return (
    <>
      {groups.map(([c, list]) => (
        <InstancedSpheres key={c} color={c} list={list} />
      ))}
    </>
  )
}

function InstancedSpheres({ color, list }: { color: string; list: { p: THREE.Vector3; s: number }[] }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    list.forEach(({ p, s }, i) => {
      tmp.position.copy(p)
      tmp.scale.setScalar(s)
      tmp.updateMatrix()
      ref.current.setMatrixAt(i, tmp.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [list])
  return <instancedMesh ref={ref} args={[sphereHi, mat.lacquer(color, 0.15, 0.55), list.length]} castShadow />
}

/** Boule de Noël détaillée : sphère vernie, calotte dorée et anneau. */
export function Ornament({ color, radius = 0.1, finish = 'lacquer', cap = 'gold' }: { color: string; radius?: number; finish?: 'lacquer' | 'matte' | 'glitter' | 'mirror'; cap?: 'gold' | 'silver' }) {
  const material =
    finish === 'matte' ? mat.std(color, 0.55, 0.1)
      : finish === 'mirror' ? mat.metal(color, 0.08)
        : finish === 'glitter' ? mat.std(color, 0.35, 0.8)
          : mat.lacquer(color)
  const capM = cap === 'gold' ? mat.gold() : mat.silver()
  return (
    <group>
      <mesh geometry={sphereHi} material={material} scale={radius} position={[0, radius, 0]} castShadow />
      <mesh material={capM} position={[0, radius * 2.02, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.2, radius * 0.24, radius * 0.22, 16]} />
      </mesh>
      <mesh material={capM} position={[0, radius * 2.2, 0]}>
        <torusGeometry args={[radius * 0.1, radius * 0.025, 6, 16]} />
      </mesh>
    </group>
  )
}

/** Petite flamme vacillante (bougies, lanternes). */
export function Flame({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const ref = useRef<THREE.Group>(null!)
  const seed = useMemo(() => Math.random() * 10, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed
    const f = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06
    ref.current.scale.set(scale, scale * f, scale)
    ref.current.rotation.z = Math.sin(t * 5) * 0.06
  })
  return (
    <group ref={ref} position={position} userData={{ noMerge: true }}>
      <mesh material={mat.glow('#ffb347', 3)} scale={[0.012, 0.03, 0.012]} position={[0, 0.02, 0]}>
        <sphereGeometry args={[1, 12, 10]} />
      </mesh>
      <mesh material={mat.basicGlow('#ff9a3c', 0.25)} scale={0.045} position={[0, 0.025, 0]}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
    </group>
  )
}

/** Nœud de ruban : deux boucles et deux pans. */
export function Bow({ color, size = 0.1 }: { color: string; size?: number }) {
  const m = mat.velvet(color)
  return (
    <group scale={size}>
      <mesh material={m} position={[-0.55, 0, 0]} rotation={[0, 0, 0.4]} scale={[1, 0.6, 0.35]}>
        <torusGeometry args={[0.5, 0.18, 10, 20]} />
      </mesh>
      <mesh material={m} position={[0.55, 0, 0]} rotation={[0, 0, -0.4]} scale={[1, 0.6, 0.35]}>
        <torusGeometry args={[0.5, 0.18, 10, 20]} />
      </mesh>
      <mesh material={m} scale={[0.28, 0.3, 0.22]}>
        <sphereGeometry args={[1, 14, 10]} />
      </mesh>
      <mesh material={m} position={[-0.3, -0.75, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.28, 1.2, 0.06]} />
      </mesh>
      <mesh material={m} position={[0.3, -0.75, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.28, 1.2, 0.06]} />
      </mesh>
    </group>
  )
}
