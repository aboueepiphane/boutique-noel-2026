import { useRef, useState } from 'react'
import { player, useNav } from '../../state/nav'

/** Joystick tactile : pousser le pouce pour avancer, reculer ou se décaler. */
export function Joystick({ size = 124 }: { size?: number }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const origin = useRef<{ x: number; y: number; id: number } | null>(null)
  const R = size / 2 - 18
  const update = (cx: number, cy: number) => {
    if (!origin.current) return
    let dx = cx - origin.current.x
    let dy = cy - origin.current.y
    const d = Math.hypot(dx, dy)
    if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R }
    setKnob({ x: dx, y: dy })
    // zone morte de 12 % puis réponse progressive
    const nx = dx / R, ny = dy / R
    const mag = Math.hypot(nx, ny)
    const k = mag < 0.12 ? 0 : (mag - 0.12) / 0.88 / (mag || 1)
    player.moveR = nx * k
    player.moveF = -ny * k
    if (mag > 0.12) useNav.getState().clearTarget()
  }
  const end = () => {
    origin.current = null
    setKnob({ x: 0, y: 0 })
    player.moveF = 0
    player.moveR = 0
  }
  return (
    <div
      className="relative touch-none select-none rounded-full glass"
      style={{ width: size, height: size }}
      onPointerDown={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2, id: e.pointerId }
        e.currentTarget.setPointerCapture(e.pointerId)
        update(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => origin.current?.id === e.pointerId && update(e.clientX, e.clientY)}
      onPointerUp={end}
      onPointerCancel={end}
      role="application"
      aria-label="Joystick de déplacement"
    >
      {['▲', '▼', '◀', '▶'].map((a, i) => (
        <span key={a} className="absolute text-[10px] text-or-light/50" style={{
          left: i === 2 ? 10 : i === 3 ? undefined : '50%', right: i === 3 ? 10 : undefined,
          top: i === 0 ? 8 : i === 1 ? undefined : '50%', bottom: i === 1 ? 8 : undefined,
          transform: i < 2 ? 'translateX(-50%)' : 'translateY(-50%)',
        }}>{a}</span>
      ))}
      <div className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-gradient-to-b from-or-light to-or shadow-lg ring-4 ring-white/10"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`, transition: origin.current ? 'none' : 'transform .2s ease' }} />
    </div>
  )
}
