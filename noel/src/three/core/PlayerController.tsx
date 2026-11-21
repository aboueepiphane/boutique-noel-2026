import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { player, useNav, baseFov } from '../../state/nav'
import { useUI } from '../../state/ui'
import { AISLES, AISLE_ZONES, ROOM } from '../../data/aisles'
import type { AisleId } from '../../data/types'

type Circle = { c: [number, number]; r: number }
type Rect = { x: [number, number]; z: [number, number] }

/** Obstacles au sol (plan x/z) pour que le visiteur ne traverse pas les présentoirs. */
const CIRCLES: Circle[] = [
  { c: [0, 0], r: 3.5 },
  { c: [2.8, 9.6], r: 0.3 },
  { c: [-3.3, 14.6], r: 0.45 }, { c: [3.3, 14.6], r: 0.45 },
  { c: [-4.9, 15.2], r: 0.6 }, { c: [4.9, 15.2], r: 0.6 },
  { c: [-7.4, 14.8], r: 1.2 }, { c: [7.4, 14.8], r: 1.2 },
  { c: [-11.9, 5.2], r: 0.45 }, { c: [-11.9, 11], r: 0.45 },
  { c: [-4.2, -18], r: 0.45 }, { c: [0, -18.6], r: 0.45 }, { c: [4.2, -18], r: 0.45 },
  { c: [2.8, -21.2], r: 0.4 }, { c: [-5.4, -22.6], r: 0.8 },
  { c: [-7.6, -17], r: 0.3 }, { c: [7.6, -17], r: 0.3 }, { c: [-7.6, -22.5], r: 0.3 }, { c: [7.6, -22.5], r: 0.3 },
  { c: [18.7, 13], r: 1.1 }, { c: [18.9, 3], r: 0.3 }, { c: [17.6, 5], r: 0.35 }, { c: [17.4, 11.6], r: 0.4 },
]
const RECTS: Rect[] = [
  { x: [-21, -12.4], z: [1.4, 15.2] },
  { x: [-21, -15.4], z: [-15.8, -4] },
  { x: [-12.95, -11.45], z: [-14.4, -5.6] },
  { x: [-3.0, -1.8], z: [-21.7, -21.1] },
  { x: [11.0, 21], z: [-15.9, -4.1] },
  { x: [12.9, 16.3], z: [4.5, 11.5] },
  { x: [11.05, 11.75], z: [4.1, 5.7] },
  { x: [11.05, 11.75], z: [10.1, 12.3] },
  { x: [18.8, 21], z: [6.6, 9.4] },
]
const RADIUS = 0.35
const EYE = 1.65

function collide(p: THREE.Vector2) {
  for (const { c, r } of CIRCLES) {
    if (r <= 0) continue
    const dx = p.x - c[0], dz = p.y - c[1]
    const d = Math.hypot(dx, dz)
    const min = r + RADIUS
    if (d < min && d > 1e-5) {
      p.x = c[0] + (dx / d) * min
      p.y = c[1] + (dz / d) * min
    }
  }
  for (const { x, z } of RECTS) {
    const x0 = x[0] - RADIUS, x1 = x[1] + RADIUS, z0 = z[0] - RADIUS, z1 = z[1] + RADIUS
    if (p.x > x0 && p.x < x1 && p.y > z0 && p.y < z1) {
      const pen = [p.x - x0, x1 - p.x, p.y - z0, z1 - p.y]
      const i = pen.indexOf(Math.min(...pen))
      if (i === 0) p.x = x0
      else if (i === 1) p.x = x1
      else if (i === 2) p.y = z0
      else p.y = z1
    }
  }
  p.x = THREE.MathUtils.clamp(p.x, ROOM.minX + 0.4, ROOM.maxX - 0.4)
  p.y = THREE.MathUtils.clamp(p.y, ROOM.minZ + 0.4, ROOM.maxZ - 0.6)
}

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

/** Allée dans laquelle se trouve le visiteur : son emprise élargie de 4 m vers le hall. */
const aisleAt = (x: number, z: number): AisleId | null => {
  for (const a of AISLES) {
    const [x0, z0, w, d] = AISLE_ZONES[a.id]
    const m = 4
    if (x > x0 - m && x < x0 + w + m && z > z0 - m && z < z0 + d + m) return a.id
  }
  return null
}

/**
 * Caméra à la première personne : ZQSD / WASD / flèches, glisser pour regarder,
 * molette ou pincement pour zoomer, déplacements automatiques fluides vers une allée.
 */
export function PlayerController() {
  const { camera, gl } = useThree()
  const keys = useRef(new Set<string>())
  const look = useRef({ yaw: player.yaw, pitch: player.pitch, fov: player.fov })
  const vel = useRef(new THREE.Vector2())
  const pos = useRef(new THREE.Vector2(player.x, player.z))
  const bob = useRef(0)
  const lastAisle = useRef<AisleId | null>(null)
  useEffect(() => { (window as unknown as { __noel: Record<string, unknown> }).__noel.camera = camera; (window as unknown as { __noel: Record<string, unknown> }).__noel.gl = gl }, [camera, gl])

  useEffect(() => {
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
    }
    const down = (e: KeyboardEvent) => {
      if (isTyping(e) || useUI.getState().productId) return
      const k = e.code
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'KeyQ', 'KeyE'].includes(k)) {
        keys.current.add(k)
        if (k.startsWith('Arrow')) e.preventDefault()
        useNav.getState().clearTarget()
      }
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const blur = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)

    // Regard à la souris / au doigt et zoom
    const el = gl.domElement
    const pointers = new Map<number, { x: number; y: number }>()
    let pinch = 0
    const pdown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinch = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
    const pmove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        look.current.fov = THREE.MathUtils.clamp(look.current.fov - (d - pinch) * 0.08, 32, 85)
        pinch = d
        return
      }
      if (Math.abs(dx) + Math.abs(dy) > 0) {
        const s = e.pointerType === 'touch' ? 0.005 : 0.0032
        const fovK = look.current.fov / baseFov()
        look.current.yaw += dx * s * fovK
        look.current.pitch = THREE.MathUtils.clamp(look.current.pitch + dy * s * fovK, -0.75, 0.6)
        if (Math.abs(dx) + Math.abs(dy) > 2) useNav.getState().clearTarget()
      }
    }
    const pup = (e: PointerEvent) => pointers.delete(e.pointerId)
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      look.current.fov = THREE.MathUtils.clamp(look.current.fov + e.deltaY * 0.025, 32, 85)
    }
    el.addEventListener('pointerdown', pdown)
    window.addEventListener('pointermove', pmove)
    window.addEventListener('pointerup', pup)
    window.addEventListener('pointercancel', pup)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
      el.removeEventListener('pointerdown', pdown)
      window.removeEventListener('pointermove', pmove)
      window.removeEventListener('pointerup', pup)
      window.removeEventListener('pointercancel', pup)
      el.removeEventListener('wheel', wheel)
    }
  }, [gl])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const k = keys.current
    const target = useNav.getState().target

    // Entrées : clavier + joystick tactile
    let f = player.moveF, r = player.moveR
    if (k.has('KeyW') || k.has('ArrowUp')) f += 1
    if (k.has('KeyS') || k.has('ArrowDown')) f -= 1
    if (k.has('KeyD')) r += 1
    if (k.has('KeyA')) r -= 1
    let turn = 0
    if (k.has('ArrowLeft') || k.has('KeyQ')) turn += 1
    if (k.has('ArrowRight') || k.has('KeyE')) turn -= 1
    const len = Math.hypot(f, r)
    if (len > 1) { f /= len; r /= len }
    if (len > 0.05 && target) useNav.getState().clearTarget()
    look.current.yaw += turn * 1.6 * dt

    const sprint = k.has('ShiftLeft') || k.has('ShiftRight')
    const speed = sprint ? 5.2 : 3.0

    if (target) {
      // Déplacement automatique : approche amortie (sans à-coups) vers le point de vue
      const ease = target.instant ? 1 : 1 - Math.exp(-dt * 2.2)
      if (target.instant) { player.yaw = target.yaw; player.pitch = target.pitch ?? -0.05 }
      pos.current.x += (target.x - pos.current.x) * ease
      pos.current.y += (target.z - pos.current.y) * ease
      look.current.yaw += wrapAngle(target.yaw - look.current.yaw) * ease
      look.current.pitch += ((target.pitch ?? -0.05) - look.current.pitch) * ease
      look.current.fov += (baseFov() - look.current.fov) * ease
      vel.current.set(0, 0)
      if (Math.hypot(target.x - pos.current.x, target.z - pos.current.y) < 0.03 && Math.abs(wrapAngle(target.yaw - look.current.yaw)) < 0.005) {
        useNav.getState().clearTarget()
      }
    } else {
      const yaw = look.current.yaw
      // avant = (−sin yaw, −cos yaw), droite = (cos yaw, −sin yaw)
      const wx = -Math.sin(yaw) * f + Math.cos(yaw) * r
      const wz = -Math.cos(yaw) * f - Math.sin(yaw) * r
      const accel = 1 - Math.exp(-dt * (len > 0.05 ? 7 : 9))
      vel.current.x += (wx * speed - vel.current.x) * accel
      vel.current.y += (wz * speed - vel.current.y) * accel
      pos.current.x += vel.current.x * dt
      pos.current.y += vel.current.y * dt
      collide(pos.current)
    }

    // Lissage du regard
    const sm = 1 - Math.exp(-dt * 14)
    player.yaw += wrapAngle(look.current.yaw - player.yaw) * sm
    player.pitch += (look.current.pitch - player.pitch) * sm
    player.fov += (look.current.fov - player.fov) * sm
    player.x = pos.current.x
    player.z = pos.current.y

    const moving = vel.current.length()
    bob.current += dt * moving * 2.4
    const bobY = Math.sin(bob.current * 2) * 0.018 * Math.min(1, moving / 3)

    camera.position.set(player.x, EYE + bobY, player.z)
    camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ')
    const cam = camera as THREE.PerspectiveCamera
    if (Math.abs(cam.fov - player.fov) > 0.01) {
      cam.fov = player.fov
      cam.updateProjectionMatrix()
    }

    const aisle = aisleAt(player.x, player.z)
    if (aisle !== lastAisle.current) {
      lastAisle.current = aisle
      player.currentAisle = aisle
      useNav.getState().setCurrentAisle(aisle)
    }
  })

  // Synchronise le regard si un autre module a modifié player (retour à l'entrée, etc.)
  useEffect(() => useNav.subscribe((s) => {
    if (!s.target) return
    keys.current.clear()
  }), [])

  return null
}
