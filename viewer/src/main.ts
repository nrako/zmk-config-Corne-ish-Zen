import data from 'virtual:keymap'
import { describe } from './labels'
import './style.css'
import geometryData from './data/geometry.json'
import { activationRoute, modifiedDescription } from './interaction'
const app = document.querySelector<HTMLDivElement>('#app')!
const subtitles = [
  'L’écriture au quotidien',
  'Chiffres & navigation',
  'Symboles & outils',
  'Fonctions & connexions',
  'Pavé numérique',
]
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )
let focused: number | null = null
let selected: { layer: number; pos: number } | null = null
let latchedAlt = false,
  latchedShift = false,
  physicalAlt = false,
  physicalShift = false
const modifiers = () => ({ alt: latchedAlt || physicalAlt, shift: latchedShift || physicalShift })
function display(binding: string) {
  const m = modifiers()
  return modifiedDescription(binding, m.alt, m.shift)
}
const halfOffset = 397
function routeDescription(layer: number) {
  return activationRoute(data.layers, layer)
    .map(step => `${step.mode} ${data.layers[step.to].name} (${step.pos})`)
    .join(' → ')
}
function keyboard(layer: number) {
  const keys = data.layers[layer].keys
  const route = activationRoute(data.layers, layer)
  return `<div class="keyboard-scroll"><svg class="keyboard" viewBox="-3 -3 766 253" aria-label="Clavier ${escape(data.layers[layer].name)}">
 ${geometryData.halves.map((half, i) => `<g transform="translate(${i * halfOffset} 0)"><path class="case" d="${half.outline}"/><rect class="screen" x="${half.screen.x}" y="${half.screen.y}" width="${half.screen.width}" height="${half.screen.height}" rx="${half.screen.rx}"/></g>`).join('')}
 ${keys
   .map((raw, pos) => {
     const inherited = raw === '&trans'
     const binding = inherited ? data.layers[0].keys[pos] : raw
     const d = display(binding)
     const g = geometryData.keys[pos]
     const access = route.find(step => step.pos === pos)
     const sub = access
       ? `${access.mode === 'Maintenir' ? 'tenir' : '↪'} ${data.layers[access.to].name}`
       : d.sub
     const m = modifiers()
     const heldModifier =
       (m.alt && /&kp [LR]ALT$/.test(binding)) ||
       (m.shift && (/&kp [LR]SHFT$/.test(binding) || binding === '&rshiftcap'))
     const active = selected?.layer === layer && selected.pos === pos
     return `<g role="button" tabindex="0" aria-label="${escape(`Position ${pos}, ${d.label}${inherited ? ', transparente' : ''}`)}" data-layer="${layer}" data-pos="${pos}" class="key ${inherited ? 'inherited' : ''} ${raw === '&none' ? 'empty' : ''} ${active ? 'selected' : ''} ${access ? 'activation' : ''} ${access && access.mode !== 'Maintenir' ? 'activation-toggle' : ''} ${heldModifier ? 'modifier-active' : ''} ${d.dead ? 'dead-key' : ''}" transform="translate(${g.x + g.side * halfOffset} ${g.y}) rotate(${g.angle})"><title>${escape(d.detail)}${access ? ` · Accès : ${access.mode}` : ''}</title><rect width="${g.width}" height="${g.height}" rx="${g.rx}"/><text class="legend ${d.label.length > 4 ? 'small' : ''}" x="19.5" y="${g.height / 2 + (sub ? 0 : 5)}" text-anchor="middle">${escape(d.label)}</text>${sub ? `<text class="secondary" x="19.5" y="${g.height / 2 + 12}" text-anchor="middle">${escape(sub)}</text>` : ''}</g>`
   })
   .join('')}</svg></div>`
}
function detail() {
  if (!selected)
    return '<span class="detail-hint">Clique sur une touche pour découvrir son comportement.</span>'
  const { layer, pos } = selected,
    raw = data.layers[layer].keys[pos],
    inherited = raw === '&trans'
  const binding = inherited ? data.layers[0].keys[pos] : raw,
    d = display(binding)
  const combos = data.combos.filter(c => c.layers.includes(layer) && c.positions.includes(pos))
  const behavior = data.behaviors[binding.split(' ')[0].slice(1)]
  return `<button class="close-detail" aria-label="Fermer les détails">×</button><div class="detail-title"><span>${escape(data.layers[layer].name)} / touche ${pos}</span><strong>${escape(d.label)}</strong></div><p>${escape(d.detail)}</p>${inherited ? '<p class="muted">Transparente : légende de base affichée comme repère. Le résultat réel dépend des couches inférieures actives.</p>' : ''}${combos.length ? `<div class="combo-list">${combos.map(c => `<button class="combo" data-combo="${escape(c.name)}">${c.positions.map(p => escape(describe(data.layers[0].keys[p]).label)).join(' + ')} <span>→ ${escape(describe(c.binding).label)}</span></button>`).join('')}</div>` : ''}<details><summary>Définition ZMK</summary><pre>${escape(raw)}${behavior ? '\n\n' + escape(behavior) : ''}</pre></details>`
}
function render() {
  app.innerHTML = `<header><a class="wordmark" href="#" aria-label="Toutes les couches">zen<span> / </span></a><div class="intro"><h1>Les touches, en clair.</h1><p>Corne-ish Zen · ton aide-mémoire</p></div><button id="overview" ${focused === null ? 'hidden' : ''}>Toutes les couches</button></header><nav aria-label="Couches"><button data-focus="all" aria-pressed="${focused === null}">Vue d’ensemble</button>${data.layers.map((l, i) => `<button data-focus="${i}" aria-pressed="${focused === i}">${escape(l.name)}</button>`).join('')}</nav><div class="modifiers" aria-label="Modificateurs"><span>Voir avec</span><button data-mod="alt" aria-pressed="${modifiers().alt}">⌥ Alt</button><button data-mod="shift" aria-pressed="${modifiers().shift}">⇧ Shift</button><span class="modifier-note">ABC macOS · clic ou maintien au clavier</span></div><main class="${focused !== null ? 'focused' : ''}">${data.layers.map((l, i) => (focused !== null && focused !== i ? '' : `<section class="layer"><div class="layer-heading"><div><h2><span>${i}</span>${escape(l.name)}</h2><p>${subtitles[i] ?? ''}</p>${i ? `<p class="route">${escape(routeDescription(i))}</p>` : ''}</div><button class="expand" data-focus="${i}" aria-label="Agrandir ${escape(l.name)}">↗</button></div>${keyboard(i)}</section>`)).join('')}<section class="guide"><h2>Retrouver un geste</h2><p>La légende principale indique l’appui. En dessous, le maintien ou le second geste.</p><div class="legend-guide"><span><i></i>Action de la couche</span><span><i class="dim"></i>Transparente</span><span><i class="red"></i>Accès à la couche</span></div><p class="muted">Rouge : touches d’accès, pointillés : bascule ou activation ponctuelle. Souligné : accent mort. Les touches transparentes montrent QWERTY comme repère, pas une simulation de couches empilées.</p></section></main><aside class="${selected ? 'active' : ''}" aria-live="polite">${detail()}</aside><footer>42 touches. Cinq couches. Un seul Zen.<span>Lecture seule · synchronisé avec la keymap</span></footer>`
  app.querySelectorAll<HTMLButtonElement>('[data-mod]').forEach(
    button =>
      (button.onclick = () => {
        if (button.dataset.mod === 'alt') latchedAlt = !latchedAlt
        else latchedShift = !latchedShift
        const name = button.dataset.mod
        render()
        app.querySelector<HTMLButtonElement>(`[data-mod="${name}"]`)?.focus()
      }),
  )
  app.querySelectorAll<HTMLElement>('[data-focus]').forEach(
    b =>
      (b.onclick = () => {
        focused = b.dataset.focus === 'all' ? null : Number(b.dataset.focus)
        selected = null
        render()
      }),
  )
  const overview = () => {
    focused = null
    selected = null
    render()
  }
  app.querySelector<HTMLButtonElement>('#overview')!.onclick = overview
  app.querySelector<HTMLAnchorElement>('.wordmark')!.onclick = e => {
    e.preventDefault()
    overview()
  }
  app.querySelectorAll<SVGGElement>('.key').forEach(k => {
    const choose = () => {
      selected = { layer: Number(k.dataset.layer), pos: Number(k.dataset.pos) }
      app.querySelector('aside')!.innerHTML = detail()
      app.querySelector('aside')!.classList.add('active')
      app.querySelectorAll('.selected').forEach(x => x.classList.remove('selected'))
      k.classList.add('selected')
      wireCombos()
    }
    k.onclick = choose
    k.onkeydown = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        choose()
      }
    }
  })
  wireCombos()
}
function wireCombos() {
  const close = app.querySelector<HTMLButtonElement>('.close-detail')
  if (close)
    close.onclick = () => {
      selected = null
      app.querySelector('aside')!.classList.remove('active')
      app.querySelector('aside')!.innerHTML = detail()
      app
        .querySelectorAll('.selected,.combo-active')
        .forEach(k => k.classList.remove('selected', 'combo-active'))
    }
  app.querySelectorAll<HTMLElement>('[data-combo]').forEach(b => {
    b.onmouseenter = b.onfocus = () => {
      const c = data.combos.find(c => c.name === b.dataset.combo)!
      app
        .querySelectorAll<HTMLElement>('.key')
        .forEach(k =>
          k.classList.toggle(
            'combo-active',
            Number(k.dataset.layer) === selected?.layer &&
              c.positions.includes(Number(k.dataset.pos)),
          ),
        )
    }
    b.onmouseleave = b.onblur = () =>
      app.querySelectorAll('.combo-active').forEach(k => k.classList.remove('combo-active'))
  })
}
render()

function updatePhysical(event: KeyboardEvent, down: boolean) {
  if (event.key !== 'Alt' && event.key !== 'Shift') return
  const before = JSON.stringify(modifiers())
  if (event.key === 'Alt') physicalAlt = down
  else physicalShift = down
  if (before !== JSON.stringify(modifiers())) render()
}
window.addEventListener('keydown', e => updatePhysical(e, true))
window.addEventListener('keyup', e => updatePhysical(e, false))
function clearPhysical() {
  const changed = physicalAlt || physicalShift
  physicalAlt = false
  physicalShift = false
  if (changed) render()
}
window.addEventListener('blur', clearPhysical)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearPhysical()
})
