import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseKeymap } from './keymap.mjs'
const source = readFileSync(new URL('../config/corneish_zen.keymap', import.meta.url), 'utf8')
test('actual keymap: layers, custom macro and combo scopes', () => {
  const d = parseKeymap(source)
  assert.deepEqual(
    d.layers.map(l => l.name),
    ['QWERTY', 'NUM', 'CODE', 'FN', 'NUPAD'],
  )
  assert.ok(d.layers.every(l => l.keys.length === 42))
  assert.equal(d.layers[1].keys[23], '&kp ESC')
  assert.equal(d.layers[1].keys[26], '&tog NUPAD')
  assert.equal(d.layers[2].keys[15], '&wsp 0 HYPER(W)')
  assert.deepEqual(d.combos.find(c => c.name === 'combo_esc').layers, [0, 1, 2])
  assert.deepEqual(d.combos.find(c => c.name === 'combo_scrnsht_all').layers, [0, 1, 2, 3, 4])
  assert.match(d.behaviors.gratab, /MOD_RALT/)
})
test('comments do not introduce phantom bindings', () =>
  assert.deepEqual(parseKeymap(source + '\n// &kp FAKE'), parseKeymap(source)))
test('missing key fails visibly', () =>
  assert.throws(() => parseKeymap(source.replace('&kp Q         &kp W', '&kp W')), /expected 42/))
test('unknown behavior fails visibly', () =>
  assert.throws(
    () => parseKeymap(source.replace('&kp Q         &kp W', '&missing Q         &kp W')),
    /Unknown behavior/,
  ))
test('invalid combo position fails visibly', () =>
  assert.throws(() => parseKeymap(source.replace('<0 1>', '<0 99>')), /Invalid combo/))
