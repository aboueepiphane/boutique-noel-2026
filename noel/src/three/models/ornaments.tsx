import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mat } from './materials'
import { Ornament, Bulbs } from './common'
import { starGeometry } from './geometry'
import { shade } from '../../lib/textures'

/** Coffret de boules : coussin de velours dans un écrin, trois finitions. */
export function BaubleSet({ color, accent = '#c9a45c' }: { color: string; accent?: string }) {
  return (
    <group>
      <mesh material={mat.wood('#3b2416')} position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.52, 0.06, 0.34]} />
      </mesh>
      <mesh material={mat.velvet('#f1e6cf')} position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[0.48, 0.03, 0.3]} />
      </mesh>
      <group position={[-0.15, 0.06, 0.02]}><Ornament color={color} radius={0.075} finish="lacquer" /></group>
      <group position={[0.0, 0.06, -0.04]}><Ornament color={shade(color, -0.12)} radius={0.085} finish="matte" /></group>
      <group position={[0.15, 0.06, 0.03]}><Ornament color={color} radius={0.07} finish="glitter" /></group>
      <mesh material={mat.std(accent, 0.4, 0.6)} position={[0, 0.075, 0.155]}>
        <boxGeometry args={[0.5, 0.025, 0.012]} />
      </mesh>
    </group>
  )
}

/** Boule en verre transparent garnie d'un brin de sapin et de paillettes. */
export function ClearBauble({ color = '#dfe9ee' }: { color?: string }) {
  const flecks = useMemo(
    () => Array.from({ length: 24 }, (_, i) => new THREE.Vector3(Math.cos(i * 2.4) * 0.07 * Math.sqrt((i % 7) / 7), 0.06 + (i % 5) * 0.022, Math.sin(i * 2.4) * 0.07 * Math.sqrt((i % 7) / 7))),
    [],
  )
  return (
    <group>
      <mesh material={mat.glass(color, 0.22)} position={[0, 0.12, 0]} castShadow>
        <sphereGeometry args={[0.12, 32, 24]} />
      </mesh>
      <mesh material={mat.glass('#ffffff', 0.12)} position={[0, 0.12, 0]} scale={0.98}>
        <sphereGeometry args={[0.12, 24, 16]} />
      </mesh>
      {/* brin de sapin à l'intérieur */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} material={mat.needles('#2d5a43')} position={[-0.03 + i * 0.015, 0.06 + i * 0.022, 0]} rotation={[0, 0, -0.9 + i * 0.1]} scale={[0.02, 0.05, 0.02]}>
          <coneGeometry args={[1, 1, 6]} />
        </mesh>
      ))}
      <mesh material={mat.lacquer('#9b1c23')} position={[0.04, 0.05, 0.02]}>
        <sphereGeometry args={[0.013, 10, 8]} />
      </mesh>
      <Bulbs points={flecks} color="#fff2c8" size={0.004} intensity={1.6} twinkle={0.6} />
      <mesh material={mat.silver()} position={[0, 0.245, 0]}>
        <cylinderGeometry args={[0.026, 0.03, 0.03, 18]} />
      </mesh>
      <mesh material={mat.silver()} position={[0, 0.27, 0]}>
        <torusGeometry args={[0.012, 0.003, 6, 14]} />
      </mesh>
    </group>
  )
}

const nameTextureCache = new Map<string, THREE.Texture>()
const nameTexture = (color: string) => {
  const hit = nameTextureCache.get(color)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 512
  const g = c.getContext('2d')!
  g.fillStyle = color
  g.fillRect(0, 0, 1024, 512)
  const light = new THREE.Color(color).getHSL({ h: 0, s: 0, l: 0 }).l > 0.7
  g.fillStyle = light ? '#a07c3a' : '#e7c97f'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = 'italic 600 120px "Cormorant Garamond", Georgia, serif'
  g.fillText('Léa', 256, 250)
  g.font = '600 34px "Inter", Arial, sans-serif'
  g.fillText('NOËL 2026', 256, 340)
  // fines étoiles
  for (let i = 0; i < 40; i++) {
    g.globalAlpha = 0.5
    g.fillRect(((i * 197) % 1024), 60 + ((i * 89) % 380), 3, 3)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  nameTextureCache.set(color, t)
  return t
}

/** Boule calligraphiée au prénom. */
export function CustomBauble({ color }: { color: string }) {
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({ map: nameTexture(color), roughness: 0.2, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06 }), [color])
  return (
    <group>
      <mesh material={material} position={[0, 0.14, 0]} rotation={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.14, 48, 32]} />
      </mesh>
      <mesh material={mat.gold()} position={[0, 0.29, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 0.035, 18]} />
      </mesh>
      <mesh material={mat.gold()} position={[0, 0.318, 0]}>
        <torusGeometry args={[0.014, 0.0035, 6, 16]} />
      </mesh>
      {/* support */}
      <mesh material={mat.wood('#3b2416')} position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.02, 24]} />
      </mesh>
    </group>
  )
}

/** Étoile de cime filigrane. */
export function TopperStar({ color }: { color: string }) {
  const metal = color === '#c7ccd3' ? mat.silver() : mat.gold()
  return (
    <group position={[0, 0.2, 0]}>
      <mesh geometry={starGeometry(0.08, 1, 0.42)} material={metal} scale={0.14} castShadow />
      <mesh geometry={starGeometry(0.04, 0.6, 0.27)} material={mat.glow('#ffe2a0', 0.8)} scale={0.14} position={[0, 0, 0.018]} />
      <mesh material={metal} position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
      </mesh>
      {/* ressort */}
      <mesh material={metal} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.02, 0.004, 6, 16]} />
      </mesh>
    </group>
  )
}

/** Flocon de cristal à six branches. */
export function Snowflake({ color = '#e8f1f6' }: { color?: string }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { ref.current.rotation.y += dt * 0.25 })
  const m = useMemo(() => new THREE.MeshPhysicalMaterial({ color, roughness: 0.05, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.9, emissive: new THREE.Color('#9fc7e6'), emissiveIntensity: 0.15 }), [color])
  return (
    <group position={[0, 0.2, 0]} ref={ref} userData={{ noMerge: true }}>
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
          <mesh material={m} position={[0, 0.075, 0]}><boxGeometry args={[0.014, 0.15, 0.01]} /></mesh>
          {[0.05, 0.09].map((y, k) => (
            <group key={k} position={[0, y, 0]}>
              <mesh material={m} position={[-0.018, 0.012, 0]} rotation={[0, 0, 0.9]}><boxGeometry args={[0.009, 0.045 - k * 0.012, 0.008]} /></mesh>
              <mesh material={m} position={[0.018, 0.012, 0]} rotation={[0, 0, -0.9]}><boxGeometry args={[0.009, 0.045 - k * 0.012, 0.008]} /></mesh>
            </group>
          ))}
          <mesh material={m} position={[0, 0.155, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.018, 0.018, 0.012]} /></mesh>
        </group>
      ))}
      <mesh material={m}><cylinderGeometry args={[0.025, 0.025, 0.012, 6]} /></mesh>
    </group>
  )
}

/** Cheval à bascule en bois peint (figurine suspendue). */
export function RockingHorse({ color = '#9b1c23', accent = '#c9a45c' }: { color?: string; accent?: string }) {
  const body = mat.lacquer(color, 0.35, 0.05)
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.6) * 0.12 })
  return (
    <group>
      <group ref={ref} position={[0, 0.04, 0]} userData={{ noMerge: true }}>
        {/* bascule */}
        <mesh material={mat.goldSoft()} position={[0, 0.16, 0.035]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.16, 0.008, 6, 30, Math.PI * 0.6]} />
        </mesh>
        <mesh material={mat.goldSoft()} position={[0, 0.16, -0.035]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.16, 0.008, 6, 30, Math.PI * 0.6]} />
        </mesh>
        <group position={[0, 0, 0]} rotation={[0, 0, -Math.PI * 0.2]}>
          <group position={[0, 0.16, 0]} rotation={[0, 0, Math.PI * 0.2]}>
            {/* corps */}
            <mesh material={body} position={[0, -0.03, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <capsuleGeometry args={[0.04, 0.1, 6, 12]} />
            </mesh>
            {[-0.05, 0.05].map((x) => [-0.025, 0.025].map((z) => (
              <mesh key={`${x}${z}`} material={body} position={[x, -0.08, z]} rotation={[0, 0, x > 0 ? -0.25 : 0.25]}>
                <cylinderGeometry args={[0.011, 0.009, 0.08, 8]} />
              </mesh>
            )))}
            {/* encolure et tête */}
            <mesh material={body} position={[0.09, 0.02, 0]} rotation={[0, 0, -0.7]}>
              <cylinderGeometry args={[0.022, 0.03, 0.08, 10]} />
            </mesh>
            <mesh material={body} position={[0.125, 0.05, 0]} rotation={[0, 0, -1.2]}>
              <capsuleGeometry args={[0.022, 0.04, 6, 10]} />
            </mesh>
            <mesh material={mat.std(accent, 0.5, 0.6)} position={[0.08, 0.05, 0]} rotation={[0, 0, -0.6]}>
              <boxGeometry args={[0.012, 0.07, 0.03]} />
            </mesh>
            {/* selle */}
            <mesh material={mat.std(accent, 0.4, 0.7)} position={[-0.01, 0.012, 0]}>
              <boxGeometry args={[0.05, 0.012, 0.085]} />
            </mesh>
            <mesh material={mat.std('#efe6d2', 0.8)} position={[-0.105, -0.01, 0]} rotation={[0, 0, 0.8]}>
              <coneGeometry args={[0.015, 0.06, 8]} />
            </mesh>
          </group>
        </group>
      </group>
      <mesh material={mat.goldSoft()} position={[0.13, 0.33, 0]}>
        <cylinderGeometry args={[0.0015, 0.0015, 0.14, 4]} />
      </mesh>
    </group>
  )
}

/** Guirlande de perles drapée sur un petit portant. */
export function BeadGarland({ color = '#c9a45c', accent = '#9b1c23' }: { color?: string; accent?: string }) {
  const beads = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const cols: string[] = []
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i <= 34; i++) {
        const t = i / 34
        const x = -0.3 + t * 0.6
        const sag = 0.08 + row * 0.07
        const y = 0.5 - row * 0.05 - sag * Math.sin(t * Math.PI)
        pts.push(new THREE.Vector3(x, y, row * 0.012 - 0.012))
        cols.push(i % 6 === 0 ? accent : color)
      }
    }
    return { pts, cols }
  }, [color, accent])
  return (
    <group>
      {[-0.32, 0.32].map((x) => (
        <group key={x}>
          <mesh material={mat.wood('#4a2e1a')} position={[x, 0.26, 0]} castShadow><cylinderGeometry args={[0.012, 0.014, 0.52, 10]} /></mesh>
          <mesh material={mat.gold()} position={[x, 0.53, 0]}><sphereGeometry args={[0.02, 12, 10]} /></mesh>
          <mesh material={mat.wood('#4a2e1a')} position={[x, 0.01, 0]}><cylinderGeometry args={[0.06, 0.07, 0.02, 16]} /></mesh>
        </group>
      ))}
      {beads.pts.map((p, i) => (
        <mesh key={i} position={p} material={beads.cols[i] === accent ? mat.lacquer(accent) : mat.lacquer(color, 0.2, 0.7)}>
          <sphereGeometry args={[0.011, 10, 8]} />
        </mesh>
      ))}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={x} geometry={starGeometry(0.2)} material={mat.gold()} position={[x, 0.42 - (i === 1 ? 0.02 : 0), 0.01]} scale={0.022} />
      ))}
    </group>
  )
}
