import { useEffect, useRef } from 'react'
import { AISLES, AISLE_ZONES as ZONES, ENTRANCE_VIEW, ROOM } from '../../data/aisles'
import { player, useNav } from '../../state/nav'

const W = ROOM.maxX - ROOM.minX // 40
const D = ROOM.maxZ - ROOM.minZ // 48
const tx = (x: number) => x - ROOM.minX
const tz = (z: number) => z - ROOM.minZ


/** Mini-carte : position et orientation du visiteur en temps réel, allées cliquables. */
export function Minimap({ size = 200 }: { size?: number }) {
  const dot = useRef<SVGGElement>(null)
  const travelTo = useNav((s) => s.travelTo)
  const current = useNav((s) => s.currentAisle)
  useEffect(() => {
    let raf = 0
    const loop = () => {
      // Le cône de vision pointe vers −z quand yaw = 0 ; l'axe y du SVG va vers le bas comme z.
      const deg = (-player.yaw * 180) / Math.PI
      dot.current?.setAttribute('transform', `translate(${tx(player.x)} ${tz(player.z)}) rotate(${deg})`)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <svg viewBox={`-1 -1 ${W + 2} ${D + 2}`} width={size} height={(size * (D + 2)) / (W + 2)} role="img" aria-label="Plan de la boutique avec votre position" className="block">
      <rect x={0} y={0} width={W} height={D} rx={1.2} fill="rgba(251,247,238,.06)" stroke="rgba(232,211,162,.55)" strokeWidth={0.35} />
      {/* entrée */}
      <rect x={tx(-3)} y={D - 0.4} width={6} height={0.8} fill="#c9a45c" />
      <text x={W / 2} y={D - 1.4} textAnchor="middle" fontSize={1.6} fill="rgba(246,236,214,.7)" fontFamily="Inter, sans-serif" letterSpacing={0.2}>ENTRÉE</text>
      {/* tapis rouge */}
      <rect x={tx(-1.5)} y={tz(5)} width={3} height={17} fill="rgba(155,28,35,.35)" />
      {AISLES.map((a) => {
        const [x0, z0, w, d] = ZONES[a.id]
        const active = current === a.id
        return (
          <g key={a.id} className="cursor-pointer" onClick={() => travelTo(a.viewpoint[0], a.viewpoint[1], a.viewpoint[2])}>
            <title>{a.address}</title>
            <rect x={tx(x0)} y={tz(z0)} width={w} height={d} rx={0.8} fill={a.color} fillOpacity={active ? 0.95 : 0.6} stroke={active ? '#e8d3a2' : 'transparent'} strokeWidth={0.4} />
            <text x={tx(x0) + w / 2} y={tz(z0) + d / 2 + 1.1} textAnchor="middle" fontSize={3.2} fontWeight={600} fill="#f6ecd6" fontFamily="Cormorant Garamond, serif">{a.number}</text>
          </g>
        )
      })}
      {/* sapin central */}
      <circle cx={tx(0)} cy={tz(0)} r={3.2} fill="#1f4d36" stroke="#c9a45c" strokeWidth={0.35} className="cursor-pointer" onClick={() => travelTo(0, 7, 0, 0.12)} />
      <path d={`M${tx(0)} ${tz(0) - 1.8} l1.5 3 h-3 z`} fill="#e8d3a2" pointerEvents="none" />
      <circle cx={tx(ENTRANCE_VIEW[0])} cy={tz(ENTRANCE_VIEW[1])} r={0.6} fill="none" stroke="#c9a45c" strokeWidth={0.3} />
      {/* visiteur */}
      <g ref={dot}>
        <path d="M0 0 L-3.2 -6.5 A7 7 0 0 1 3.2 -6.5 Z" fill="rgba(255,220,150,.35)" />
        <circle r={1.15} fill="#fff8ea" stroke="#9b1c23" strokeWidth={0.55} />
      </g>
    </svg>
  )
}
