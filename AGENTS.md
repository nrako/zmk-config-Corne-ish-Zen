# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in
this repository.

## Project Overview

This is a ZMK firmware configuration repository for the Corne-ish Zen V1
wireless mechanical keyboard. The repository uses GitHub Actions to build
firmware remotely rather than requiring local ZMK toolchain setup.

## Key Architecture

### Build System

- **GitHub Actions**: Firmware builds are triggered automatically on push/PR via
  `.github/workflows/build.yml`
- **Build Matrix**: `build.yaml` defines the build targets (left and right
  keyboard halves)
- **West Manifest**: `config/west.yml` manages ZMK dependencies and module
  imports

### Keyboard Configuration

- **Keymap**: `config/corneish_zen.keymap` - Main keymap definition using ZMK's
  devicetree format
- **Config**: `config/corneish_zen.conf` - Board-level configuration (sleep
  timeout, logging, etc.)
- **Sample**: `config/corneish_zen_SAMPLE.keymap` - Reference keymap provided by
  LOWPROKB

### Keymap Structure

The keymap uses a 42-key layout (6×3 + 3 thumb keys per side) with the following
layers:

- Layer 0: QWERTY (base layer)
- Layer 1: NUM (numbers and symbols)
- Layer 2: CODE (coding symbols)
- Layer 3: FN (function keys and system controls)
- Layer 4: NUPAD (numpad layer)

Key positions are documented at the top of the keymap file with an ASCII diagram
showing position indices 0-41.

## Development Workflow

### Making Keymap Changes

1. Edit `config/corneish_zen.keymap` directly
2. Commit and push changes to trigger GitHub Actions build
3. Download firmware from Actions → Build → Artifacts → `firmware.zip`
4. Flash `.uf2` files to keyboard halves by double-clicking reset button

### Testing Changes

There is no local testing capability - all changes must be flashed to the
physical keyboard. Consider making incremental changes to avoid having to
reflash frequently.

### ZMK Syntax

- Keycodes use C preprocessor defines from `<dt-bindings/zmk/keys.h>` and
  `<dt-bindings/zmk/bt.h>`
- Behaviors are defined in devicetree format: `&kp`, `&mt`, `&lt`, `&td`,
  `&caps_word`, etc.
- Layer definitions use `bindings = <...>` with one binding per key position
- Combos are defined with `key-positions`, `timeout-ms`, `layers`, and
  `bindings`

## Important Notes

- This config is for **Corne-ish Zen V1** only (pre-October 2022 group buy). V2
  uses a different repository.
- The keyboard definition is maintained in this repo temporarily until merged
  into ZMK main.
- Board files reference `corneish_zen_v1_left` and `corneish_zen_v1_right`.
- Sleep timeout is configured to 1 hour (3600000ms) in `corneish_zen.conf`.
- USB logging is disabled by default but can be enabled in `corneish_zen.conf`
  for debugging.

## Resources

- [ZMK Documentation](https://zmk.dev/docs) - Official docs for keycodes,
  behaviors, and configuration
- [ZMK GitHub](https://github.com/zmkfirmware/zmk) - Source code and examples
- [ZMK Discord](https://discord.gg/8cfMkQksSB) - Community support
