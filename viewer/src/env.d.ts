declare module 'virtual:keymap' {
  const value: {
    layers: { name: string; keys: string[] }[]
    combos: {
      name: string
      positions: number[]
      binding: string
      layers: number[]
      timeout: number
    }[]
    behaviors: Record<string, string>
  }
  export default value
}
