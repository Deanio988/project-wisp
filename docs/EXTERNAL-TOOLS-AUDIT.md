# Project Wisp — external visual tool audit
Reviewed 2026-11-11.

| Repository | Purpose | Integration choice |
|---|---|---|
| patch-gg/pixelfx | MIT JavaScript VFX; exports PNG sprite sheets and JSON frame timing | **Adopt first**, export isolated egg-hatch effect; preserve notices |
| Orama-Interactive/Pixelorama | Pixel-art desktop authoring tool | Artist workflow only; not a runtime dependency |
| pjferri/pixeldust | Particle effect authoring | Evaluate later; avoid overlapping VFX engines |
| deepnight/ldtk | Map editor | Use for future world layouts, not current egg sanctuary |
| pixijs/pixijs | GPU 2D renderer | Defer migration: current DOM-based game works on mobile |
| phaserjs/phaser | Complete game engine | Defer: migration risk outweighs immediate benefit |
| prettymuchbryce/easystarjs | Grid pathfinding | Evaluate when explorable map and obstacles exist |
| OpenGameArt/LiberatedPixelCup | Art resources with per-asset obligations | Do not import wholesale; review each asset and its license |

## First integration gate
- Use a pinned PixelFX upstream revision, not unpinned scripts at runtime.
- Generate transparent PNG/JSON in GitHub Actions, not by linking to a third-party CDN.
- Keep copyright and MIT notices alongside copied effects.
- Check performance and reduced-motion before enabling animations.
- Preserve current egg state and existing save format.
