import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'
import { parseKeymap } from './keymap.mjs'
const require = createRequire(import.meta.url)
function loadTS(name) {
  const path = new URL(`../viewer/src/${name}.ts`, import.meta.url)
  const output = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(output, {
    module,
    exports: module.exports,
    require: p => (p === './labels' ? loadTS('labels') : require(`../viewer/src/${p}`)),
  })
  return module.exports
}
const { modifiedDescription, activationRoute } = loadTS('interaction')
const data = parseKeymap(
  readFileSync(new URL('../config/corneish_zen.keymap', import.meta.url), 'utf8'),
)
test('ABC modifiers and dead keys', () => {
  assert.equal(modifiedDescription('&kp A', false, true).label, 'A')
  assert.equal(modifiedDescription('&kp A', true, false).label, 'å')
  assert.equal(modifiedDescription('&kp A', true, true).label, 'Å')
  assert.equal(modifiedDescription('&kp E', true, false).dead, true)
  assert.equal(modifiedDescription('&kp E', true, true).dead, false)
  assert.equal(modifiedDescription('&kp EXCL', true, false).label, '⁄')
  assert.equal(modifiedDescription('&kp LG(BSPC)', true, false).label, '⌘⌫')
  assert.equal(modifiedDescription('&gratab', true, false).label, '`')
})
test('layer access is derived from bindings, not fixed positions', () => {
  const path = n => JSON.parse(JSON.stringify(activationRoute(data.layers, n)))
  assert.deepEqual(
    path(1).map(s => s.pos),
    [40],
  )
  assert.deepEqual(
    path(2).map(s => s.pos),
    [38],
  )
  assert.deepEqual(
    path(3).map(s => [s.pos, s.mode]),
    [
      [40, 'Hold'],
      [25, 'One-shot'],
    ],
  )
  assert.deepEqual(
    path(4).map(s => [s.pos, s.mode]),
    [
      [40, 'Hold'],
      [26, 'Toggle'],
    ],
  )
  const changed = structuredClone(data.layers)
  changed[0].keys[39] = '&mo NUM'
  changed[0].keys[40] = '&none'
  assert.equal(activationRoute(changed, 1)[0].pos, 39)
})
test('exported geometry has exact source key sizes and thumb angles', () => {
  const geometry = require('../viewer/src/data/geometry.json')
  assert.equal(geometry.keys.length, 42)
  assert.equal(geometry.keys[38].height, 59)
  assert.equal(geometry.keys[39].height, 59)
  assert.equal(geometry.keys[38].angle, 30)
  assert.equal(geometry.keys[39].angle, -30)
  assert.ok(geometry.halves.every(h => h.outline.includes('C')))
})

test('Ctrl and Command preview shortcuts without composing Option characters', () => {
  assert.equal(modifiedDescription('&kp A', false, false, true).label, '⌃A')
  assert.equal(modifiedDescription('&kp A', true, true, false, true).label, '⌥⇧⌘A')
  assert.equal(modifiedDescription('&kp LG(BSPC)', false, false, false, true).label, '⌘⌫')
  assert.equal(modifiedDescription('&gratab', true, false, false, true).label, '⌥⌘`')
  assert.equal(modifiedDescription('&kp LGUI', false, false, false, true).label, '⌘')
  assert.equal(modifiedDescription('&mo NUM', false, false, true, true).label, 'NUM')
  assert.equal(modifiedDescription('&kp E', true, false, true).dead, false)
})

const {simulationAction}=loadTS('simulation')
test('on-screen keys simulate modifiers, layers and tap/hold branches',()=>{
 assert.equal(simulationAction('&kp RALT').modifier,'alt')
 assert.equal(simulationAction('&kp LGUI').modifier,'cmd')
 assert.equal(simulationAction('&mo NUM').name,'NUM')
 assert.equal(simulationAction('&lt CODE SPACE').binding,'&kp SPACE')
 assert.equal(simulationAction('&lt CODE SPACE',true).name,'CODE')
 assert.equal(simulationAction('&mt LCTRL A',true).modifier,'ctrl')
 assert.equal(simulationAction('&none').kind,'none')
})
