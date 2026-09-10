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
- `viewer/src/main.ts` contains the approximate Zen silhouette and 42-key
  geometry, layer selection and combo highlighting. The geometry is hand-drawn
  from the reference, not extracted from the Figma document.
- `viewer/src/style.css` contains the responsive graphite theme.

Click a key (or focus it and press Enter/Space) for details. Hover or focus a
combo in the panel to highlight its participating positions. Use the tabs or
expand buttons to inspect one layer, and the overview to compare all five.

Keyboard-event detection, macOS Option/Shift character tables and PNG export are
intentionally deferred. The page never captures global shortcuts and never
changes firmware.
