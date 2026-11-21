import * as THREE from 'three'

/** Matériaux partagés et mis en cache, pour limiter les changements d'état GPU. */
const cache = new Map<string, THREE.Material>()

const get = <T extends THREE.Material>(key: string, create: () => T): T => {
  let m = cache.get(key) as T | undefined
  if (!m) {
    m = create()
    cache.set(key, m)
  }
  return m
}

export const mat = {
  std: (color: string, roughness = 0.6, metalness = 0) =>
    get(`std-${color}-${roughness}-${metalness}`, () => new THREE.MeshStandardMaterial({ color, roughness, metalness })),
  /** Verre laqué / boule de Noël : vernis brillant. */
  lacquer: (color: string, roughness = 0.18, metalness = 0.35) =>
    get(`lac-${color}-${roughness}-${metalness}`, () => new THREE.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat: 1, clearcoatRoughness: 0.08 })),
  metal: (color: string, roughness = 0.28) =>
    get(`met-${color}-${roughness}`, () => new THREE.MeshStandardMaterial({ color, roughness, metalness: 1 })),
  gold: () => get('gold', () => new THREE.MeshStandardMaterial({ color: '#d4af6a', roughness: 0.26, metalness: 1 })),
  goldSoft: () => get('goldsoft', () => new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.45, metalness: 0.85 })),
  silver: () => get('silver', () => new THREE.MeshStandardMaterial({ color: '#d7dbe0', roughness: 0.2, metalness: 1 })),
  velvet: (color: string) =>
    get(`vel-${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.85, sheen: 0.6, sheenRoughness: 0.55, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.15) })),
  glass: (color = '#e8f3f8', opacity = 0.28) =>
    get(`glass-${color}-${opacity}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.04, metalness: 0, transparent: true, opacity, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide })),
  /** Matériau lumineux : non affecté par le tone mapping pour « briller » avec le bloom. */
  glow: (color: string, intensity = 2.2) =>
    get(`glow-${color}-${intensity}`, () => new THREE.MeshStandardMaterial({ color: '#000000', emissive: new THREE.Color(color), emissiveIntensity: intensity, toneMapped: false })),
  basicGlow: (color: string, opacity = 0.35) =>
    get(`bglow-${color}-${opacity}`, () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })),
  needles: (color: string) =>
    get(`needles-${color}`, () => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true })),
  snow: () => get('snow', () => new THREE.MeshStandardMaterial({ color: '#cdd5de', roughness: 0.95, flatShading: true })),
  skin: () => get('skin', () => new THREE.MeshStandardMaterial({ color: '#f0c9a8', roughness: 0.6 })),
  fur: () => get('fur', () => new THREE.MeshStandardMaterial({ color: '#f7f3ea', roughness: 1, flatShading: true })),
  dark: () => get('dark', () => new THREE.MeshStandardMaterial({ color: '#1a1512', roughness: 0.5 })),
  wood: (color = '#8a5a33') => get(`wood-${color}`, () => new THREE.MeshStandardMaterial({ color, roughness: 0.7 })),
}
