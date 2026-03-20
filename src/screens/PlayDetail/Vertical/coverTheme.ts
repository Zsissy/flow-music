const clamp = (num: number, min: number, max: number) => {
  if (num < min) return min
  if (num > max) return max
  return num
}

const hashString = (input: string) => {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

const hslToHex = (h: number, s: number, l: number) => {
  const hue = ((h % 360) + 360) % 360
  const sat = clamp(s, 0, 100) / 100
  const light = clamp(l, 0, 100) / 100

  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1))
  const m = light - c / 2

  let r = 0
  let g = 0
  let b = 0
  if (hue < 60) [r, g, b] = [c, x, 0]
  else if (hue < 120) [r, g, b] = [x, c, 0]
  else if (hue < 180) [r, g, b] = [0, c, x]
  else if (hue < 240) [r, g, b] = [0, x, c]
  else if (hue < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const toHex = (val: number) => Math.round((val + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '')
  const expanded = value.length === 3
    ? value.split('').map(ch => ch + ch).join('')
    : value
  const safe = expanded.padStart(6, '0').slice(0, 6)
  return {
    r: parseInt(safe.slice(0, 2), 16),
    g: parseInt(safe.slice(2, 4), 16),
    b: parseInt(safe.slice(4, 6), 16),
  }
}

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (num: number) => clamp(Math.round(num), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const mixHex = (from: string, to: string, t: number) => {
  const p = clamp(t, 0, 1)
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  return rgbToHex(
    a.r + (b.r - a.r) * p,
    a.g + (b.g - a.g) * p,
    a.b + (b.b - a.b) * p,
  )
}

const easeInOut = (num: number) => {
  const p = clamp(num, 0, 1)
  return p < 0.5
    ? 2 * p * p
    : 1 - Math.pow(-2 * p + 2, 2) / 2
}

export interface CoverTheme {
  top: string
  middle: string
  glow: string
  bottom: string
  accent: string
}

const fallbackTheme: CoverTheme = {
  top: '#f6e6de',
  middle: '#f8eee7',
  glow: '#fbf6f2',
  bottom: '#ffffff',
  accent: '#cf5f35',
}

export const getCoverTheme = (seed?: string | null): CoverTheme => {
  if (!seed) return fallbackTheme
  const hash = hashString(seed)
  const hue = hash % 360
  const hueShift = (hash >> 8) % 16
  const sat = 36 + ((hash >> 6) % 24)
  const topLight = 84 + ((hash >> 12) % 5)
  const middleLight = 90 + ((hash >> 16) % 4)
  const glowSat = 16 + ((hash >> 20) % 8)

  return {
    top: hslToHex(hue, sat, topLight),
    middle: hslToHex(hue + 6 + hueShift, Math.max(24, sat - 10), middleLight),
    glow: hslToHex(hue + 12 + hueShift, glowSat, 96),
    bottom: '#ffffff',
    accent: hslToHex(hue + 8 + hueShift, 64, 45),
  }
}

export const createLinearGradientColors = (theme: CoverTheme, steps = 72) => {
  const total = Math.max(2, steps)
  return Array.from({ length: total }, (_, index) => {
    const t = index / (total - 1)
    if (t < 0.46) {
      return mixHex(theme.top, theme.middle, easeInOut(t / 0.46))
    }
    if (t < 0.78) {
      return mixHex(theme.middle, theme.glow, easeInOut((t - 0.46) / 0.32))
    }
    return mixHex(theme.glow, theme.bottom, easeInOut((t - 0.78) / 0.22))
  })
}
