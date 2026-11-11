# Project Wisp artwork installation contract

This directory is reserved for the **approved original Project Wisp artwork**. Do not replace missing files with generic icons, procedurally drawn substitutes, or unrelated assets.

## Creature frames (64 PNG files)
Put 64x64 RGBA PNG files under `preview/art/creatures/` with this naming convention:

`<family>_<action>_<frame>.png`

Families: `mossling`, `glimlet`, `mistril`, `pebblin`.
Actions: `idle`, `walk`, `sleep`, `interact`.
Frames: `00`, `01`, `02`, `03`.

## Egg stages (16 PNG files)
Put 96x96 RGBA PNG files under `preview/art/eggs/`:

`<family>_egg_<stage>.png`

Stages: `dormant`, `awakening`, `forming`, `emergence`.

Egg artwork must not disclose the eventual creature family prematurely. Use a neutral presentation before hatching; do not expose hidden genetic selection in filenames loaded by the browser.

## Release gate
The existing sanctuary deliberately uses its current SVG fallback until complete approved sprite sets are installed. `node --test tests/*.test.mjs` checks that the creature set is either completely absent or completely installed; partial sets fail. A production release must require **all 64 creature and all 16 egg frames**, real-browser verification and user approval. CI success without artwork is not evidence that artwork has been integrated.

The separate local v0.4.0 prototype ZIP is not part of this repository. No production release or `main` deployment is authorized by this document.
