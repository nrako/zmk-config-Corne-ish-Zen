import { describe } from './labels'
import abc from './data/abc.json'
export type Layer = { name: string; keys: string[] }
export type Step = { from: number; to: number; pos: number; mode: string }
export function activationRoute(layers: Layer[], target: number): Step[] {
  const queue: { layer: number; path: Step[] }[] = [{ layer: 0, path: [] }],
    seen = new Set([0])
  while (queue.length) {
    const { layer, path } = queue.shift()!
    if (layer === target) return path
    layers[layer].keys.forEach((binding, pos) => {
      const [behavior, name] = binding.split(' ')
      if (!['&mo', '&lt', '&sl', '&tog', '&to'].includes(behavior)) return
      const to = layers.findIndex(l => l.name === name)
      if (to < 0 || seen.has(to)) return
      seen.add(to)
      const mode = ['&mo', '&lt'].includes(behavior)
        ? 'Maintenir'
        : behavior === '&sl'
          ? 'Une fois'
          : 'Basculer'
      queue.push({ layer: to, path: [...path, { from: layer, to, pos, mode }] })
    })
  }
  return []
}
// USB keycode names → macOS virtual key positions for the ABC layout.
const codes: Record<string, number> = {
  A: 0,
  S: 1,
  D: 2,
  F: 3,
  H: 4,
  G: 5,
  Z: 6,
  X: 7,
  C: 8,
  V: 9,
  B: 11,
  Q: 12,
  W: 13,
  E: 14,
  R: 15,
  Y: 16,
  T: 17,
  N1: 18,
  N2: 19,
  N3: 20,
  N4: 21,
  N6: 22,
  N5: 23,
  EQUAL: 24,
  N9: 25,
  N7: 26,
  MINUS: 27,
  N8: 28,
  N0: 29,
  RBKT: 30,
  O: 31,
  U: 32,
  LBKT: 33,
  I: 34,
  P: 35,
  L: 37,
  J: 38,
  SQT: 39,
  K: 40,
  SEMI: 41,
  BSLH: 42,
  COMMA: 43,
  FSLH: 44,
  N: 45,
  M: 46,
  DOT: 47,
  GRAVE: 50,
}
const shifted: Record<string, string> = {
  EXCL: 'N1',
  AT: 'N2',
  HASH: 'N3',
  DLLR: 'N4',
  PRCNT: 'N5',
  CARET: 'N6',
  AMPS: 'N7',
  ASTRK: 'N8',
  LPAR: 'N9',
  RPAR: 'N0',
  UNDER: 'MINUS',
  PLUS: 'EQUAL',
  LBRC: 'LBKT',
  RBRC: 'RBKT',
  PIPE: 'BSLH',
  COLON: 'SEMI',
  DQT: 'SQT',
  LT: 'COMMA',
  GT: 'DOT',
  QMARK: 'FSLH',
  TILDE: 'GRAVE',
}
export function modifiedDescription(binding: string, alt: boolean, shift: boolean) {
  const original = describe(binding)
  if (!alt && !shift) return { ...original, dead: false }
  let code = ''
  if (binding === '&gratab') code = alt ? 'GRAVE' : ''
  else if (binding.startsWith('&kp ')) code = binding.slice(4)
  else if (/^&(lt|mt) /.test(binding)) code = binding.split(' ')[2]
  let intrinsicShift = false
  if (/^LS\([^()]+\)$/.test(code)) {
    code = code.slice(3, -1)
    intrinsicShift = true
  }
  if (shifted[code]) {
    code = shifted[code]
    intrinsicShift = true
  }
  const key = codes[code]
  if (key === undefined) return { ...original, dead: false }
  const entry = (abc.keys as Record<string, { text: string; dead: boolean }[]>)[String(key)][
    (alt ? 2 : 0) + (shift || intrinsicShift ? 1 : 0)
  ]
  return {
    ...original,
    label: entry.text,
    dead: entry.dead,
    detail: entry.dead
      ? `${original.detail} · Accent mort : attend le caractère suivant`
      : original.detail,
  }
}
