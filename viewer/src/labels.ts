const labels: Record<string, string> = {
  TAB: 'Tab',
  ESC: 'Esc',
  SPACE: 'Space',
  RET: 'Enter',
  BSPC: '⌫',
  LCTRL: '⌃',
  RCTRL: '⌃',
  LGUI: '⌘',
  RGUI: '⌘',
  LALT: '⌥',
  RALT: '⌥',
  LSHFT: '⇧',
  RSHFT: '⇧',
  CAPS: '⇪',
  SEMI: ';',
  SQT: "'",
  COMMA: ',',
  DOT: '.',
  FSLH: '/',
  GRAVE: '`',
  EXCL: '!',
  AT: '@',
  HASH: '#',
  DLLR: '$',
  PRCNT: '%',
  CARET: '^',
  AMPS: '&',
  KP_MULTIPLY: '×',
  LPAR: '(',
  RPAR: ')',
  MINUS: '−',
  EQUAL: '=',
  LBKT: '[',
  RBKT: ']',
  BSLH: '\\',
  PIPE: '|',
  UNDER: '_',
  PLUS: '+',
  LBRC: '{',
  RBRC: '}',
  TILDE: '~',
  LEFT: '←',
  RIGHT: '→',
  UP: '↑',
  DOWN: '↓',
  HOME: 'Home',
  END: 'End',
  C_PREV: '⏮',
  C_PP: '⏯',
  C_FF: '⏭',
  C_VOL_DN: 'Vol −',
  C_VOL_UP: 'Vol +',
  C_MUTE: 'Mute',
  C_BRI_DN: '☀ −',
  C_BRI_UP: '☀ +',
}
export function keyLabel(code: string): string {
  if (labels[code]) return labels[code]
  if (/^N\d$/.test(code)) return code.slice(1)
  const m = code.match(/^(LC|LS|LA|LG|RC|RS|RA|RG|HYPER)\((.*)\)$/)
  if (m)
    return (
      ({ LC: '⌃', LS: '⇧', LA: '⌥', LG: '⌘', RC: '⌃', RS: '⇧', RA: '⌥', RG: '⌘', HYPER: 'Hyper ' }[
        m[1]
      ] ?? '') + keyLabel(m[2])
    )
  return code
}
export function describe(binding: string) {
  const [behavior, ...args] = binding.split(' ')
  const basic = { label: '', sub: '', detail: '' }
  switch (behavior) {
    case '&kp':
      return { ...basic, label: keyLabel(args.join(' ')), detail: 'Tap' }
    case '&none':
      return { ...basic, label: '—', detail: 'No action on this layer' }
    case '&trans':
      return {
        ...basic,
        label: '▽',
        detail: 'Falls through to the first active lower layer that defines this key',
      }
    case '&lt':
      return {
        label: keyLabel(args[1]),
        sub: args[0],
        detail: `Tap: ${keyLabel(args[1])} · Hold: layer ${args[0]}`,
      }
    case '&mt':
      return {
        label: keyLabel(args[1]),
        sub: keyLabel(args[0]),
        detail: `Tap: ${keyLabel(args[1])} · Hold: ${keyLabel(args[0])}`,
      }
    case '&mo':
      return { label: args[0], sub: 'hold', detail: `Activates ${args[0]} while held` }
    case '&sl':
      return {
        label: args[0],
        sub: 'once',
        detail: `Activates ${args[0]} for the next key`,
      }
    case '&tog':
      return { label: args[0], sub: 'toggle', detail: `Toggles layer ${args[0]}` }
    case '&to':
      return { label: args[0], sub: 'switch', detail: `Switches to ${args[0]}` }
    case '&bt':
      return {
        ...basic,
        label: args[0] === 'BT_SEL' ? `BT ${Number(args[1]) + 1}` : 'BT clear',
        detail:
          args[0] === 'BT_SEL'
            ? `Bluetooth profile ${Number(args[1]) + 1}`
            : 'Clear Bluetooth pairings',
      }
    // Display hints only. The selected key also exposes its actual behavior definition.
    case '&gratab':
      return {
        label: 'Tab',
        sub: '⌥ `',
        detail: 'Tab; with left or right Alt: Alt + grave accent',
      }
    case '&rshiftcap':
      return { label: '⇧', sub: 'word ×2', detail: 'Right Shift; double tap: Caps Word' }
    case '&wsp':
      return {
        label: 'Mic',
        sub: 'hold / tap',
        detail: 'TypeWhisper: hold to talk, tap to toggle',
      }
    default:
      return {
        ...basic,
        label: behavior.slice(1),
        detail: 'Custom behavior: see its definition below',
      }
  }
}
