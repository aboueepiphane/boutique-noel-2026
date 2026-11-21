import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import type { Quality } from '../state/ui'
import { StoreScene } from './StoreScene'
import { player } from '../state/nav'

/** Canvas WebGL de la boutique, réglé selon la qualité choisie. */
export default function StoreCanvas({ quality, onProgress, onContextLost }: {
  quality: Quality
  onProgress: (done: number, total: number, stage: string) => void
  onContextLost: () => void
}) {
  const dpr: [number, number] = quality === 'haute' ? [1, 2] : quality === 'moyenne' ? [1, 1.5] : [0.75, 1]
  return (
    <Canvas
      shadows={quality !== 'basse'}
      dpr={dpr}
      camera={{ fov: player.fov, near: 0.05, far: 90, position: [player.x, 1.65, player.z] }}
      gl={{ antialias: quality === 'haute', powerPreference: 'high-performance', stencil: false }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onContextLost() })
      }}
      style={{ touchAction: 'none' }}
    >
      <AdaptiveDpr pixelated={false} />
      <StoreScene quality={quality} onProgress={onProgress} />
    </Canvas>
  )
}
