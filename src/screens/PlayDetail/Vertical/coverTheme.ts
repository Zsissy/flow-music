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

export interface CoverTheme {
  top: string
  middle: string
  bottom: string
  accent: string
}

const fallbackTheme: CoverTheme = {
  top: '#f7eee8',
  middle: '#f4efea',
  bottom: '#f8f6f6',
  accent: '#ec5b13',
}

export const getCoverTheme = (seed?: string | null): CoverTheme => {
  if (!seed) return fallbackTheme
  const hash = hashString(seed)
  const hue = hash % 360
  const hueShift = (hash >> 8) % 42

  return {
    top: hslToHex(hue, 42, 88),
    middle: hslToHex(hue + 16 + hueShift, 32, 84),
    bottom: hslToHex(hue + 30 + hueShift, 24, 80),
    accent: hslToHex(hue + 198, 58, 50),
  }
}
