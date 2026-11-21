import { useMemo } from 'react'
import * as THREE from 'three'
import { ROOM } from '../../data/aisles'
import { parquetTexture, wallpaperTexture, carpetTexture, woodTexture, rng } from '../../lib/textures'
import { mat } from '../models/materials'
import { Bulbs, Baubles, Bow } from '../models/common'
import { starGeometry } from '../models/geometry'
import { Wreath } from '../models/home'

const { minX, maxX, minZ, maxZ, height: H } = ROOM
const W = maxX - minX
const D = maxZ - minZ
const CZ = (minZ + maxZ) / 2

/** Courbe en chaînette entre deux points (guirlandes suspendues). */
const catenary = (a: THREE.Vector3, b: THREE.Vector3, sag: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n
    return new THREE.Vector3().lerpVectors(a, b, t).add(new THREE.Vector3(0, -Math.sin(t * Math.PI) * sag, 0))
  })

function Floor() {
  const parquet = useMemo(() => {
    const t = parquetTexture().clone()
    t.needsUpdate = true
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(W / 3.2, D / 3.2)
    return t
  }, [])
  const carpet = carpetTexture()
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, CZ]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={parquet} roughness={0.42} metalness={0.02} envMapIntensity={0.6} />
      </mesh>
      {/* tapis rouge de l'entrée jusqu'au sapin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 13.5]} receiveShadow>
        <planeGeometry args={[3, 17]} />
        <meshStandardMaterial map={carpet} roughness={0.95} />
      </mesh>
      {/* médaillon de marbre et d'or au pied du sapin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <circleGeometry args={[5.4, 64]} />
        <meshStandardMaterial color="#efe7d8" roughness={0.18} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0]}>
        <ringGeometry args={[5.05, 5.25, 96]} />
        <meshStandardMaterial color="#c9a45c" roughness={0.3} metalness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0]}>
        <ringGeometry args={[4.55, 4.62, 96]} />
        <meshStandardMaterial color="#8e1b26" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Walls() {
  const paper = wallpaperTexture()
  const wood = woodTexture('fonce')
  const mkWall = (len: number, rep: number) => {
    const t = paper.clone()
    t.needsUpdate = true
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(rep, 2.2)
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, side: THREE.FrontSide, name: `wall-${len}` })
  }
  const sideMat = useMemo(() => mkWall(D, D / 3), [])
  const backMat = useMemo(() => mkWall(W, W / 3), [])
  const wain = useMemo(() => new THREE.MeshStandardMaterial({ map: wood, color: '#a07050', roughness: 0.6 }), [wood])
  const trim = mat.goldSoft()

  // Mur sud percé d'une grande porte (x ∈ [−3, 3], h = 5) et de deux fenêtres.
  const south: [number, number, number, number][] = [
    // [x centre, largeur, y centre, hauteur]
    [-12.5, 15, H / 2, H],
    [12.5, 15, H / 2, H],
    [0, 10, (H + 5) / 2, H - 5],
    [-4, 2, 2.5, 5],
    [4, 2, 2.5, 5],
  ]
  return (
    <group>
      {/* ouest */}
      <mesh position={[minX, H / 2, CZ]} rotation={[0, Math.PI / 2, 0]} material={sideMat} receiveShadow><planeGeometry args={[D, H]} /></mesh>
      {/* est */}
      <mesh position={[maxX, H / 2, CZ]} rotation={[0, -Math.PI / 2, 0]} material={sideMat} receiveShadow><planeGeometry args={[D, H]} /></mesh>
      {/* nord */}
      <mesh position={[0, H / 2, minZ]} material={backMat} receiveShadow><planeGeometry args={[W, H]} /></mesh>
      {/* sud */}
      {south.map(([x, w, y, h], i) => (
        <mesh key={i} position={[x, y, maxZ]} rotation={[0, Math.PI, 0]} material={backMat}><planeGeometry args={[w, h]} /></mesh>
      ))}
      {/* lambris bois et moulures dorées */}
      {[
        { p: [minX + 0.05, 0.6, CZ], r: Math.PI / 2, l: D },
        { p: [maxX - 0.05, 0.6, CZ], r: -Math.PI / 2, l: D },
        { p: [0, 0.6, minZ + 0.05], r: 0, l: W },
      ].map((w, i) => (
        <group key={i} position={w.p as [number, number, number]} rotation={[0, w.r, 0]}>
          <mesh material={wain} receiveShadow><boxGeometry args={[w.l, 1.2, 0.1]} /></mesh>
          <mesh material={trim} position={[0, 0.62, 0.04]}><boxGeometry args={[w.l, 0.06, 0.08]} /></mesh>
          <mesh material={trim} position={[0, H - 0.75, 0.0]}><boxGeometry args={[w.l, 0.12, 0.14]} /></mesh>
        </group>
      ))}
      {[-12.5, 12.5].map((x) => (
        <group key={x} position={[x, 0.6, maxZ - 0.05]} rotation={[0, Math.PI, 0]}>
          <mesh material={wain}><boxGeometry args={[15, 1.2, 0.1]} /></mesh>
          <mesh material={trim} position={[0, 0.62, 0.04]}><boxGeometry args={[15, 0.06, 0.08]} /></mesh>
        </group>
      ))}
    </group>
  )
}

/** Porte vitrée et fenêtres donnant sur une nuit enneigée. */
function Entranceway() {
  const night = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 512
    const g = c.getContext('2d')!
    const grd = g.createLinearGradient(0, 0, 0, 512)
    grd.addColorStop(0, '#0b1630'); grd.addColorStop(0.7, '#1d2c4f'); grd.addColorStop(1, '#dfe7f2')
    g.fillStyle = grd; g.fillRect(0, 0, 512, 512)
    const r = rng(9)
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`
      const s = r() * 2.6 + 0.6
      g.beginPath(); g.arc(r() * 512, r() * 512, s, 0, Math.PI * 2); g.fill()
    }
    // silhouettes de maisons éclairées au loin
    g.fillStyle = '#0d1424'
    for (let x = 0; x < 512; x += 70) {
      const h = 60 + r() * 50
      g.fillRect(x, 430 - h, 62, h + 20)
      g.beginPath(); g.moveTo(x - 4, 430 - h); g.lineTo(x + 31, 400 - h); g.lineTo(x + 66, 430 - h); g.fill()
      g.fillStyle = '#ffcf7a'
      g.fillRect(x + 12, 440 - h + 20, 10, 12); g.fillRect(x + 38, 440 - h + 20, 10, 12)
      g.fillStyle = '#0d1424'
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const frame = mat.goldSoft()
  return (
    <group>
      {/* vue extérieure */}
      <mesh position={[0, 2.5, maxZ + 0.6]} rotation={[0, Math.PI, 0]}><planeGeometry args={[6, 5]} /><meshBasicMaterial map={night} toneMapped={false} /></mesh>
      {/* portes vitrées */}
      {[-1.5, 1.5].map((x) => (
        <group key={x} position={[x, 2.25, maxZ + 0.05]}>
          <mesh material={mat.glass('#cfe0f0', 0.18)}><planeGeometry args={[2.9, 4.4]} /></mesh>
          {[[-1.45, 0, 0.08, 4.5], [1.45, 0, 0.08, 4.5], [0, 2.22, 2.98, 0.08], [0, -2.22, 2.98, 0.08], [0, 0.2, 2.9, 0.05]].map(([px, py, w, h], i) => (
            <mesh key={i} material={frame} position={[px, py, 0]}><boxGeometry args={[w, h, 0.08]} /></mesh>
          ))}
          <mesh material={frame} position={[x > 0 ? -1.15 : 1.15, 0, 0.08]}><boxGeometry args={[0.04, 0.8, 0.04]} /></mesh>
        </group>
      ))}
      <mesh material={frame} position={[0, 5.0, maxZ - 0.02]}><boxGeometry args={[6.4, 0.18, 0.2]} /></mesh>
      {/* fenêtres latérales cintrées */}
      {[-9, 9].map((x) => (
        <group key={x} position={[x, 3.2, maxZ - 0.03]} rotation={[0, Math.PI, 0]}>
          <mesh><planeGeometry args={[3.2, 3.6]} /><meshBasicMaterial map={night} toneMapped={false} /></mesh>
          <mesh material={frame} position={[0, 0, 0.02]}><boxGeometry args={[0.06, 3.6, 0.05]} /></mesh>
          <mesh material={frame} position={[0, 0.4, 0.02]}><boxGeometry args={[3.2, 0.06, 0.05]} /></mesh>
          {[-1.6, 1.6].map((px) => <mesh key={px} material={mat.wood('#3b2416')} position={[px, 0, 0.05]}><boxGeometry args={[0.18, 3.8, 0.12]} /></mesh>)}
          <mesh material={mat.wood('#3b2416')} position={[0, -1.85, 0.12]}><boxGeometry args={[3.6, 0.12, 0.35]} /></mesh>
          <mesh material={mat.wood('#3b2416')} position={[0, 1.85, 0.05]}><boxGeometry args={[3.6, 0.16, 0.12]} /></mesh>
          {/* guirlande sur l'appui de fenêtre */}
          <group position={[0, 2.05, 0.1]}><Wreath radius={0.28} /></group>
        </group>
      ))}
    </group>
  )
}

function Ceiling({ quality }: { quality: string }) {
  const strands = useMemo(() => {
    const top = new THREE.Vector3(0, H - 0.25, 0)
    const pts: THREE.Vector3[] = []
    const n = quality === 'basse' ? 10 : 16
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      // point d'ancrage sur les murs (projection du rayon sur le rectangle de la salle)
      const dx = Math.cos(a), dz = Math.sin(a)
      const tx = dx > 0 ? (maxX - 0.3) / dx : (minX + 0.3) / dx
      const tz = dz > 0 ? (maxZ - 0.3) / dz : (minZ + 0.3) / dz
      const t = Math.min(tx, tz)
      const end = new THREE.Vector3(dx * t, H - 1.0, dz * t)
      pts.push(...catenary(top, end, 1.3, quality === 'basse' ? 26 : 44))
    }
    return pts
  }, [quality])
  const hanging = useMemo(() => {
    const r = rng(33)
    return Array.from({ length: 34 }, () => {
      const a = r() * Math.PI * 2
      const d = 6 + r() * 11
      return { p: new THREE.Vector3(Math.cos(a) * d, 4.3 + r() * 1.6, Math.sin(a) * d * 1.1 - 2), c: ['#9b1c23', '#c9a45c', '#f3efe6', '#1f4d36'][Math.floor(r() * 4)], s: 0.12 + r() * 0.14, star: r() > 0.7 }
    }).filter((h) => h.p.x > minX + 1 && h.p.x < maxX - 1 && h.p.z > minZ + 1 && h.p.z < maxZ - 2)
  }, [])
  const beams = mat.wood('#2b1a10')
  return (
    <group>
      <mesh position={[0, H, CZ]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[W, D]} /><meshStandardMaterial color="#2a1c14" roughness={0.9} /></mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} material={beams} position={[0, H - 0.2, minZ + 3 + i * 6]}><boxGeometry args={[W, 0.4, 0.35]} /></mesh>
      ))}
      {[-10, 10].map((x) => (
        <mesh key={x} material={beams} position={[x, H - 0.45, CZ]}><boxGeometry args={[0.35, 0.3, D]} /></mesh>
      ))}
      <Bulbs points={strands} color="#ffd38a" size={0.045} intensity={2.4} twinkle={0.5} />
      {/* couronne de lumière sous le plafond, au-dessus du sapin */}
      <mesh material={mat.goldSoft()} position={[0, H - 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.2, 0.08, 10, 48]} /></mesh>
      {/* suspensions : boules et étoiles à des fils */}
      {hanging.map((h, i) => (
        <group key={i} position={h.p}>
          <mesh material={mat.std('#c9a45c', 0.4, 0.8)} position={[0, (H - h.p.y) / 2, 0]}><cylinderGeometry args={[0.004, 0.004, H - h.p.y, 3]} /></mesh>
          {h.star ? (
            <mesh geometry={starGeometry(0.15)} material={mat.gold()} scale={h.s * 1.4} rotation={[0, i, 0]} />
          ) : (
            <mesh material={mat.lacquer(h.c, 0.15, 0.5)} scale={h.s}><sphereGeometry args={[1, 24, 18]} /></mesh>
          )}
        </group>
      ))}
    </group>
  )
}

/** Lustre en laiton à bougies. */
function Chandelier({ position }: { position: [number, number, number] }) {
  const arms = 8
  const bulbs = useMemo(() => Array.from({ length: arms }, (_, i) => {
    const a = (i / arms) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a) * 0.75, 0.28, Math.sin(a) * 0.75)
  }), [])
  const brass = mat.metal('#b8914a', 0.3)
  return (
    <group position={position}>
      <mesh material={brass} position={[0, (H - position[1]) / 2, 0]}><cylinderGeometry args={[0.02, 0.02, H - position[1], 6]} /></mesh>
      <mesh material={brass}><sphereGeometry args={[0.16, 18, 14]} /></mesh>
      <mesh material={brass} position={[0, -0.22, 0]}><coneGeometry args={[0.08, 0.26, 14]} /></mesh>
      <mesh material={brass} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.75, 0.025, 8, 40]} /></mesh>
      {bulbs.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh material={brass} position={[0, 0.06, 0]}><cylinderGeometry args={[0.04, 0.03, 0.06, 10]} /></mesh>
          <mesh material={mat.std('#f4ecd8', 0.5)} position={[0, 0.16, 0]}><cylinderGeometry args={[0.018, 0.018, 0.16, 8]} /></mesh>
        </group>
      ))}
      <Bulbs points={bulbs} color="#ffc070" size={0.04} intensity={3} twinkle={0.15} />
      {/* guirlande de perles sous le lustre */}
      <Baubles points={Array.from({ length: 8 }, (_, i) => new THREE.Vector3(Math.cos((i / 8) * Math.PI * 2 + 0.4) * 0.6, -0.25, Math.sin((i / 8) * Math.PI * 2 + 0.4) * 0.6))} colors={['#9b1c23', '#c9a45c']} size={0.06} />
    </group>
  )
}

/** Feston de sapin le long des murs, avec nœuds rouges et lumières. */
function WallSwags() {
  const data = useMemo(() => {
    const bulbs: THREE.Vector3[] = []
    const bows: { p: THREE.Vector3; r: number }[] = []
    const runs: { a: THREE.Vector3; b: THREE.Vector3; r: number }[] = []
    const segs = (z: number | null, x: number | null, from: number, to: number, r: number, inset: number) => {
      const n = Math.round(Math.abs(to - from) / 4)
      for (let i = 0; i < n; i++) {
        const t0 = from + ((to - from) * i) / n
        const t1 = from + ((to - from) * (i + 1)) / n
        const a = x !== null ? new THREE.Vector3(x + inset, H - 1.0, t0) : new THREE.Vector3(t0, H - 1.0, z! + inset)
        const b = x !== null ? new THREE.Vector3(x + inset, H - 1.0, t1) : new THREE.Vector3(t1, H - 1.0, z! + inset)
        runs.push({ a, b, r })
        bulbs.push(...catenary(a, b, 0.6, 12))
        bows.push({ p: a.clone(), r })
      }
    }
    segs(null, minX, minZ + 1, maxZ - 1, Math.PI / 2, 0.25)
    segs(null, maxX, minZ + 1, maxZ - 1, -Math.PI / 2, -0.25)
    segs(minZ, null, minX + 1, maxX - 1, 0, 0.25)
    return { bulbs, bows, runs }
  }, [])
  const tubes = useMemo(() => data.runs.map(({ a, b }) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(catenary(a, b, 0.6, 10)), 20, 0.12, 6)), [data])
  const needles = mat.needles('#1f4d36')
  return (
    <group>
      {tubes.map((g, i) => <mesh key={i} geometry={g} material={needles} />)}
      <Bulbs points={data.bulbs} color="#ffd38a" size={0.035} intensity={2.2} twinkle={0.4} />
      {data.bows.map((b, i) => (
        <group key={i} position={b.p} rotation={[0, b.r, 0]}><Bow color="#9b1c23" size={0.28} /></group>
      ))}
    </group>
  )
}

export function Room({ quality }: { quality: string }) {
  return (
    <group>
      <Floor />
      <Walls />
      <Entranceway />
      <Ceiling quality={quality} />
      <WallSwags />
      {[[-8, 5.6, 14], [8, 5.6, 14], [-8, 5.6, -6], [8, 5.6, -6]].map((p, i) => (
        <Chandelier key={i} position={p as [number, number, number]} />
      ))}
    </group>
  )
}
