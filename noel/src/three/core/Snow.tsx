import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { glowTexture } from '../../lib/textures'
import { ROOM } from '../../data/aisles'

/** Flocons qui tombent doucement dans la boutique (densité adaptée à la qualité). */
export function Snow({ count = 1200, area = ROOM, top = ROOM.height - 0.5 }: { count?: number; area?: { minX: number; maxX: number; minZ: number; maxZ: number }; top?: number }) {
  const ref = useRef<THREE.Points>(null!)
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = area.minX + Math.random() * (area.maxX - area.minX)
      positions[i * 3 + 1] = Math.random() * top
      positions[i * 3 + 2] = area.minZ + Math.random() * (area.maxZ - area.minZ)
      speeds[i] = 0.18 + Math.random() * 0.3
    }
    return { positions, speeds }
  }, [count, area, top])
  useFrame(({ clock }, dt) => {
    const d = Math.min(dt, 0.05)
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const a = attr.array as Float32Array
    const t = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      a[i * 3 + 1] -= speeds[i] * d
      a[i * 3] += Math.sin(t * 0.6 + i) * 0.08 * d
      a[i * 3 + 2] += Math.cos(t * 0.5 + i * 1.3) * 0.06 * d
      if (a[i * 3 + 1] < 0) a[i * 3 + 1] = top
    }
    attr.needsUpdate = true
  })
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={glowTexture()} size={0.06} sizeAttenuation transparent opacity={0.85} depthWrite={false} color="#ffffff" toneMapped={false} fog={false} />
    </points>
  )
}
