import { useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { Quality } from '../state/ui'
import { Room } from './store/Room'
import { EntranceArch, CentralTree, Signpost } from './store/Entrance'
import { AisleSigns } from './store/AisleSigns'
import { ProductSpot } from './store/ProductSpot'
import { SapinsAisle } from './aisles/Sapins'
import { OrnementsAisle } from './aisles/Ornements'
import { LumieresAisle } from './aisles/Lumieres'
import { VillageAisle } from './aisles/Village'
import { MaisonAisle } from './aisles/Maison'
import { Snow } from './core/Snow'
import { PlayerController } from './core/PlayerController'
import { StaticMerge } from './core/StaticMerge'
import { SLOTS } from '../data/layout'
import { PRODUCT_BY_ID } from '../data/products'
import type { AisleId } from '../data/types'

/** Ordre de chargement progressif : la structure d'abord, puis chaque allée. */
export const STAGES = ['Architecture', 'Grand sapin', 'Allée 01', 'Allée 02', 'Allée 03', 'Allée 04', 'Allée 05', 'Finitions'] as const
const AISLE_STAGE: Record<AisleId, number> = { sapins: 2, ornements: 3, lumieres: 4, village: 5, maison: 6 }

function Lighting({ quality }: { quality: Quality }) {
  const shadows = quality !== 'basse'
  return (
    <>
      <hemisphereLight args={['#ffe8c8', '#3a2414', 0.55]} />
      <ambientLight intensity={0.12} color="#ffd9b0" />
      <directionalLight
        position={[6, 14, 10]}
        intensity={1.1}
        color="#ffe6c4"
        castShadow={shadows}
        shadow-mapSize={quality === 'haute' ? [2048, 2048] : [1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={6}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={26}
        shadow-camera-bottom={-28}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
      {/* lumière chaude du grand sapin */}
      <pointLight position={[0, 3.2, 3.6]} color="#ffc887" intensity={38} distance={14} decay={1.6} />
      <pointLight position={[0, 6.5, 0]} color="#ffd9a0" intensity={30} distance={14} decay={1.5} />
      <pointLight position={[0, 5.5, 13]} color="#ffdcb0" intensity={14} distance={12} decay={1.6} />
    </>
  )
}

/** Compte les images rendues après chaque étape pour piloter l'écran de chargement. */
function StageClock({ stage, onStage }: { stage: number; onStage: (n: number) => void }) {
  const [frames, setFrames] = useState(0)
  useFrame(() => {
    if (stage < STAGES.length) setFrames((f) => f + 1)
  })
  useEffect(() => {
    if (stage < STAGES.length && frames >= 2) {
      setFrames(0)
      onStage(stage + 1)
    }
  }, [frames, stage, onStage])
  return null
}

/**
 * La scène est statique : une fois construite, on calcule les ombres une seule fois
 * au lieu de les recalculer à chaque image (divise presque par deux le coût de rendu).
 */
function ShadowFreeze({ stage }: { stage: number }) {
  const { gl } = useThree()
  useEffect(() => {
    const done = stage >= STAGES.length
    gl.shadowMap.autoUpdate = !done
    gl.shadowMap.needsUpdate = true
  }, [gl, stage])
  return null
}

function SceneSetup({ quality }: { quality: Quality }) {
  const { gl, scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.Fog('#1b120d', 26, 60)
    scene.background = new THREE.Color('#1b120d')
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 0.92
    gl.shadowMap.type = quality === 'haute' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap
  }, [gl, scene, quality])
  return null
}

export function StoreScene({ quality, onProgress }: { quality: Quality; onProgress: (done: number, total: number, stage: string) => void }) {
  const [stage, setStage] = useState(1)
  useEffect(() => { onProgress(stage, STAGES.length, STAGES[Math.min(stage, STAGES.length - 1)]) }, [stage, onProgress])

  const slotsReady = SLOTS.filter((s) => stage > AISLE_STAGE[PRODUCT_BY_ID[s.productId].aisle])
  return (
    <>
      <SceneSetup quality={quality} />
      <StageClock stage={stage} onStage={setStage} />
      <ShadowFreeze stage={stage} />
      <Lighting quality={quality} />
      <Environment resolution={128} frames={1} background={false}>
        <Lightformer intensity={1.6} color="#ffd9a8" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[20, 20, 1]} />
        <Lightformer intensity={0.8} color="#ffcf87" position={[-10, 3, 0]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer intensity={0.8} color="#ffe2c0" position={[10, 3, 0]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer intensity={0.5} color="#9b1c23" position={[0, 2, -10]} scale={[10, 3, 1]} />
      </Environment>
      <PlayerController />
      <StaticMerge><Room quality={quality} /></StaticMerge>
      {stage > 1 && <><StaticMerge><CentralTree quality={quality} /><EntranceArch quality={quality} /></StaticMerge><Signpost /><AisleSigns /></>}
      {stage > 2 && <StaticMerge><SapinsAisle quality={quality} /></StaticMerge>}
      {stage > 3 && <StaticMerge><OrnementsAisle quality={quality} /></StaticMerge>}
      {stage > 4 && <StaticMerge><LumieresAisle quality={quality} /></StaticMerge>}
      {stage > 5 && <StaticMerge><VillageAisle quality={quality} /></StaticMerge>}
      {stage > 6 && <StaticMerge><MaisonAisle quality={quality} /></StaticMerge>}
      {slotsReady.map((s) => <ProductSpot key={s.productId} slot={s} />)}
      {stage > 7 && <Snow count={quality === 'haute' ? 1400 : quality === 'moyenne' ? 800 : 350} />}
      {quality !== 'basse' && (
        <EffectComposer multisampling={quality === 'haute' ? 4 : 0}>
          <Bloom mipmapBlur intensity={quality === 'haute' ? 0.75 : 0.6} luminanceThreshold={1.05} luminanceSmoothing={0.15} radius={0.65} />
          <Vignette eskil={false} offset={0.25} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  )
}
