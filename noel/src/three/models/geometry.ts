import * as THREE from 'three'
import { rng } from '../../lib/textures'

const cache = new Map<string, THREE.BufferGeometry>()
const memo = <T extends THREE.BufferGeometry>(key: string, f: () => T): T => {
  let g = cache.get(key) as T | undefined
  if (!g) { g = f(); cache.set(key, g) }
  return g
}

/**
 * Étage de branches de sapin : un cône dont le bord est découpé en pointes irrégulières
 * et légèrement retombant, pour imiter des branches plutôt qu'un cône lisse.
 */
export const branchTier = (seed: number, segments = 28) =>
  memo(`tier-${seed}-${segments}`, () => {
    const r = rng(seed)
    const g = new THREE.ConeGeometry(1, 1, segments, 3, true)
    const pos = g.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const t = 0.5 - v.y // 0 en haut, 1 en bas
      const ang = Math.atan2(v.z, v.x)
      const spike = 0.5 + 0.5 * Math.sin(ang * (segments / 2)) // pointes alternées
      const jitter = (r() - 0.5) * 0.12
      const rad = 1 + (spike * 0.22 + jitter) * t
      v.x *= rad
      v.z *= rad
      v.y -= spike * 0.12 * t * t + r() * 0.05 * t
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    g.computeVertexNormals()
    return g
  })

/** Forme d'étoile à n branches pour ExtrudeGeometry. */
export const starShape = (outer = 1, inner = 0.45, n = 5) => {
  const s = new THREE.Shape()
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2
    const rr = i % 2 === 0 ? outer : inner
    const x = Math.cos(a) * rr
    const y = Math.sin(a) * rr
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  return s
}

export const starGeometry = (depth = 0.12, outer = 1, inner = 0.45) =>
  memo(`star-${depth}-${outer}-${inner}`, () => {
    const g = new THREE.ExtrudeGeometry(starShape(outer, inner), { depth, bevelEnabled: true, bevelThickness: depth * 0.6, bevelSize: outer * 0.06, bevelSegments: 3 })
    g.center()
    return g
  })

/** Contour d'étoile en courbe fermée (pour tubes : étoile en rotin, cadre mural). */
export const starCurve = (outer = 1, inner = 0.5, n = 5) => {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2
    const rr = i % 2 === 0 ? outer : inner
    pts.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, 0))
  }
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.02)
}

/** Assiette par révolution (profil tourné). */
export const plateGeometry = (radius = 1, depth = 0.12) =>
  memo(`plate-${radius}-${depth}`, () => {
    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(radius * 0.55, 0),
      new THREE.Vector2(radius * 0.62, depth * 0.35),
      new THREE.Vector2(radius * 0.95, depth),
      new THREE.Vector2(radius, depth * 1.05),
      new THREE.Vector2(radius * 0.97, depth * 1.2),
      new THREE.Vector2(radius * 0.6, depth * 0.55),
      new THREE.Vector2(0, depth * 0.45),
    ]
    return new THREE.LatheGeometry(pts, 48)
  })

export const bowlGeometry = (radius = 1) =>
  memo(`bowl-${radius}`, () => {
    const pts: THREE.Vector2[] = []
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 0.5
      pts.push(new THREE.Vector2(Math.sin(a) * radius, (1 - Math.cos(a)) * radius * 0.8))
    }
    for (let i = 12; i >= 0; i--) {
      const a = (i / 12) * Math.PI * 0.5
      pts.push(new THREE.Vector2(Math.sin(a) * radius * 0.92, (1 - Math.cos(a)) * radius * 0.8 + radius * 0.05))
    }
    return new THREE.LatheGeometry(pts, 40)
  })

/** Silhouette de chaussette de Noël. */
export const stockingGeometry = () =>
  memo('stocking', () => {
    const s = new THREE.Shape()
    s.moveTo(-0.35, 1)
    s.lineTo(0.35, 1)
    s.lineTo(0.35, 0.35)
    s.bezierCurveTo(0.35, 0.1, 0.55, 0.0, 0.75, -0.05)
    s.bezierCurveTo(0.98, -0.12, 0.98, -0.5, 0.7, -0.52)
    s.lineTo(0.0, -0.5)
    s.bezierCurveTo(-0.3, -0.5, -0.38, -0.25, -0.35, 0.05)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 4, curveSegments: 18 })
    g.translate(0, 0, -0.09)
    return g
  })

/** Pomme de pin : écailles en spirale (cône aplati par strates). */
export const pineconeGeometry = () =>
  memo('pinecone', () => {
    const pts: THREE.Vector2[] = []
    for (let i = 0; i <= 10; i++) {
      const t = i / 10
      const r = Math.sin(t * Math.PI) * 0.45 * (1 - t * 0.35) + (i % 2 ? 0.06 : 0)
      pts.push(new THREE.Vector2(r, t))
    }
    return new THREE.LatheGeometry(pts, 10)
  })
