import { create } from 'zustand'
import type { AisleId } from '../data/types'

/**
 * État du visiteur, mis à jour à chaque image par le contrôleur de caméra.
 * C'est un objet mutable (pas d'état React) pour ne pas re-rendre l'interface 60 fois par seconde.
 */
/** Champ de vision vertical de base : plus large en portrait pour ne pas « voir par une fente ». */
export const baseFov = () => (typeof window !== 'undefined' && window.innerWidth < window.innerHeight ? 80 : 62)

export const player = {
  x: 0,
  z: 20.6,
  yaw: 0,
  pitch: 0.06,
  fov: baseFov(),
  /** Entrée clavier / joystick normalisée : avant (+1) / arrière, gauche / droite. */
  moveF: 0,
  moveR: 0,
  /** Rotation demandée par les flèches gauche/droite (rad/s). */
  turn: 0,
  sprint: false,
  currentAisle: null as AisleId | null,
}

export interface TravelTarget {
  x: number
  z: number
  yaw: number
  pitch?: number
  /** Saut immédiat (sans animation). */
  instant?: boolean
  id: number
}

interface NavState {
  target: TravelTarget | null
  currentAisle: AisleId | null
  travelTo: (x: number, z: number, yaw: number, pitch?: number, instant?: boolean) => void
  clearTarget: () => void
  setCurrentAisle: (a: AisleId | null) => void
}

let travelId = 0

export const useNav = create<NavState>()((set) => ({
  target: null,
  currentAisle: null,
  travelTo: (x, z, yaw, pitch, instant) => set({ target: { x, z, yaw, pitch, instant, id: ++travelId } }),
  clearTarget: () => set({ target: null }),
  setCurrentAisle: (currentAisle) => set({ currentAisle }),
}))

// Accès de diagnostic depuis la console du navigateur (aucun effet sur l'utilisateur).
if (typeof window !== 'undefined') (window as unknown as { __noel: unknown }).__noel = { player, useNav }
