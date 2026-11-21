import * as THREE from 'three'

/**
 * Textures générées dans un <canvas> : aucun fichier image à télécharger,
 * ce qui garde la boutique légère sur une connexion moyenne.
 */
const cache = new Map<string, THREE.Texture>()

const make = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, opts: { repeat?: [number, number]; srgb?: boolean; aniso?: number } = {}) => {
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c)
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(...opts.repeat)
  }
  t.anisotropy = opts.aniso ?? 8
  cache.set(key, t)
  return t
}

/** Générateur pseudo-aléatoire déterministe (mulberry32) pour des textures identiques à chaque visite. */
export const rng = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const woodStrip = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, base: [number, number, number], r: () => number, vertical: boolean) => {
  const v = (r() - 0.5) * 26
  g.fillStyle = `rgb(${base[0] + v},${base[1] + v * 0.8},${base[2] + v * 0.6})`
  g.fillRect(x, y, w, h)
  // veinage
  g.globalAlpha = 0.18
  const lines = 7 + Math.floor(r() * 6)
  for (let i = 0; i < lines; i++) {
    g.strokeStyle = r() > 0.5 ? '#3b2412' : '#d9b48a'
    g.lineWidth = 0.6 + r() * 1.4
    g.beginPath()
    if (vertical) {
      const px = x + r() * w
      g.moveTo(px, y)
      g.bezierCurveTo(px + (r() - 0.5) * 8, y + h * 0.33, px + (r() - 0.5) * 8, y + h * 0.66, px + (r() - 0.5) * 6, y + h)
    } else {
      const py = y + r() * h
      g.moveTo(x, py)
      g.bezierCurveTo(x + w * 0.33, py + (r() - 0.5) * 8, x + w * 0.66, py + (r() - 0.5) * 8, x + w, py + (r() - 0.5) * 6)
    }
    g.stroke()
  }
  g.globalAlpha = 1
  g.strokeStyle = 'rgba(40,22,10,0.55)'
  g.lineWidth = 2
  g.strokeRect(x + 1, y + 1, w - 2, h - 2)
}

/** Parquet à lames décalées, chêne miel (une tuile = 8 rangs de lames). */
export const parquetTexture = () =>
  make('parquet', 1024, 1024, (g, w, h) => {
    const r = rng(7)
    const rows = 8
    const rh = h / rows
    for (let row = 0; row < rows; row++) {
      let x = -Math.floor(r() * 300)
      while (x < w) {
        const len = 260 + Math.floor(r() * 320)
        const tone: [number, number, number] = r() > 0.5 ? [124, 86, 54] : [112, 77, 47]
        woodStrip(g, x, row * rh, len, rh, tone, r, false)
        x += len
      }
    }
  }, { repeat: [8, 9] })

/** Bois clair générique (étagères, tables). */
export const woodTexture = (tone: 'clair' | 'fonce' = 'clair') =>
  make('wood-' + tone, 512, 512, (g, w, h) => {
    const r = rng(tone === 'clair' ? 3 : 11)
    const base: [number, number, number] = tone === 'clair' ? [176, 128, 82] : [96, 60, 36]
    for (let i = 0; i < 4; i++) woodStrip(g, 0, (i * h) / 4, w, h / 4, base, r, false)
  }, { repeat: [1, 1] })

/** Papier peint damassé vert sapin et or. */
export const wallpaperTexture = (bg = '#173a2b', fg = 'rgba(201,164,92,0.34)') =>
  make('wall-' + bg, 512, 512, (g, w, h) => {
    g.fillStyle = bg
    g.fillRect(0, 0, w, h)
    // fines rayures
    g.fillStyle = 'rgba(255,255,255,0.025)'
    for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 14, h)
    g.strokeStyle = fg
    g.fillStyle = fg
    g.lineWidth = 3
    const motif = (cx: number, cy: number, s: number) => {
      g.save(); g.translate(cx, cy); g.scale(s, s)
      for (let k = 0; k < 4; k++) {
        g.rotate(Math.PI / 2)
        g.beginPath()
        g.moveTo(0, 0)
        g.bezierCurveTo(14, -18, 40, -14, 46, 0)
        g.bezierCurveTo(40, 14, 14, 18, 0, 0)
        g.stroke()
        g.beginPath(); g.arc(56, 0, 4, 0, Math.PI * 2); g.fill()
      }
      g.beginPath(); g.arc(0, 0, 7, 0, Math.PI * 2); g.fill()
      g.restore()
    }
    motif(w / 4, h / 4, 1)
    motif((3 * w) / 4, (3 * h) / 4, 1)
    motif((3 * w) / 4, h / 4, 0.45)
    motif(w / 4, (3 * h) / 4, 0.45)
  }, { repeat: [6, 2] })

/** Tapis rouge bordé d'or. */
export const carpetTexture = () =>
  make('carpet', 256, 1024, (g, w, h) => {
    g.fillStyle = '#5e0f15'
    g.fillRect(0, 0, w, h)
    const r = rng(5)
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = r() > 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,90,90,0.05)'
      g.fillRect(r() * w, r() * h, 2, 2)
    }
    g.fillStyle = '#c9a45c'
    g.fillRect(10, 0, 8, h)
    g.fillRect(w - 18, 0, 8, h)
    g.fillStyle = '#5b0e15'
    g.fillRect(24, 0, 4, h)
    g.fillRect(w - 28, 0, 4, h)
    g.strokeStyle = 'rgba(201,164,92,0.5)'
    g.lineWidth = 3
    for (let y = 60; y < h; y += 128) {
      g.beginPath()
      g.moveTo(w / 2, y - 30); g.lineTo(w / 2 + 30, y); g.lineTo(w / 2, y + 30); g.lineTo(w / 2 - 30, y); g.closePath()
      g.stroke()
    }
  }, { repeat: [1, 3] })

/** Halo doux pour les flocons et les reflets lumineux. */
export const glowTexture = () =>
  make('glow', 64, 64, (g, w) => {
    const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(0.35, 'rgba(255,255,255,0.55)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, w, w)
  })

/** Tricot (pour chaussettes, bonhomme de neige) — utilisé comme carte de relief. */
export const knitTexture = () =>
  make('knit', 128, 128, (g, w, h) => {
    g.fillStyle = '#808080'
    g.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += 16) {
      for (let x = 0; x < w; x += 16) {
        g.fillStyle = '#c8c8c8'
        g.beginPath(); g.ellipse(x + 5, y + 8, 3.5, 7, 0.5, 0, Math.PI * 2); g.fill()
        g.beginPath(); g.ellipse(x + 11, y + 8, 3.5, 7, -0.5, 0, Math.PI * 2); g.fill()
      }
    }
  }, { repeat: [4, 4], srgb: false })

const FONT_SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, serif'
const FONT_SANS = '"Inter", "Helvetica Neue", Arial, sans-serif'

/** Panneau d'allée : numéro, titre et adresse dorés sur fond laqué. */
export const signTexture = (number: string, title: string, address: string, bg: string) =>
  make(`sign-${number}-${document.fonts?.status ?? ''}`, 1024, 384, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h)
    grd.addColorStop(0, bg)
    grd.addColorStop(1, shade(bg, -0.35))
    g.fillStyle = grd
    roundRect(g, 0, 0, w, h, 28)
    g.fill()
    g.strokeStyle = '#c9a45c'
    g.lineWidth = 6
    roundRect(g, 14, 14, w - 28, h - 28, 20)
    g.stroke()
    g.lineWidth = 1.5
    roundRect(g, 26, 26, w - 52, h - 52, 14)
    g.stroke()
    g.fillStyle = '#e8d3a2'
    g.textAlign = 'center'
    g.font = `600 30px ${FONT_SANS}`
    g.letterSpacing = '10px'
    g.fillText(`ALLÉE ${number}`, w / 2, 92)
    g.letterSpacing = '0px'
    g.font = `600 84px ${FONT_SERIF}`
    g.fillStyle = '#fbf3df'
    fitText(g, title, w / 2, 200, w - 120, 84, FONT_SERIF)
    g.fillStyle = '#c9a45c'
    g.fillRect(w / 2 - 60, 236, 120, 3)
    g.font = `italic 500 44px ${FONT_SERIF}`
    g.fillStyle = '#ead9b0'
    fitText(g, address.split('— ')[1] ?? address, w / 2, 310, w - 120, 44, FONT_SERIF, 'italic 500')
  })

/**
 * Étiquette posée devant un produit : nom et gamme.
 * Aucun prix n'y figure, ils changent chez Amazon plusieurs fois par jour.
 */
export const shelfLabelTexture = (name: string, label: string) =>
  make(`tag-${name}-${label}-${document.fonts?.status ?? ''}`, 512, 192, (g, w, h) => {
    g.fillStyle = '#fbf6ea'
    roundRect(g, 4, 4, w - 8, h - 8, 18)
    g.fill()
    g.strokeStyle = '#c9a45c'
    g.lineWidth = 4
    roundRect(g, 12, 12, w - 24, h - 24, 12)
    g.stroke()
    g.textAlign = 'center'
    g.fillStyle = '#2a1d14'
    g.font = `600 40px ${FONT_SERIF}`
    fitText(g, name, w / 2, 78, w - 50, 40, FONT_SERIF)
    g.fillStyle = '#8e1b26'
    g.font = `700 40px ${FONT_SANS}`
    fitText(g, label.toUpperCase(), w / 2, 146, w - 60, 40, FONT_SANS, '700')
  })

/** Texte simple (enseigne d'entrée, panneaux). */
export const textTexture = (text: string, opts: { w?: number; h?: number; color?: string; size?: number; font?: string; bg?: string; italic?: boolean } = {}) => {
  const { w = 1024, h = 256, color = '#f3e2b5', size = 120, font = FONT_SERIF, bg, italic } = opts
  return make(`txt-${text}-${color}-${size}-${bg}-${document.fonts?.status ?? ''}`, w, h, (g) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h) }
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillStyle = color
    g.font = `${italic ? 'italic ' : ''}600 ${size}px ${font}`
    fitText(g, text, w / 2, h / 2, w - 40, size, font, italic ? 'italic 600' : '600')
  })
}

function fitText(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, size: number, font: string, weight = '600') {
  let s = size
  g.font = `${weight} ${s}px ${font}`
  while (g.measureText(text).width > max && s > 12) {
    s -= 2
    g.font = `${weight} ${s}px ${font}`
  }
  g.fillText(text, x, y)
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

export function shade(hex: string, amt: number) {
  const c = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  c.getHSL(hsl)
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amt * hsl.l)))
  return '#' + c.getHexString()
}
