import data from 'virtual:keymap'
import { describe, comboDescription } from './labels'
import './style.css'
import { simulationAction } from './simulation'
import geometryData from './data/geometry.json'
import { activationRoute, modifiedDescription } from './interaction'
const app = document.querySelector<HTMLDivElement>('#app')!
const subtitles = [
  'Everyday typing',
  'Numbers & navigation',
  'Symbols & tools',
  'Functions & connections',
  'Number pad',
]
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )
let focused: number | null = null
let lastAction = 'Click a key to try it. Hold a tap/hold key for its alternate action.'
let hoverTimer: ReturnType<typeof setTimeout> | undefined
function hideDetails(){ selected=null; const panel=app.querySelector('aside');panel?.classList.remove('active');if(panel)panel.innerHTML=detail();app.querySelectorAll('.selected,.combo-active').forEach(k=>k.classList.remove('selected','combo-active')) }
function scheduleHide(){clearTimeout(hoverTimer);hoverTimer=setTimeout(hideDetails,220)}
function simulate(binding:string,hold=false){
 const action=simulationAction(binding,hold)
 selected=null
 if(action.kind==='modifier'){latched[action.modifier]=!latched[action.modifier];lastAction='Modifier '+action.modifier+(latched[action.modifier]?' enabled':' released')}
 else if(action.kind==='layer'){const layer=data.layers.findIndex(l=>l.name===action.name);if(layer>=0){focused=focused===layer?0:layer;lastAction='Layer preview: '+data.layers[focused].name}}
 else if(action.kind==='output'){lastAction='Simulated output: '+display(action.binding).label}
 else lastAction='No action'
 render()
}
let selected: { layer: number; pos: number } | null = null
type Modifier = 'alt' | 'shift' | 'ctrl' | 'cmd'
const latched: Record<Modifier, boolean> = {alt:false,shift:false,ctrl:false,cmd:false}
const physical: Record<Modifier, boolean> = {alt:false,shift:false,ctrl:false,cmd:false}
const modifiers = () => ({alt:latched.alt||physical.alt,shift:latched.shift||physical.shift,ctrl:latched.ctrl||physical.ctrl,cmd:latched.cmd||physical.cmd})
function display(binding: string) {
  const m = modifiers()
  return modifiedDescription(binding, m.alt, m.shift, m.ctrl, m.cmd)
}
const halfOffset = 397
function routeDescription(layer: number) {
  return activationRoute(data.layers, layer)
    .map(step => `${step.mode} ${data.layers[step.to].name} (${step.pos})`)
    .join(' → ')
}
function screenContent(layer: number, side: number) {
  const screen = geometryData.halves[side].screen
  const cx = Number(screen.x) + Number(screen.width) / 2
  const y = Number(screen.y)
  return `<g class="screen-content" aria-hidden="true">
    ${side === 0 ? `<text class="screen-layer" x="${cx}" y="${y + 44}" text-anchor="middle">${escape(data.layers[layer].name)}</text>` : ''}
    <svg x="${cx - 9}" y="${y + 9}" width="18" height="18" viewBox="0 0 256 256">
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16">
        <polygon points="128 32 192 80 128 128 128 32"/>
        <polygon points="128 128 192 176 128 224 128 128"/>
        <line x1="64" y1="80" x2="128" y2="128"/>
        <line x1="64" y1="176" x2="128" y2="128"/>
      </g>
      <circle cx="60" cy="128" r="12" fill="currentColor"/>
      <circle cx="204" cy="128" r="12" fill="currentColor"/>
    </svg>
  </g>`
}
function keyboard(layer: number) {
  const keys = data.layers[layer].keys
  const route = activationRoute(data.layers, layer)
  return `<div class="keyboard-scroll"><svg class="keyboard" viewBox="-3 -3 766 253" aria-label="Keyboard ${escape(data.layers[layer].name)}">
 ${geometryData.halves.map((half, i) => `<g transform="translate(${i * halfOffset} 0)"><path class="case" d="${half.outline}"/><rect class="screen" x="${half.screen.x}" y="${half.screen.y}" width="${half.screen.width}" height="${half.screen.height}" rx="${half.screen.rx}"/>${screenContent(layer, i)}</g>`).join('')}
 ${keys
   .map((raw, pos) => {
     const inherited = raw === '&trans'
     const binding = inherited ? data.layers[0].keys[pos] : raw
     const d = display(binding)
     const g = geometryData.keys[pos]
     const access = route.find(step => step.pos === pos)
     const sub = access
       ? `${access.mode === 'Hold' ? 'hold' : '↪'} ${data.layers[access.to].name}`
       : d.sub
     const m = modifiers()
     const heldModifier =
       (m.ctrl && /&kp [LR]CTRL$/.test(binding)) ||
       (m.cmd && /&kp [LR]GUI$/.test(binding)) ||
       (m.alt && /&kp [LR]ALT$/.test(binding)) ||
       (m.shift && (/&kp [LR]SHFT$/.test(binding) || binding === '&rshiftcap'))
     const active = selected?.layer === layer && selected.pos === pos
     return `<g role="button" tabindex="0" aria-label="${escape(`Position ${pos}, ${d.label}${inherited ? ', transparent' : ''}`)}" data-layer="${layer}" data-pos="${pos}" class="key ${inherited ? 'inherited' : ''} ${raw === '&none' ? 'empty' : ''} ${active ? 'selected' : ''} ${access ? 'activation' : ''} ${access && access.mode !== 'Hold' ? 'activation-toggle' : ''} ${heldModifier ? 'modifier-active' : ''} ${d.dead ? 'dead-key' : ''}" transform="translate(${g.x + g.side * halfOffset} ${g.y}) rotate(${g.angle})"><title>${escape(d.detail)}${access ? ` · Access: ${access.mode}` : ''}</title><rect width="${g.width}" height="${g.height}" rx="${g.rx}"/><text class="legend ${d.label.length > 4 ? 'small' : ''}" x="19.5" y="${g.height / 2 + (sub ? 0 : 5)}" text-anchor="middle">${escape(d.label)}</text>${sub ? `<text class="secondary" x="19.5" y="${g.height / 2 + 12}" text-anchor="middle">${escape(sub)}</text>` : ''}</g>`
   })
   .join('')}</svg></div>`
}
function comboLegend(layer: number, pos?: number, compact = false) {
  const combos = data.combos.filter(c => c.layers.includes(layer) && (pos === undefined || c.positions.includes(pos)))
  if (!combos.length) return pos === undefined ? '<div class="layer-combos"><p class="muted">No combos on this layer.</p></div>' : ''
  return `<div class="layer-combos ${compact ? 'combo-reminder' : ''}"><h3>${compact ? 'Shortcuts to remember' : 'Combos'}${pos === undefined ? '' : ' using this key'}</h3><p>Press the keys together to trigger the action. Hover over a combo to highlight its keys. ${compact ? '' : 'The timeout is the maximum time between key presses.'}</p><div class="combo-list">${combos.map(c => `<button class="combo" data-combo="${escape(c.name)}" data-combo-layer="${layer}">${c.positions.map(p => {
    const raw = data.layers[layer].keys[p]
    return `<kbd>${escape(describe(raw === '&trans' ? data.layers[0].keys[p] : raw).label)}</kbd>`
  }).join(' + ')} <span>→ ${escape(describe(c.binding).label)}</span>${compact ? '' : `<small> · ${c.timeout} ms</small>`}<span class="combo-description">${escape(comboDescription(c.binding))}</span></button>`).join('')}</div></div>`
}
function detail() {
  if (!selected)
    return '<span class="detail-hint">Hover over a key to explore its behavior.</span>'
  const { layer, pos } = selected,
    raw = data.layers[layer].keys[pos],
    inherited = raw === '&trans'
  const binding = inherited ? data.layers[0].keys[pos] : raw,
    d = display(binding)
  const behavior = data.behaviors[binding.split(' ')[0].slice(1)]
  return `<button class="close-detail" aria-label="Close details">×</button><div class="detail-title"><span>${escape(data.layers[layer].name)} / key ${pos}</span><strong>${escape(d.label)}</strong></div><p>${escape(d.detail)}</p>${inherited ? '<p class="muted">Transparent: the base legend is shown as a reference. Actual output depends on the active layers below.</p>' : ''}${comboLegend(layer, pos)}<section class="zmk-definition"><h3>ZMK definition</h3><pre>${escape(raw)}${behavior ? '\n\n' + escape(behavior) : ''}</pre></section>`
}
function render() {
  app.innerHTML = `<header><a class="wordmark" href="#" aria-label="All layers">zen<span> / </span></a><div class="intro"><h1>Every key, explained.</h1><p>Corne-ish Zen · your keyboard reference</p></div><button id="overview" ${focused === null ? 'hidden' : ''}>All layers</button></header><nav aria-label="Layers"><button data-focus="all" aria-pressed="${focused === null}">Overview</button>${data.layers.map((l, i) => `<button data-focus="${i}" aria-pressed="${focused === i}">${escape(l.name)}</button>`).join('')}</nav><div class="modifiers" aria-label="Modifiers"><span>Preview with</span><button data-mod="alt" aria-pressed="${modifiers().alt}">⌥ Alt</button><button data-mod="shift" aria-pressed="${modifiers().shift}">⇧ Shift</button><button data-mod="ctrl" aria-pressed="${modifiers().ctrl}">⌃ Ctrl</button><button data-mod="cmd" aria-pressed="${modifiers().cmd}">⌘ Cmd</button><span class="modifier-note">macOS ABC · click or hold on your keyboard</span></div><div class="simulation-status" role="status">${escape(lastAction)}</div><main class="${focused !== null ? 'focused' : ''}">${data.layers.map((l, i) => (focused !== null && focused !== i ? '' : `<section class="layer"><div class="layer-heading"><div><h2><span>${i}</span>${escape(l.name)}</h2><p>${subtitles[i] ?? ''}</p><p class="route">${escape(routeDescription(i)) || '&nbsp;'}</p></div><button class="expand" data-focus="${i}" aria-label="Expand ${escape(l.name)}">↗</button></div>${keyboard(i)}${focused !== null ? comboLegend(i) : ''}</section>`)).join('')}<section class="guide">${focused === null ? comboLegend(0, undefined, true) : ''}<h2>Reading the layout</h2><p>The main legend shows the tap action. Below it is the hold or alternate action.</p><div class="legend-guide"><span><i></i>Layer action</span><span><i class="dim"></i>Transparent</span><span><i class="red"></i>Layer access</span></div><p class="muted">Red: layer access keys. Dashed: toggle or one-shot activation. Underlined: dead key. Transparent keys show QWERTY as a reference, without simulating the layer stack.</p></section></main><aside class="${selected ? 'active' : ''}" aria-live="polite">${detail()}</aside><footer>42 keys. Five layers. One Zen.<span>Read-only · synced with the keymap</span></footer>`
  app.querySelectorAll<HTMLButtonElement>('[data-mod]').forEach(
    button =>
      (button.onclick = () => {
        const modifier=button.dataset.mod as Modifier
        latched[modifier]=!latched[modifier]
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
    const layer=Number(k.dataset.layer),pos=Number(k.dataset.pos)
    const raw=data.layers[layer].keys[pos]
    const binding=raw==='&trans'?data.layers[0].keys[pos]:raw
    const inspect=()=>{clearTimeout(hoverTimer);selected={layer,pos};app.querySelector('aside')!.innerHTML=detail();app.querySelector('aside')!.classList.add('active');app.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));k.classList.add('selected');wireCombos()}
    k.onmouseenter=inspect;k.onmouseleave=scheduleHide;k.onfocus=inspect;k.onblur=scheduleHide
    let holdTimer:ReturnType<typeof setTimeout>|undefined,held=false
    k.onpointerdown=e=>{if(e.button!==0)return;held=false;if(/^&(lt|mt) /.test(binding)){
      holdTimer=setTimeout(()=>{held=true;simulate(binding,true)},200)
      window.addEventListener('pointerup',()=>clearTimeout(holdTimer),{once:true})
      window.addEventListener('pointercancel',()=>clearTimeout(holdTimer),{once:true})
    }}
    k.onclick=()=>{clearTimeout(holdTimer);if(!held)simulate(binding)}
    k.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();simulate(binding)}}
  })
  const panel=app.querySelector<HTMLElement>('aside')!
  panel.onmouseenter=()=>clearTimeout(hoverTimer);panel.onmouseleave=scheduleHide
  panel.addEventListener('focusin',()=>clearTimeout(hoverTimer));panel.addEventListener('focusout',scheduleHide)
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
            Number(k.dataset.layer) === Number(b.dataset.comboLayer) &&
              c.positions.includes(Number(k.dataset.pos)),
          ),
        )
    }
    b.onmouseleave = b.onblur = () =>
      app.querySelectorAll('.combo-active').forEach(k => k.classList.remove('combo-active'))
  })
}
render()

function updatePhysical(event: KeyboardEvent) {
  const before=JSON.stringify(modifiers())
  physical.alt=event.altKey
  physical.shift=event.shiftKey
  physical.ctrl=event.ctrlKey
  physical.cmd=event.metaKey
  if(before!==JSON.stringify(modifiers()))render()
}
window.addEventListener('keydown',updatePhysical)
window.addEventListener('keyup',updatePhysical)
function clearPhysical() {
  const changed=Object.values(physical).some(Boolean)
  for(const key of Object.keys(physical) as Modifier[])physical[key]=false
  if(changed)render()
}
window.addEventListener('blur',clearPhysical)
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearPhysical()})
