/**
 * Musique d'ambiance générée en direct (Web Audio) : une boîte à musique originale
 * sur une progression d'accords simple, avec un léger écho. Aucun fichier audio à charger.
 */
let ctx: AudioContext | null = null
let master: GainNode | null = null
let timer: ReturnType<typeof setInterval> | null = null
let step = 0

// Progression I – vi – IV – V en ré majeur (fréquences en Hz)
const CHORDS = [
  [293.66, 369.99, 440.0, 587.33],
  [246.94, 293.66, 369.99, 493.88],
  [196.0, 246.94, 293.66, 392.0],
  [220.0, 277.18, 329.63, 440.0],
]
const PATTERN = [0, 1, 2, 3, 2, 1, 3, 2]

function bell(freq: number, t: number, gain = 0.16) {
  if (!ctx || !master) return
  const o = ctx.createOscillator()
  const o2 = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sine'
  o2.type = 'sine'
  o.frequency.value = freq * 2
  o2.frequency.value = freq * 4.01 // partiel aigu qui donne le timbre « clochette »
  const g2 = ctx.createGain()
  g2.gain.value = 0.18
  o.connect(g)
  o2.connect(g2).connect(g)
  g.connect(master)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)
  o.start(t); o2.start(t)
  o.stop(t + 1.9); o2.stop(t + 1.9)
}

function pad(freqs: number[], t: number, dur: number) {
  if (!ctx || !master) return
  for (const f of freqs.slice(0, 3)) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.value = f / 2
    o.connect(g).connect(master)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.02, t + 0.6)
    g.gain.linearRampToValueAtTime(0, t + dur)
    o.start(t)
    o.stop(t + dur + 0.05)
  }
}

export async function startMusic() {
  if (timer) return
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  ctx = ctx ?? new AC()
  await ctx.resume()
  master = ctx.createGain()
  master.gain.value = 0.55
  // écho doux
  const delay = ctx.createDelay()
  delay.delayTime.value = 0.36
  const fb = ctx.createGain()
  fb.gain.value = 0.28
  master.connect(ctx.destination)
  master.connect(delay)
  delay.connect(fb).connect(delay)
  delay.connect(ctx.destination)
  const beat = 0.32
  let next = ctx.currentTime + 0.1
  const tick = () => {
    if (!ctx) return
    while (next < ctx.currentTime + 0.6) {
      const bar = Math.floor(step / 8) % CHORDS.length
      const chord = CHORDS[bar]
      if (step % 8 === 0) pad(chord, next, beat * 8)
      bell(chord[PATTERN[step % 8]], next, step % 8 === 0 ? 0.18 : 0.12)
      next += beat
      step++
    }
  }
  tick()
  timer = setInterval(tick, 150)
}

export function stopMusic() {
  if (timer) clearInterval(timer)
  timer = null
  if (master && ctx) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.2)
    const m = master
    setTimeout(() => m.disconnect(), 800)
  }
  master = null
}
