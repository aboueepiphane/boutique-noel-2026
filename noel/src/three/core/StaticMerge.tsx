import { useLayoutEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Fusionne les maillages statiques d'un sous-arbre par matériau.
 *
 * Le décor procédural compte des milliers de petites pièces (nœuds, chaises, maisons…).
 * Une fois montées, on les regroupe en quelques gros maillages : le nombre d'appels de dessin
 * chute fortement, ce qui rend la visite fluide sur les appareils modestes.
 * Les pièces animées portent `userData.noMerge` et restent intactes, de même que les
 * maillages instanciés (ampoules, aiguilles) qui sont déjà optimisés.
 */
export function StaticMerge({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const root = useRef<THREE.Group>(null!)
  useLayoutEffect(() => {
    if (!enabled) return
    const g = root.current
    g.updateWorldMatrix(true, true)
    const inv = new THREE.Matrix4().copy(g.matrixWorld).invert()
    const buckets = new Map<THREE.Material, { geos: THREE.BufferGeometry[]; cast: boolean; receive: boolean }>()

    const visit = (o: THREE.Object3D) => {
      if (o.userData.noMerge || !o.visible) return
      const m = o as THREE.Mesh
      if (m.isMesh && !(m as THREE.InstancedMesh).isInstancedMesh && !Array.isArray(m.material) && m.geometry?.attributes.position) {
        const geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()
        for (const name of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(name)) geo.deleteAttribute(name)
        if (!geo.attributes.normal) geo.computeVertexNormals()
        if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2))
        geo.morphAttributes = {}
        geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld))
        const mat = m.material as THREE.Material
        const b = buckets.get(mat) ?? { geos: [], cast: false, receive: false }
        b.geos.push(geo)
        b.cast ||= m.castShadow
        b.receive ||= m.receiveShadow
        buckets.set(mat, b)
      }
      for (const c of o.children) visit(c)
    }
    for (const c of g.children) visit(c)

    const merged: THREE.Mesh[] = []
    for (const [material, b] of buckets) {
      if (b.geos.length < 2) { b.geos.forEach((x) => x.dispose()); continue }
      const geo = mergeGeometries(b.geos, false)
      b.geos.forEach((x) => x.dispose())
      if (!geo) continue
      const mesh = new THREE.Mesh(geo, material)
      mesh.castShadow = b.cast
      mesh.receiveShadow = b.receive
      mesh.userData.merged = true
      merged.push(mesh)
    }
    // Ne masquer que les maillages réellement fusionnés.
    const mergedMats = new Set(merged.map((x) => x.material as THREE.Material))
    const toHide: THREE.Mesh[] = []
    const collect = (o: THREE.Object3D) => {
      if (o.userData.noMerge || o.userData.merged || !o.visible) return
      const m = o as THREE.Mesh
      if (m.isMesh && !(m as THREE.InstancedMesh).isInstancedMesh && mergedMats.has(m.material as THREE.Material)) toHide.push(m)
      o.children.forEach(collect)
    }
    g.children.forEach(collect)
    toHide.forEach((m) => { m.visible = false })
    merged.forEach((m) => g.add(m))
    return () => {
      merged.forEach((m) => { g.remove(m); m.geometry.dispose() })
      toHide.forEach((m) => { m.visible = true })
    }
  }, [enabled])
  return <group ref={root}>{children}</group>
}
