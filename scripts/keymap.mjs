// Deliberately scoped to this repository's devicetree keymap, not a C compiler.
export function parseKeymap(source) {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  const defines = new Map(
    [...clean.matchAll(/^#define\s+(\w+)\s+([^\n]+)/gm)].map(m => [m[1], m[2].trim()]),
  )
  const number = value => {
    const n = Number(defines.get(value) ?? value)
    if (!Number.isInteger(n)) throw new Error(`Unknown layer: ${value}`)
    return n
  }
  const bindings = value => {
    value = value.replace(/\b[A-Z][A-Z_]+\b/g, token =>
      defines.get(token)?.startsWith('&') ? defines.get(token) : token,
    )
    if (!value.trim().startsWith('&')) throw new Error(`Unsupported binding expression: ${value}`)
    return value
      .split(/(?=&)/)
      .map(x => x.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
  }
  const layers = [...clean.matchAll(/(\w+_layer)\s*\{([^{}]*?)\};/g)].map(m => {
    const content = m[2]
    const match = content.match(/bindings\s*=\s*<([^;]+)>\s*;/)
    if (!match) throw new Error(`Missing bindings: ${m[1]}`)
    const keys = bindings(match[1])
    if (keys.length !== 42) throw new Error(`${m[1]}: expected 42 keys, got ${keys.length}`)
    return { name: content.match(/(?:display-name|label)\s*=\s*"([^"]+)"/)?.[1] ?? m[1], keys }
  })
  if (!layers.length) throw new Error('No layers found')
  const behaviors = Object.fromEntries(
    [...clean.matchAll(/(\w+):\s*\w+\s*\{([^{}]*?)\};/g)].map(m => [m[1], m[2].trim()]),
  )
  const combos = [...clean.matchAll(/(combo[\w.]*)\s*\{([^{}]*?)\};/g)].map(m => {
    const field = name => m[2].match(new RegExp(`${name}\\s*=\\s*<([^>]+)>`))?.[1].trim()
    const positions = field('key-positions')?.split(/\s+/).map(Number)
    if (!positions?.length || positions.some(p => !Number.isInteger(p) || p < 0 || p > 41))
      throw new Error(`Invalid combo ${m[1]}`)
    return {
      name: m[1],
      positions,
      binding: field('bindings'),
      layers: field('layers')?.split(/\s+/).map(number) ?? layers.map((_, i) => i),
      timeout: Number(field('timeout-ms')),
    }
  })
  for (const layer of layers)
    for (const key of layer.keys) {
      const behavior = key.match(/^&(\w+)/)?.[1]
      if (
        !['kp', 'trans', 'none', 'lt', 'mt', 'mo', 'sl', 'tog', 'to', 'bt'].includes(behavior) &&
        !behaviors[behavior]
      )
        throw new Error(`Unknown behavior: ${key}`)
    }
  return { layers, combos, behaviors }
}
