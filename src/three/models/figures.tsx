import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mat } from './materials'
import { Flame, Bulbs } from './common'
import { starGeometry } from './geometry'
import { knitTexture } from '../../lib/textures'

const Eye = ({ p }: { p: [number, number, number] }) => (
  <mesh material={mat.dark()} position={p}><sphereGeometry args={[0.006, 8, 6]} /></mesh>
)

/** Père Noël : manteau de velours, fourrure, barbe, ceinture, hotte. */
export function Santa({ color = '#9b1c23' }: { color?: string }) {
  const coat = mat.velvet(color)
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { ref.current.rotation.z = Math.sin(clock.elapsedTime * 2.2) * 0.25 - 0.2 })
  return (
    <group>
      {/* bottes */}
      {[-0.045, 0.045].map((x) => (
        <mesh key={x} material={mat.lacquer('#141010', 0.3, 0.1)} position={[x, 0.03, 0.015]} scale={[1, 0.8, 1.4]} castShadow><sphereGeometry args={[0.04, 14, 10]} /></mesh>
      ))}
      {/* manteau */}
      <mesh material={coat} position={[0, 0.17, 0]} castShadow><cylinderGeometry args={[0.08, 0.13, 0.24, 28]} /></mesh>
      <mesh material={mat.fur()} position={[0, 0.055, 0]}><torusGeometry args={[0.128, 0.022, 10, 32]} /></mesh>
      <mesh material={mat.fur()} position={[0, 0.17, 0.105]} rotation={[0.18, 0, 0]}><boxGeometry args={[0.035, 0.23, 0.02]} /></mesh>
      {/* ventre */}
      <mesh material={coat} position={[0, 0.25, 0.02]} castShadow><sphereGeometry args={[0.105, 24, 18]} /></mesh>
      <mesh material={mat.dark()} position={[0, 0.22, 0]}><torusGeometry args={[0.1, 0.014, 8, 32]} /></mesh>
      <mesh material={mat.gold()} position={[0, 0.22, 0.106]}><boxGeometry args={[0.04, 0.032, 0.012]} /></mesh>
      {/* bras */}
      <group position={[-0.11, 0.3, 0]} rotation={[0, 0, 0.5]}>
        <mesh material={coat} position={[0, -0.06, 0]}><capsuleGeometry args={[0.028, 0.08, 6, 12]} /></mesh>
        <mesh material={mat.fur()} position={[0, -0.12, 0]}><torusGeometry args={[0.028, 0.01, 6, 16]} /></mesh>
        <mesh material={mat.std('#1a1512', 0.7)} position={[0, -0.14, 0]}><sphereGeometry args={[0.025, 10, 8]} /></mesh>
      </group>
      <group ref={ref} position={[0.11, 0.32, 0]} userData={{ noMerge: true }}>
        <mesh material={coat} position={[0, 0.06, 0]}><capsuleGeometry args={[0.028, 0.08, 6, 12]} /></mesh>
        <mesh material={mat.fur()} position={[0, 0.12, 0]}><torusGeometry args={[0.028, 0.01, 6, 16]} /></mesh>
        <mesh material={mat.std('#1a1512', 0.7)} position={[0, 0.145, 0]}><sphereGeometry args={[0.025, 10, 8]} /></mesh>
      </group>
      {/* tête */}
      <mesh material={mat.skin()} position={[0, 0.39, 0.01]} castShadow><sphereGeometry args={[0.06, 24, 18]} /></mesh>
      <mesh material={mat.std('#e6a58a', 0.6)} position={[0, 0.392, 0.07]}><sphereGeometry args={[0.012, 10, 8]} /></mesh>
      <Eye p={[-0.022, 0.405, 0.058]} /><Eye p={[0.022, 0.405, 0.058]} />
      {/* barbe et moustache */}
      <mesh material={mat.fur()} position={[0, 0.355, 0.035]} scale={[1, 1.25, 0.7]}><sphereGeometry args={[0.058, 18, 14]} /></mesh>
      <mesh material={mat.fur()} position={[-0.018, 0.382, 0.066]} rotation={[0, 0, 0.5]} scale={[1.6, 0.6, 0.6]}><sphereGeometry args={[0.013, 10, 8]} /></mesh>
      <mesh material={mat.fur()} position={[0.018, 0.382, 0.066]} rotation={[0, 0, -0.5]} scale={[1.6, 0.6, 0.6]}><sphereGeometry args={[0.013, 10, 8]} /></mesh>
      {/* bonnet */}
      <mesh material={mat.fur()} position={[0, 0.43, 0.005]}><torusGeometry args={[0.055, 0.016, 10, 28]} /></mesh>
      <mesh material={coat} position={[0.01, 0.49, -0.005]} rotation={[0, 0, -0.35]} castShadow><coneGeometry args={[0.055, 0.13, 24]} /></mesh>
      <mesh material={mat.fur()} position={[0.045, 0.54, -0.005]}><sphereGeometry args={[0.02, 12, 10]} /></mesh>
      {/* hotte */}
      <mesh material={mat.std('#9c7448', 0.9)} position={[0, 0.27, -0.12]} rotation={[0.2, 0, 0]} castShadow><cylinderGeometry args={[0.075, 0.06, 0.16, 16, 1, true]} /></mesh>
      {[['#2f5d46', -0.03], ['#c9a45c', 0.03], ['#f3efe6', 0]].map(([c, x], i) => (
        <mesh key={i} material={mat.std(c as string, 0.5)} position={[x as number, 0.36 + i * 0.01, -0.13 - i * 0.01]} rotation={[0.3, i, 0]}><boxGeometry args={[0.05, 0.05, 0.05]} /></mesh>
      ))}
    </group>
  )
}

/** Renne en bois patiné avec écharpe tricotée. */
export function Reindeer({ color = '#9b1c23' }: { color?: string }) {
  const body = mat.std('#8c6a4a', 0.75)
  const antlers = useMemo(() => {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
    const make = (s: number) => [
      new THREE.CatmullRomCurve3([V(0, 0, 0), V(0.02 * s, 0.05, -0.01), V(0.05 * s, 0.1, -0.03), V(0.06 * s, 0.15, -0.02)]),
      new THREE.CatmullRomCurve3([V(0.02 * s, 0.05, -0.01), V(0.05 * s, 0.07, 0.02)]),
      new THREE.CatmullRomCurve3([V(0.045 * s, 0.1, -0.025), V(0.085 * s, 0.12, -0.02)]),
    ]
    return [...make(1), ...make(-1)].map((c, i) => ({ g: new THREE.TubeGeometry(c, 12, 0.006, 6), s: i < 3 ? 1 : -1 }))
  }, [])
  return (
    <group>
      <mesh material={body} position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><capsuleGeometry args={[0.065, 0.16, 8, 16]} /></mesh>
      {[-0.08, 0.08].map((x) => [-0.035, 0.035].map((z) => (
        <group key={`${x}${z}`} position={[x, 0.1, z]}>
          <mesh material={body} castShadow><cylinderGeometry args={[0.016, 0.012, 0.2, 10]} /></mesh>
          <mesh material={mat.dark()} position={[0, -0.1, 0]}><cylinderGeometry args={[0.014, 0.016, 0.02, 10]} /></mesh>
        </group>
      )))}
      <mesh material={body} position={[0.13, 0.34, 0]} rotation={[0, 0, -0.55]} castShadow><cylinderGeometry args={[0.03, 0.045, 0.14, 14]} /></mesh>
      <group position={[0.17, 0.42, 0]}>
        <mesh material={body} castShadow><sphereGeometry args={[0.045, 18, 14]} /></mesh>
        <mesh material={body} position={[0.045, -0.01, 0]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.025, 0.04, 6, 10]} /></mesh>
        <mesh material={mat.dark()} position={[0.085, -0.008, 0]}><sphereGeometry args={[0.013, 10, 8]} /></mesh>
        <Eye p={[0.03, 0.015, 0.035]} /><Eye p={[0.03, 0.015, -0.035]} />
        {[-1, 1].map((s) => (
          <mesh key={s} material={body} position={[-0.01, 0.03, 0.04 * s]} rotation={[0.9 * s, 0, 0]} scale={[0.6, 1, 0.3]}><sphereGeometry args={[0.025, 10, 8]} /></mesh>
        ))}
        <group position={[-0.01, 0.035, 0]} rotation={[0, Math.PI / 2, 0]}>
          {antlers.map((a, i) => <mesh key={i} geometry={a.g} material={mat.std('#d9c6a3', 0.7)} position={[0, 0, 0]} />)}
        </group>
      </group>
      {/* écharpe */}
      <mesh material={mat.std(color, 0.95)} position={[0.12, 0.36, 0]} rotation={[0, 0, -0.55]}><torusGeometry args={[0.042, 0.016, 8, 20]} /></mesh>
      <mesh material={mat.std(color, 0.95)} position={[0.12, 0.3, 0.045]} rotation={[0.2, 0, 0.2]}><boxGeometry args={[0.028, 0.09, 0.012]} /></mesh>
      <mesh material={mat.fur()} position={[-0.115, 0.29, 0]}><sphereGeometry args={[0.02, 10, 8]} /></mesh>
    </group>
  )
}

/** Bonhomme de neige en maille épaisse. */
export function Snowman({ color = '#9b1c23' }: { color?: string }) {
  const knit = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f6f3ec', roughness: 0.95, bumpMap: knitTexture(), bumpScale: 1.2 }), [])
  return (
    <group>
      <mesh material={knit} position={[0, 0.1, 0]} castShadow><sphereGeometry args={[0.11, 28, 22]} /></mesh>
      <mesh material={knit} position={[0, 0.25, 0]} castShadow><sphereGeometry args={[0.08, 28, 22]} /></mesh>
      <mesh material={knit} position={[0, 0.36, 0]} castShadow><sphereGeometry args={[0.06, 28, 22]} /></mesh>
      <Eye p={[-0.02, 0.375, 0.055]} /><Eye p={[0.02, 0.375, 0.055]} />
      <mesh material={mat.std('#e2741f', 0.6)} position={[0, 0.36, 0.075]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.011, 0.05, 10]} /></mesh>
      {[0.28, 0.24, 0.2, 0.14].map((y, i) => (
        <mesh key={i} material={mat.dark()} position={[0, y, (i < 3 ? 0.078 : 0.105) - (i === 3 ? 0 : 0)]}><sphereGeometry args={[0.009, 8, 6]} /></mesh>
      ))}
      <mesh material={mat.std(color, 0.95)} position={[0, 0.315, 0]}><torusGeometry args={[0.055, 0.017, 8, 24]} /></mesh>
      <mesh material={mat.std(color, 0.95)} position={[0.04, 0.27, 0.05]} rotation={[0.3, 0, 0.3]}><boxGeometry args={[0.03, 0.09, 0.012]} /></mesh>
      <mesh material={mat.std(color, 0.95)} position={[0, 0.405, 0]}><sphereGeometry args={[0.055, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      <mesh material={mat.std('#f3efe6', 0.95)} position={[0, 0.405, 0]}><torusGeometry args={[0.054, 0.012, 8, 24]} /></mesh>
      <mesh material={mat.std('#f3efe6', 1)} position={[0, 0.47, 0]}><sphereGeometry args={[0.02, 12, 10]} /></mesh>
      {/* bras en bois */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat.wood('#4a2e1a')} position={[0.1 * s, 0.27, 0]} rotation={[0, 0, -0.9 * s]}><cylinderGeometry args={[0.004, 0.005, 0.1, 5]} /></mesh>
      ))}
    </group>
  )
}

/** Lutin assis, jambes rayées pendantes. */
export function Elf({ color = '#1f4d36' }: { color?: string }) {
  const coat = mat.velvet(color)
  const alt = color === '#9b1c23' ? '#f3efe6' : '#9b1c23'
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { ref.current.rotation.x = Math.sin(clock.elapsedTime * 3) * 0.25 })
  return (
    <group>
      {/* petite caisse sur laquelle il est assis */}
      <mesh material={mat.wood('#7a5230')} position={[0, 0.07, 0]} castShadow><boxGeometry args={[0.18, 0.14, 0.14]} /></mesh>
      <mesh material={coat} position={[0, 0.2, 0]} castShadow><cylinderGeometry args={[0.04, 0.065, 0.13, 20]} /></mesh>
      {/* col à pointes */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} material={mat.std(alt, 0.8)} position={[Math.cos((i / 8) * Math.PI * 2) * 0.05, 0.255, Math.sin((i / 8) * Math.PI * 2) * 0.05]} rotation={[Math.sin((i / 8) * Math.PI * 2) * 1.2, 0, -Math.cos((i / 8) * Math.PI * 2) * 1.2]}>
          <coneGeometry args={[0.016, 0.04, 6]} />
        </mesh>
      ))}
      <mesh material={mat.skin()} position={[0, 0.3, 0]} castShadow><sphereGeometry args={[0.05, 22, 16]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} material={mat.skin()} position={[0.05 * s, 0.31, 0]} rotation={[0, 0, -0.7 * s]} scale={[0.6, 1.4, 0.4]}><coneGeometry args={[0.015, 0.04, 8]} /></mesh>)}
      <Eye p={[-0.017, 0.31, 0.046]} /><Eye p={[0.017, 0.31, 0.046]} />
      <mesh material={mat.std('#d98c7a', 0.6)} position={[0, 0.295, 0.05]}><sphereGeometry args={[0.008, 8, 6]} /></mesh>
      <mesh material={coat} position={[0.02, 0.4, -0.01]} rotation={[0, 0, -0.5]} castShadow><coneGeometry args={[0.045, 0.16, 20]} /></mesh>
      <mesh material={mat.std(alt, 0.8)} position={[0, 0.34, 0]}><torusGeometry args={[0.044, 0.01, 8, 22]} /></mesh>
      <mesh material={mat.gold()} position={[0.085, 0.45, -0.01]}><sphereGeometry args={[0.014, 12, 10]} /></mesh>
      {/* jambes rayées */}
      <group ref={ref} position={[0, 0.15, 0.06]} userData={{ noMerge: true }}>
        {[-0.025, 0.025].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {Array.from({ length: 6 }, (_, k) => (
              <mesh key={k} material={mat.std(k % 2 ? alt : color, 0.9)} position={[0, -0.012 - k * 0.022, 0.0]}><cylinderGeometry args={[0.012, 0.012, 0.022, 10]} /></mesh>
            ))}
            <mesh material={coat} position={[0, -0.145, 0.015]} rotation={[0.4, 0, 0]} scale={[1, 0.7, 1.8]}><sphereGeometry args={[0.018, 10, 8]} /></mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/** Crèche : étable en bois au toit de chaume, santons et lanterne. */
export function Nativity({ color = '#8a5a33' }: { color?: string }) {
  const wood = mat.wood(color)
  const santon = (c: string, x: number, z: number, h = 0.1, kneel = false) => (
    <group position={[x, 0.03, z]}>
      <mesh material={mat.std(c, 0.8)} position={[0, (kneel ? h * 0.7 : h) / 2, 0]} castShadow><coneGeometry args={[0.025, kneel ? h * 0.7 : h, 12]} /></mesh>
      <mesh material={mat.skin()} position={[0, (kneel ? h * 0.7 : h) + 0.012, 0]}><sphereGeometry args={[0.014, 12, 10]} /></mesh>
      <mesh material={mat.std(c, 0.9)} position={[0, (kneel ? h * 0.7 : h) + 0.02, -0.003]} scale={[1.1, 0.7, 1.1]}><sphereGeometry args={[0.015, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
    </group>
  )
  return (
    <group>
      <mesh material={mat.std('#6b5536', 1)} position={[0, 0.015, 0]} receiveShadow castShadow><boxGeometry args={[0.46, 0.03, 0.3]} /></mesh>
      <mesh material={mat.std('#c9b27a', 1)} position={[0, 0.032, 0.02]}><boxGeometry args={[0.38, 0.006, 0.22]} /></mesh>
      {/* poteaux */}
      {[[-0.19, 0.12], [0.19, 0.12], [-0.19, -0.12], [0.19, -0.12]].map(([x, z], i) => (
        <mesh key={i} material={wood} position={[x, 0.15, z]} castShadow><boxGeometry args={[0.02, 0.27, 0.02]} /></mesh>
      ))}
      <mesh material={wood} position={[0, 0.16, -0.13]} receiveShadow><boxGeometry args={[0.38, 0.26, 0.01]} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat.std('#b99a5b', 1)} position={[0.11 * s, 0.33, 0]} rotation={[0, 0, -0.55 * s]} castShadow><boxGeometry args={[0.26, 0.018, 0.34]} /></mesh>
      ))}
      <mesh geometry={starGeometry(0.2)} material={mat.glow('#ffd88a', 1.8)} position={[0, 0.45, 0.03]} scale={0.035} />
      {/* mangeoire */}
      <mesh material={wood} position={[0, 0.05, 0.02]}><boxGeometry args={[0.07, 0.035, 0.045]} /></mesh>
      <mesh material={mat.std('#e8dfcc', 0.9)} position={[0, 0.072, 0.02]} scale={[1.6, 0.6, 1]}><sphereGeometry args={[0.016, 12, 8]} /></mesh>
      {santon('#2d4f8c', -0.07, 0.03, 0.1, true)}
      {santon('#7a4b2a', 0.08, 0.0, 0.12)}
      {santon('#8e1b26', -0.15, 0.1, 0.11)}
      {santon('#b08a3e', 0.16, 0.09, 0.11)}
      {santon('#4c6b3c', -0.17, -0.02, 0.1)}
      {/* âne et bœuf stylisés */}
      <mesh material={mat.std('#7a7a78', 0.8)} position={[0.12, 0.06, -0.07]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.022, 0.05, 6, 10]} /></mesh>
      <mesh material={mat.std('#6b4a30', 0.8)} position={[-0.1, 0.06, -0.08]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.026, 0.06, 6, 10]} /></mesh>
      {/* lanterne */}
      <group position={[0.15, 0.2, 0.12]}>
        <mesh material={mat.metal('#2b2b30', 0.5)}><boxGeometry args={[0.03, 0.004, 0.03]} /></mesh>
        <mesh material={mat.glass('#fff2d0', 0.2)} position={[0, -0.022, 0]}><boxGeometry args={[0.026, 0.04, 0.026]} /></mesh>
        <Flame position={[0, -0.04, 0]} scale={0.6} />
      </group>
    </group>
  )
}

/** Casse-noisette soldat en bois tourné. */
export function Nutcracker({ color = '#9b1c23' }: { color?: string }) {
  const coat = mat.lacquer(color, 0.3, 0.1)
  const black = mat.lacquer('#121212', 0.25, 0.1)
  const jaw = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => { jaw.current.position.y = 0.36 + Math.max(0, Math.sin(clock.elapsedTime * 2)) * -0.008 })
  return (
    <group>
      <mesh material={mat.lacquer('#1f4d36', 0.35)} position={[0, 0.02, 0]} castShadow><cylinderGeometry args={[0.09, 0.1, 0.04, 28]} /></mesh>
      <mesh material={mat.gold()} position={[0, 0.042, 0]}><torusGeometry args={[0.09, 0.005, 6, 32]} /></mesh>
      {[-0.03, 0.03].map((x) => (
        <group key={x}>
          <mesh material={black} position={[x, 0.07, 0.005]}><boxGeometry args={[0.04, 0.03, 0.06]} /></mesh>
          <mesh material={mat.lacquer('#f3efe6', 0.4)} position={[x, 0.14, 0]}><cylinderGeometry args={[0.022, 0.02, 0.11, 14]} /></mesh>
        </group>
      ))}
      <mesh material={coat} position={[0, 0.27, 0]} castShadow><cylinderGeometry args={[0.055, 0.06, 0.16, 24]} /></mesh>
      <mesh material={mat.lacquer('#f3efe6', 0.4)} position={[0, 0.205, 0]}><cylinderGeometry args={[0.062, 0.062, 0.022, 24]} /></mesh>
      <mesh material={mat.gold()} position={[0, 0.205, 0.062]}><boxGeometry args={[0.025, 0.02, 0.006]} /></mesh>
      {[0.24, 0.27, 0.3, 0.33].map((y) => <mesh key={y} material={mat.gold()} position={[0, y, 0.056]}><sphereGeometry args={[0.006, 8, 6]} /></mesh>)}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.07 * s, 0.3, 0]} rotation={[0, 0, 0.12 * s]}>
          <mesh material={coat} position={[0, -0.04, 0]}><cylinderGeometry args={[0.018, 0.016, 0.1, 12]} /></mesh>
          <mesh material={mat.gold()} position={[0, 0.015, 0]} scale={[1.3, 0.5, 1.3]}><sphereGeometry args={[0.02, 12, 8]} /></mesh>
          <mesh material={mat.lacquer('#f3efe6', 0.4)} position={[0, -0.1, 0]}><sphereGeometry args={[0.016, 10, 8]} /></mesh>
        </group>
      ))}
      {/* tête */}
      <mesh material={mat.lacquer('#f0c9a8', 0.4)} position={[0, 0.4, 0]}><cylinderGeometry args={[0.042, 0.045, 0.07, 22]} /></mesh>
      <mesh ref={jaw} userData={{ noMerge: true }} material={mat.lacquer('#f3efe6', 0.6)} position={[0, 0.36, 0.022]}><boxGeometry args={[0.06, 0.03, 0.04]} /></mesh>
      <mesh material={mat.fur()} position={[0, 0.375, 0.04]} scale={[1.4, 0.5, 0.6]}><sphereGeometry args={[0.02, 10, 8]} /></mesh>
      <Eye p={[-0.016, 0.415, 0.042]} /><Eye p={[0.016, 0.415, 0.042]} />
      <mesh material={mat.lacquer('#e09a85', 0.4)} position={[0, 0.4, 0.046]}><sphereGeometry args={[0.009, 8, 6]} /></mesh>
      {/* shako */}
      <mesh material={black} position={[0, 0.485, 0]} castShadow><cylinderGeometry args={[0.05, 0.045, 0.1, 24]} /></mesh>
      <mesh material={mat.gold()} position={[0, 0.44, 0]}><torusGeometry args={[0.046, 0.006, 6, 28]} /></mesh>
      <mesh geometry={starGeometry(0.3)} material={mat.gold()} position={[0, 0.49, 0.048]} scale={0.016} />
      <mesh material={mat.lacquer(color, 0.3)} position={[0, 0.555, 0]}><sphereGeometry args={[0.014, 10, 8]} /></mesh>
    </group>
  )
}

/** Carrousel musical : rotation lente, chevaux qui montent et descendent. */
export function Carousel({ color = '#9b1c23', accent = '#c9a45c' }: { color?: string; accent?: string }) {
  const spin = useRef<THREE.Group>(null!)
  const horses = useRef<THREE.Group[]>([])
  const bulbs = useMemo(() => Array.from({ length: 16 }, (_, i) => new THREE.Vector3(Math.cos((i / 16) * Math.PI * 2) * 0.155, 0.3, Math.sin((i / 16) * Math.PI * 2) * 0.155)), [])
  useFrame(({ clock }, dt) => {
    spin.current.rotation.y += dt * 0.5
    horses.current.forEach((h, i) => { if (h) h.position.y = 0.13 + Math.sin(clock.elapsedTime * 2 + i * 1.6) * 0.025 })
  })
  return (
    <group>
      <mesh material={mat.lacquer(color, 0.3)} position={[0, 0.02, 0]} castShadow><cylinderGeometry args={[0.17, 0.18, 0.04, 40]} /></mesh>
      <mesh material={mat.gold()} position={[0, 0.042, 0]}><torusGeometry args={[0.17, 0.006, 8, 40]} /></mesh>
      <group ref={spin} userData={{ noMerge: true }}>
        <mesh material={mat.gold()} position={[0, 0.17, 0]}><cylinderGeometry args={[0.018, 0.018, 0.26, 14]} /></mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2
          return (
            <group key={i} position={[Math.cos(a) * 0.11, 0, Math.sin(a) * 0.11]} rotation={[0, -a, 0]}>
              <mesh material={mat.gold()} position={[0, 0.17, 0]}><cylinderGeometry args={[0.003, 0.003, 0.26, 6]} /></mesh>
              <group ref={(el) => { if (el) horses.current[i] = el }}>
                <mesh material={mat.lacquer(i % 2 ? '#f3efe6' : '#2b2420', 0.3)} rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.018, 0.04, 6, 10]} /></mesh>
                <mesh material={mat.lacquer(i % 2 ? '#f3efe6' : '#2b2420', 0.3)} position={[0, 0.025, 0.035]} rotation={[0.6, 0, 0]}><capsuleGeometry args={[0.011, 0.03, 6, 8]} /></mesh>
                <mesh material={mat.lacquer(accent, 0.3, 0.6)} position={[0, 0.019, 0]}><boxGeometry args={[0.03, 0.006, 0.025]} /></mesh>
                {[-1, 1].map((s) => <mesh key={s} material={mat.lacquer(i % 2 ? '#f3efe6' : '#2b2420', 0.3)} position={[0, -0.025, 0.02 * s]} rotation={[0.5 * s, 0, 0]}><cylinderGeometry args={[0.004, 0.004, 0.035, 6]} /></mesh>)}
              </group>
            </group>
          )
        })}
        {/* toit festonné */}
        <mesh material={mat.lacquer(color, 0.3)} position={[0, 0.34, 0]} castShadow><coneGeometry args={[0.19, 0.1, 40]} /></mesh>
        {Array.from({ length: 16 }, (_, i) => (
          <mesh key={i} material={i % 2 ? mat.lacquer('#f3efe6', 0.4) : mat.lacquer(color, 0.3)} position={[Math.cos((i / 16) * Math.PI * 2) * 0.18, 0.285, Math.sin((i / 16) * Math.PI * 2) * 0.18]} rotation={[Math.PI / 2, 0, (i / 16) * Math.PI * 2 + Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.004, 12, 1, false, 0, Math.PI]} />
          </mesh>
        ))}
        <Bulbs points={bulbs} color="#ffd38a" size={0.006} intensity={2.6} />
        <mesh material={mat.gold()} position={[0, 0.4, 0]}><sphereGeometry args={[0.014, 12, 10]} /></mesh>
      </group>
    </group>
  )
}
