# Zen layout viewer

Read-only local reference for the repository's Corne-ish Zen keymap.

From the repository root (Node 22.12+ recommended):

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. `npm run build` type-checks and creates
an entirely static site in `dist/`. `npm test` checks keymap extraction and
failure cases. Nothing is deployed by these commands.

## Data and display

- `config/corneish_zen.keymap` remains authoritative. Vite parses it during
  development/build and reloads when it changes. No generated JSON to maintain.
- `scripts/keymap.mjs` is a deliberately scoped reader for this repository's
  syntax, not a ZMK compiler or general C preprocessor. It reads layers, combos,
  custom behavior definitions and simple binding macros. Invalid key counts and
  unknown behavior references fail the build. External includes, conditional
  compilation and new macro forms need reader support.
- `viewer/src/labels.ts` contains display aliases and explanations for custom
  behaviors. Update those explanations if their semantics change; raw ZMK
  definitions remain visible in the details panel. Unknown keycodes are shown
  verbatim, not guessed.
- Transparent keys show the base-layer legend in grey. This is a reference, not
  a simulation of a stack of active layers. The details panel explains it.
- `viewer/src/main.ts` uses the exported Zen silhouette and 42-key
  geometry, layer selection and combo highlighting. Geometry is extracted from the supplied Figma SVG exports.
- `viewer/src/style.css` contains the responsive graphite theme.

Click a key (or focus it and press Enter/Space) for details. Hover or focus a
combo in the panel to highlight its participating positions. Use the tabs or
expand buttons to inspect one layer, and the overview to compare all five.

Keyboard-event detection, macOS Option/Shift character tables and PNG export are
intentionally deferred. The page never captures global shortcuts and never
changes firmware.

## Figma geometry and modifier preview

`src/data/geometry.json` contains the exact first outline path and the
key/screen rectangles from the user-provided `left.svg` and `right.svg` Figma
exports. Outlined text was discarded. Keys are mapped by column/row, then
left-to-right thumb order; the halves are separated for display without scaling
either half.

`src/data/abc.json` is a macOS ABC snapshot obtained with Carbon UCKeyTranslate,
including dead-key flags for each normal/Shift/Option/Option+Shift variant. To
refresh on a Mac with ABC selected:

```sh
swift scripts/export-abc.swift > /tmp/abc.json
# Inspect the export before replacing viewer/src/data/abc.json.
```

Alt and Shift buttons latch a preview; physical modifiers also activate it while
this page receives their events. Physical state clears on blur or page hiding.
This is a character preview, not execution of shortcuts or a firmware emulator.
Existing chords containing Command/Control retain their shortcut legends. The
dotted underline identifies a dead accent, not a composed character.

Red access keys and paths are discovered from layer bindings starting at QWERTY.
Solid means hold; dashed means toggle/one-shot. An access legend can describe
the preceding layer's entry key (for example NUM position 26 to reach NUPAD),
not the binding once the destination layer is active. Shortest reachable paths
are shown.
