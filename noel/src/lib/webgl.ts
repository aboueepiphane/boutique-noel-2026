/** Vérifie que le navigateur peut créer un contexte WebGL (sinon : mode catalogue 2D). */
let cached: boolean | null = null
export const hasWebGL = () => {
  if (cached !== null) return cached
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    cached = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cached = false
  }
  // Préférence locale « noel-force-2d » = 1 : force le mode catalogue (utile pour le tester).
  try { if (localStorage.getItem('noel-force-2d') === '1') cached = false } catch { /* ignoré */ }
  return cached
}
