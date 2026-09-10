import data from 'virtual:keymap'
import { describe } from './labels'
import './style.css'
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
function geometry(pos: number) {
  if (pos < 36) {
    const row = Math.floor(pos / 12),
      col = pos % 12
    const right = col >= 6
    const c = right ? 11 - col : col
    return {
      x: right ? 770 - c * 52 : 18 + c * 52,
      y: 36 + row * 53 + [22, 15, 0, -7, 0, 9][c],
      angle: 0,
    }
  }
  return [
    { x: 183, y: 210, angle: 0 },
    { x: 242, y: 219, angle: 15 },
    { x: 301, y: 240, angle: 30 },
    { x: 487, y: 240, angle: -30 },
    { x: 546, y: 219, angle: -15 },
    { x: 605, y: 210, angle: 0 },
  ][pos - 36]
}
function keyboard(layer: number) {
  const keys = data.layers[layer].keys
  return `<div class="keyboard-scroll"><svg class="keyboard" viewBox="0 0 836 330" aria-label="Clavier ${escape(data.layers[layer].name)}">
 <path class="case" d="M8 54H120V22H175V12H234V22H390V235L350 312L216 274L167 266L133 213H8Z"/>
 <path class="case" transform="translate(836 0) scale(-1 1)" d="M8 54H120V22H175V12H234V22H390V235L350 312L216 274L167 266L133 213H8Z"/>
 <rect class="screen" x="334" y="54" width="35" height="90" rx="3"/><rect class="screen" x="467" y="54" width="35" height="90" rx="3"/>
 ${keys
   .map((raw, pos) => {
     const inherited = raw === '&trans'
     const binding = inherited ? data.layers[0].keys[pos] : raw
     const d = describe(binding)
     const g = geometry(pos)
     const active = selected?.layer === layer && selected.pos === pos
     return `<g role="button" tabindex="0" aria-label="${escape(`Position ${pos}, ${d.label}${inherited ? ', transparente' : ''}`)}" data-layer="${layer}" data-pos="${pos}" class="key ${inherited ? 'inherited' : ''} ${raw === '&none' ? 'empty' : ''} ${active ? 'selected' : ''}" transform="translate(${g.x} ${g.y}) rotate(${g.angle} 23 23)"><title>${escape(d.detail)}</title><rect width="46" height="46" rx="9"/><text class="legend ${d.label.length > 4 ? 'small' : ''}" x="23" y="${d.sub ? 22 : 28}" text-anchor="middle">${escape(d.label)}</text>${d.sub ? `<text class="secondary" x="23" y="36" text-anchor="middle">${escape(d.sub)}</text>` : ''}</g>`
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
    d = describe(binding)
  const combos = data.combos.filter(c => c.layers.includes(layer) && c.positions.includes(pos))
  const behavior = data.behaviors[binding.split(' ')[0].slice(1)]
  return `<button class="close-detail" aria-label="Fermer les détails">×</button><div class="detail-title"><span>${escape(data.layers[layer].name)} / touche ${pos}</span><strong>${escape(d.label)}</strong></div><p>${escape(d.detail)}</p>${inherited ? '<p class="muted">Transparente : légende de base affichée comme repère. Le résultat réel dépend des couches inférieures actives.</p>' : ''}${combos.length ? `<div class="combo-list">${combos.map(c => `<button class="combo" data-combo="${escape(c.name)}">${c.positions.map(p => escape(describe(data.layers[0].keys[p]).label)).join(' + ')} <span>→ ${escape(describe(c.binding).label)}</span></button>`).join('')}</div>` : ''}<details><summary>Définition ZMK</summary><pre>${escape(raw)}${behavior ? '\n\n' + escape(behavior) : ''}</pre></details>`
}
function render() {
  app.innerHTML = `<header><a class="wordmark" href="#" aria-label="Toutes les couches">zen<span> / </span></a><div class="intro"><h1>Les touches, en clair.</h1><p>Corne-ish Zen · ton aide-mémoire</p></div><button id="overview" ${focused === null ? 'hidden' : ''}>Toutes les couches</button></header><nav aria-label="Couches"><button data-focus="all" aria-pressed="${focused === null}">Vue d’ensemble</button>${data.layers.map((l, i) => `<button data-focus="${i}" aria-pressed="${focused === i}">${escape(l.name)}</button>`).join('')}</nav><main class="${focused !== null ? 'focused' : ''}">${data.layers.map((l, i) => (focused !== null && focused !== i ? '' : `<section class="layer"><div class="layer-heading"><div><h2><span>${i}</span>${escape(l.name)}</h2><p>${subtitles[i] ?? ''}</p></div><button class="expand" data-focus="${i}" aria-label="Agrandir ${escape(l.name)}">↗</button></div>${keyboard(i)}</section>`)).join('')}<section class="guide"><h2>Retrouver un geste</h2><p>La légende principale indique l’appui. En dessous, le maintien ou le second geste.</p><div class="legend-guide"><span><i></i>Action de la couche</span><span><i class="dim"></i>Transparente</span></div><p class="muted">Les couches sont présentées séparément, avec QWERTY comme repère pour les touches transparentes.</p></section></main><aside aria-live="polite">${detail()}</aside><footer>42 touches. Cinq couches. Un seul Zen.<span>Lecture seule · synchronisé avec la keymap</span></footer>`
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
