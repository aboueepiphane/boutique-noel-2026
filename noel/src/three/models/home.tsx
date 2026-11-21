import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mat } from './materials'
import { Bow, Flame, Bulbs, Ornament } from './common'
import { plateGeometry, bowlGeometry, stockingGeometry, starCurve } from './geometry'
import { Pinecone } from './trees'
import { rng, knitTexture } from '../../lib/textures'

const cone = new THREE.ConeGeometry(1, 1, 5)
const tmp = new THREE.Object3D()

/** Aiguilles de sapin instanciées le long d'une courbe ou d'un anneau. */
export function Greenery({ points, color = '#24533c', size = 0.05, seed = 1, spread = 0.03 }: { points: THREE.Vector3[]; color?: string; size?: number; seed?: number; spread?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const count = points.length * 6
  useLayoutEffect(() => {
    const r = rng(seed)
    let k = 0
    for (const p of points) {
      for (let j = 0; j < 6; j++) {
        tmp.position.set(p.x + (r() - 0.5) * spread, p.y + (r() - 0.5) * spread, p.z + (r() - 0.5) * spread)
        tmp.rotation.set(r() * Math.PI * 2, r() * Math.PI * 2, r() * Math.PI * 2)
        const s = size * (0.7 + r() * 0.6)
        tmp.scale.set(s * 0.22, s, s * 0.22)
        tmp.updateMatrix()
        ref.current.setMatrixAt(k++, tmp.matrix)
      }
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [points, size, seed, spread])
  return <instancedMesh ref={ref} args={[cone, mat.needles(color), count]} castShadow />
}

/** Couronne de porte : branches, baies, pommes de pin et nœud de velours. */
export function Wreath({ color = '#1f4d36', accent = '#9b1c23', radius = 0.22 }: { color?: string; accent?: string; radius?: number }) {
  const { ring, berries, cones } = useMemo(() => {
    const r = rng(21)
    const ring: THREE.Vector3[] = []
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2
      const rr = radius + (r() - 0.5) * radius * 0.35
      ring.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, (r() - 0.5) * 0.04))
    }
    const berries = Array.from({ length: 22 }, () => {
      const a = r() * Math.PI * 2
      const rr = radius * (0.85 + r() * 0.3)
      return new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, 0.035)
    })
    const cones = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.4
      return { p: new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0.04), rot: a }
    })
    return { ring, berries, cones }
  }, [radius])
  return (
    <group position={[0, radius + 0.1, 0]}>
      <mesh material={mat.std('#4a3a26', 1)}><torusGeometry args={[radius, radius * 0.12, 8, 40]} /></mesh>
      <Greenery points={ring} color={color} size={radius * 0.32} spread={radius * 0.2} />
      <Greenery points={ring.filter((_, i) => i % 3 === 0)} color="#5d7f6b" size={radius * 0.26} spread={radius * 0.25} seed={4} />
      {berries.map((p, i) => (
        <mesh key={i} position={p} material={mat.lacquer(accent, 0.2, 0.1)}><sphereGeometry args={[radius * 0.04, 10, 8]} /></mesh>
      ))}
      {cones.map(({ p, rot }, i) => (
        <group key={i} position={p} rotation={[Math.PI / 2, 0, rot]}><Pinecone scale={radius * 0.15} gold={i % 2 === 0} /></group>
      ))}
      <group position={[0, -radius * 1.02, 0.06]}><Bow color={accent} size={radius * 0.42} /></group>
    </group>
  )
}

/** Centre de table : plateau, branches, bougies et boules. */
export function Centerpiece({ color = '#9b1c23' }: { color?: string }) {
  const line = useMemo(() => Array.from({ length: 40 }, (_, i) => new THREE.Vector3(-0.28 + (i / 39) * 0.56, 0.06 + Math.sin(i) * 0.01, Math.sin(i * 1.7) * 0.05)), [])
  return (
    <group>
      <mesh material={mat.wood('#6a4428')} position={[0, 0.015, 0]} castShadow receiveShadow><boxGeometry args={[0.66, 0.03, 0.2]} /></mesh>
      <Greenery points={line} size={0.07} spread={0.06} />
      {[-0.17, 0, 0.17].map((x, i) => (
        <group key={x} position={[x, 0.03, 0]}>
          <mesh material={mat.std('#efe6d2', 0.55)} position={[0, 0.07 + i % 2 * 0.02, 0]} castShadow><cylinderGeometry args={[0.025, 0.025, 0.14 + (i % 2) * 0.04, 20]} /></mesh>
          <Flame position={[0, 0.14 + (i % 2) * 0.04, 0]} />
        </group>
      ))}
      {[-0.25, -0.08, 0.09, 0.24].map((x, i) => (
        <group key={x} position={[x, 0.04, i % 2 ? 0.06 : -0.06]}>
          <Ornament color={i % 2 ? color : '#c9a45c'} radius={0.03} />
        </group>
      ))}
      {[-0.12, 0.12].map((x) => <group key={x} position={[x, 0.04, 0.07]} rotation={[0, 0, Math.PI / 2]}><Pinecone scale={0.03} gold /></group>)}
    </group>
  )
}

/** Nappe en lin pliée, bordure brodée de houx. */
export function Tablecloth({ color = '#e9e1d0', accent = '#9b1c23' }: { color?: string; accent?: string }) {
  const linen = mat.std(color, 0.95)
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.02 + i * 0.04, 0]} rotation={[0, i * 0.05 - 0.05, 0]}>
          <mesh material={linen} castShadow receiveShadow><boxGeometry args={[0.42, 0.038, 0.3]} /></mesh>
          <mesh material={mat.std(accent, 0.8)} position={[0, 0, 0.151]}><boxGeometry args={[0.42, 0.012, 0.003]} /></mesh>
          <mesh material={mat.std('#2f5d46', 0.8)} position={[0, -0.01, 0.151]}><boxGeometry args={[0.42, 0.004, 0.003]} /></mesh>
        </group>
      ))}
      {/* brin de houx posé sur la pile */}
      <group position={[0.08, 0.145, 0.04]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} material={mat.lacquer('#1f4d36', 0.4)} rotation={[-Math.PI / 2, 0, i * 2.1]} position={[Math.cos(i * 2.1) * 0.03, 0, Math.sin(i * 2.1) * 0.03]} scale={[0.035, 0.016, 1]}>
            <circleGeometry args={[1, 7]} />
          </mesh>
        ))}
        {[0, 1, 2].map((i) => <mesh key={i} material={mat.lacquer(accent)} position={[Math.cos(i * 2) * 0.008, 0.008, Math.sin(i * 2) * 0.008]}><sphereGeometry args={[0.009, 10, 8]} /></mesh>)}
      </group>
      <mesh material={mat.gold()} position={[0, 0.1, 0]} rotation={[0, 0, 0]}><boxGeometry args={[0.012, 0.13, 0.302]} /></mesh>
    </group>
  )
}

/** Service de table : assiettes filetées d'or, bol, couverts. */
export function Dinnerware({ color = '#f6f2ea' }: { color?: string }) {
  const porcelain = mat.lacquer(color, 0.12, 0)
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, i * 0.018, 0]}>
          <mesh geometry={plateGeometry(0.15 - i * 0.025, 0.018)} material={porcelain} castShadow receiveShadow />
          <mesh material={mat.gold()} position={[0, 0.0185, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.15 - i * 0.025 - 0.003, 0.0018, 4, 48]} /></mesh>
        </group>
      ))}
      <mesh geometry={bowlGeometry(0.06)} material={porcelain} position={[0, 0.054, 0]} castShadow />
      <mesh material={mat.gold()} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.06, 0.0018, 4, 40]} /></mesh>
      {/* brin de houx peint */}
      <mesh material={mat.lacquer('#1f4d36', 0.4)} position={[0.07, 0.056, 0.03]} rotation={[-Math.PI / 2, 0, 0.6]} scale={[0.022, 0.01, 1]}><circleGeometry args={[1, 7]} /></mesh>
      <mesh material={mat.lacquer('#9b1c23')} position={[0.064, 0.058, 0.036]}><sphereGeometry args={[0.005, 8, 6]} /></mesh>
      {/* couverts */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat.gold()} position={[0.19 * s, 0.004, 0]}><boxGeometry args={[0.012, 0.004, 0.2]} /></mesh>
      ))}
    </group>
  )
}

/** Chaussette de Noël en tricot avec revers en fourrure. */
export function Stocking({ color = '#9b1c23', accent = '#f3efe6' }: { color?: string; accent?: string }) {
  const knit = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.95, bumpMap: knitTexture(), bumpScale: 1 }), [color])
  return (
    <group position={[0, 0.06, 0]}>
      {/* petit portant */}
      <mesh material={mat.wood('#3b2416')} position={[0, -0.05, 0]} castShadow><boxGeometry args={[0.26, 0.02, 0.14]} /></mesh>
      <mesh material={mat.wood('#3b2416')} position={[0, 0.2, -0.05]} castShadow><boxGeometry args={[0.02, 0.5, 0.02]} /></mesh>
      <mesh material={mat.gold()} position={[0.04, 0.44, -0.05]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.006, 0.006, 0.1, 8]} /></mesh>
      <group position={[0.03, 0.22, 0]} scale={0.2}>
        <mesh geometry={stockingGeometry()} material={knit} castShadow />
        <mesh material={accent === '#f3efe6' || color === '#f3efe6' ? mat.fur() : mat.std(accent, 0.9)} position={[0, 1.02, 0]}><boxGeometry args={[0.92, 0.38, 0.42]} /></mesh>
        <mesh material={mat.gold()} position={[0.35, 1.35, 0]}><torusGeometry args={[0.12, 0.02, 6, 16]} /></mesh>
        {/* initiale brodée : flocon doré */}
        {[0, 1, 2].map((i) => <mesh key={i} material={mat.gold()} position={[0, 0.55, 0.2]} rotation={[0, 0, (i * Math.PI) / 3]}><boxGeometry args={[0.03, 0.3, 0.02]} /></mesh>)}
      </group>
    </group>
  )
}

/** Trois paquets cadeaux enrubannés. */
export function GiftBoxes({ color = '#9b1c23', accent = '#c9a45c' }: { color?: string; accent?: string }) {
  const boxes: [number, number, number, number, number, string, string][] = [
    [-0.09, 0.08, 0.16, 0.16, 0.15, color, accent],
    [0.1, 0.06, 0.12, 0.12, 0.13, '#efe3c8', color],
    [0.0, 0.205, 0.1, 0.09, 0.1, '#2f5d46', accent],
  ]
  return (
    <group>
      {boxes.map(([x, y, w, h, d, c, rib], i) => (
        <group key={i} position={[x, y, i === 1 ? 0.03 : 0]} rotation={[0, i * 0.4, 0]}>
          <mesh material={mat.std(c, 0.5, 0.05)} castShadow receiveShadow><boxGeometry args={[w, h, d]} /></mesh>
          <mesh material={mat.std(c, 0.45, 0.05)} position={[0, h / 2 - 0.008, 0]}><boxGeometry args={[w + 0.006, 0.018, d + 0.006]} /></mesh>
          <mesh material={mat.velvet(rib)}><boxGeometry args={[w + 0.008, h + 0.002, 0.018]} /></mesh>
          <mesh material={mat.velvet(rib)}><boxGeometry args={[0.018, h + 0.004, d + 0.008]} /></mesh>
          <group position={[0, h / 2 + 0.02, 0]}><Bow color={rib} size={0.04} /></group>
        </group>
      ))}
      {/* étiquette kraft */}
      <mesh material={mat.std('#c8a57a', 0.9)} position={[-0.17, 0.05, 0.05]} rotation={[0, 0.5, 0.2]}><boxGeometry args={[0.04, 0.025, 0.002]} /></mesh>
    </group>
  )
}

/** Quatre rouleaux de ruban de velours. */
export function RibbonSpools({ color = '#9b1c23' }: { color?: string }) {
  const colors = [color, '#1f4d36', '#c9a45c', '#efe6d2']
  const tail = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.035, 0.05), new THREE.Vector3(0.05, 0.005, 0.1), new THREE.Vector3(0.12, 0.003, 0.08), new THREE.Vector3(0.18, 0.003, 0.13)])
    return new THREE.TubeGeometry(c, 30, 0.012, 2)
  }, [])
  return (
    <group>
      {colors.map((c, i) => (
        <group key={i} position={[-0.15 + i * 0.1, 0.05, 0]}>
          <mesh material={mat.velvet(c)} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.035, 28]} /></mesh>
          <mesh material={mat.std('#e6dcc6', 0.9)} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.016, 0.016, 0.037, 16]} /></mesh>
          {i === 0 && <mesh geometry={tail} material={mat.velvet(c)} scale={[1, 1, 1]} />}
        </group>
      ))}
    </group>
  )
}

/** Décoration murale : cadre étoilé en bois, verdure et micro-LED. */
export function WallStar({ color = '#8a5a33', accent = '#1f4d36' }: { color?: string; accent?: string }) {
  const curve = useMemo(() => starCurve(0.26, 0.12), [])
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.013, 6, true), [curve])
  const pts = useMemo(() => curve.getSpacedPoints(48), [curve])
  const lights = useMemo(() => curve.getSpacedPoints(20).map((p) => p.clone().add(new THREE.Vector3(0, 0, 0.02))), [curve])
  return (
    <group position={[0, 0.32, 0]}>
      <mesh material={mat.wood(color)} geometry={tube} castShadow />
      <Greenery points={pts.filter((_, i) => i % 2 === 0)} color={accent} size={0.045} spread={0.02} />
      <Bulbs points={lights} color="#ffd38a" size={0.006} intensity={2.6} twinkle={0.5} />
      {/* support chevalet */}
      <mesh material={mat.wood('#3b2416')} position={[0, -0.18, -0.05]} rotation={[-0.25, 0, 0]}><boxGeometry args={[0.02, 0.32, 0.02]} /></mesh>
      <mesh material={mat.wood('#3b2416')} position={[0, -0.31, 0]}><boxGeometry args={[0.22, 0.02, 0.1]} /></mesh>
    </group>
  )
}
