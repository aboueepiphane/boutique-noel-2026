import { Suspense, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'
import type { Product } from '../data/types'
import { PRODUCTS } from '../data/products'
import { ProductModel } from './models/ProductModel'
import { hasWebGL } from '../lib/webgl'

/** Cadre la caméra sur le modèle, quelle que soit sa taille. */
function useFit(group: React.RefObject<THREE.Group | null>, key: string, margin = 1.25) {
  const { camera } = useThree()
  const [fitted, setFitted] = useState<{ center: THREE.Vector3; radius: number } | null>(null)
  useLayoutEffect(() => {
    const g = group.current
    if (!g) return
    g.updateWorldMatrix(true, true)
    const box = new THREE.Box3().setFromObject(g)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const size = box.getSize(new THREE.Vector3())
    const cam = camera as THREE.PerspectiveCamera
    // Distance pour que la plus grande dimension visible tienne dans le champ, plus la demi-profondeur.
    const half = Math.max(size.y, Math.max(size.x, size.z) * 0.9) / 2
    const dist = (half * margin) / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) + Math.max(size.x, size.z) / 2
    const dir = new THREE.Vector3(0.35, 0.32, 1).normalize()
    cam.position.copy(sphere.center).addScaledVector(dir, dist)
    cam.near = dist / 50
    cam.far = dist * 10
    cam.lookAt(sphere.center)
    cam.updateProjectionMatrix()
    setFitted({ center: sphere.center.clone(), radius: sphere.radius })
  }, [key, camera, group, margin])
  return fitted
}

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 3]} intensity={2.2} color="#fff1dc" />
      <directionalLight position={[-3, 2, -2]} intensity={0.7} color="#ffd6a8" />
      <Environment resolution={128} frames={1}>
        <color attach="background" args={['#6b5440']} />
        <Lightformer intensity={2.2} position={[0, 4, 1]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} color="#fff3e0" />
        <Lightformer intensity={1.6} position={[0, 1, 5]} scale={[10, 4, 1]} color="#ffe9cc" />
        <Lightformer intensity={1.2} position={[-4, 1, 0]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} color="#ffd9a8" />
        <Lightformer intensity={1} position={[4, 1, -1]} rotation-y={-Math.PI / 2} scale={[4, 3, 1]} color="#e8c890" />
      </Environment>
    </>
  )
}

function ViewerContent({ product, color }: { product: Product; color: string }) {
  const group = useRef<THREE.Group>(null)
  const fit = useFit(group, product.id + color, 1.55)
  return (
    <>
      <StudioLights />
      <group ref={group}><ProductModel product={product} color={color} /></group>
      {fit && (
        <>
          <ContactShadows position={[0, 0.001, 0]} scale={fit.radius * 4} blur={2.4} opacity={0.45} far={fit.radius * 2} resolution={256} />
          <OrbitControls target={fit.center} enablePan={false} autoRotate={product.rotatable} autoRotateSpeed={1.2}
            minDistance={fit.radius * 1.2} maxDistance={fit.radius * 5} enableDamping dampingFactor={0.08} makeDefault />
        </>
      )}
    </>
  )
}

/** Visionneuse 3D de la fiche produit : faire glisser pour tourner, pincer/molette pour zoomer. */
export function ProductViewer({ product, color }: { product: Product; color: string }) {
  if (!hasWebGL()) return <ProductIllustration product={product} />
  return (
    <Canvas dpr={[1, 2]} camera={{ fov: 32 }} gl={{ antialias: true, alpha: true }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}>
      <Suspense fallback={null}><ViewerContent product={product} color={color} /></Suspense>
    </Canvas>
  )
}

// ───────────── Miniatures ─────────────

interface ThumbState { thumbs: Record<string, string>; set: (id: string, url: string) => void }
export const useThumbs = create<ThumbState>()((set) => ({
  thumbs: {},
  set: (id, url) => set((s) => ({ thumbs: { ...s.thumbs, [id]: url } })),
}))

function ThumbShot({ product, onDone }: { product: Product; onDone: () => void }) {
  const group = useRef<THREE.Group>(null)
  const fit = useFit(group, product.id, 1.12)
  const { gl, scene, camera } = useThree()
  const frames = useRef(0)
  useFrame(() => {
    if (!fit) return
    frames.current++
    if (frames.current === 3) {
      gl.render(scene, camera)
      useThumbs.getState().set(product.id, gl.domElement.toDataURL('image/webp', 0.86))
      onDone()
    }
  })
  return <group ref={group}><ProductModel product={product} /></group>
}

/**
 * Studio de photos : rend chaque produit une fois dans un canvas caché et garde l'image
 * pour les vignettes (accueil, rayons, inspiration). Se démonte une fois terminé.
 */
export function ThumbnailStudio() {
  const thumbs = useThumbs((s) => s.thumbs)
  const pending = PRODUCTS.filter((p) => !thumbs[p.id])
  if (!hasWebGL() || pending.length === 0) return null
  const product = pending[0]
  return (
    <div aria-hidden style={{ position: 'fixed', left: -10000, top: 0, width: 320, height: 320, pointerEvents: 'none' }}>
      <Canvas dpr={1} camera={{ fov: 30 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.setClearColor(0x000000, 0) }}>
        <StudioLights />
        <ThumbShot key={product.id} product={product} onDone={() => {}} />
      </Canvas>
    </div>
  )
}

/** Illustration de secours (sans WebGL) : silhouette dessinée par catégorie. */
export function ProductIllustration({ product }: { product: Product }) {
  const paths: Record<string, string> = {
    sapins: 'M50 8 L72 40 H62 L80 64 H66 L86 88 H14 L34 64 H20 L38 40 H28 Z M45 88 H55 V98 H45 Z',
    ornements: 'M50 18 a32 32 0 1 0 0.1 0 Z M44 10 H56 V18 H44 Z',
    lumieres: 'M10 30 Q50 60 90 30 M22 38 v10 M38 46 v10 M50 48 v10 M62 46 v10 M78 38 v10',
    village: 'M20 90 V50 L50 24 L80 50 V90 Z M42 90 V66 H58 V90',
    maison: 'M50 20 a30 30 0 1 0 0.1 0 Z M50 32 a18 18 0 1 0 0.1 0 Z',
  }
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={product.name}>
      <defs>
        <radialGradient id={`g-${product.id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff8ea" />
          <stop offset="100%" stopColor="#efe2c6" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#g-${product.id})`} />
      <path d={paths[product.aisle]} fill={product.color} stroke="#c9a45c" strokeWidth="2" strokeLinejoin="round" opacity="0.92" />
    </svg>
  )
}
