const labels: Record<string, string> = {
  TAB: 'Tab',
  ESC: 'Esc',
  SPACE: 'Espace',
  RET: 'Entrée',
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
  C_MUTE: 'Muet',
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
      return { ...basic, label: keyLabel(args.join(' ')), detail: 'Appui simple' }
    case '&none':
      return { ...basic, label: '—', detail: 'Aucune action sur cette couche' }
    case '&trans':
      return {
        ...basic,
        label: '▽',
        detail: 'Traverse vers la première couche active inférieure qui définit cette touche',
      }
    case '&lt':
      return {
        label: keyLabel(args[1]),
        sub: args[0],
        detail: `Tap : ${keyLabel(args[1])} · Maintien : couche ${args[0]}`,
      }
    case '&mt':
      return {
        label: keyLabel(args[1]),
        sub: keyLabel(args[0]),
        detail: `Tap : ${keyLabel(args[1])} · Maintien : ${keyLabel(args[0])}`,
      }
    case '&mo':
      return { label: args[0], sub: 'maintenir', detail: `Active ${args[0]} pendant le maintien` }
    case '&sl':
      return {
        label: args[0],
        sub: 'une fois',
        detail: `Active ${args[0]} pour la prochaine touche`,
      }
    case '&tog':
      return { label: args[0], sub: 'basculer', detail: `Active / désactive la couche ${args[0]}` }
    case '&to':
      return { label: args[0], sub: 'aller', detail: `Bascule vers ${args[0]}` }
    case '&bt':
      return {
        ...basic,
        label: args[0] === 'BT_SEL' ? `BT ${Number(args[1]) + 1}` : 'BT effacer',
        detail:
          args[0] === 'BT_SEL'
            ? `Profil Bluetooth ${Number(args[1]) + 1}`
            : 'Effacer les associations Bluetooth',
      }
    // Display hints only. The selected key also exposes its actual behavior definition.
    case '&gratab':
      return {
        label: 'Tab',
        sub: '⌥ `',
        detail: 'Tab ; avec Alt gauche ou droit : Alt + accent grave',
      }
    case '&rshiftcap':
      return { label: '⇧', sub: 'mot ×2', detail: 'Shift droit ; double tap : Caps Word' }
    case '&wsp':
      return {
        label: 'Micro',
        sub: 'parler / tap',
        detail: 'TypeWhisper : maintien pour parler, tap pour basculer',
      }
    default:
      return {
        ...basic,
        label: behavior.slice(1),
        detail: 'Comportement personnalisé : consulter sa définition ci-dessous',
      }
  }
}
