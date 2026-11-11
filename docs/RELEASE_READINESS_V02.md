# Project Wisp — v0.2 release readiness

## Verified automated quality gate
GitHub Actions run 42854694231 passed on the feature branch. The job included unit tests, the 1,000-egg simulation, Chromium desktop/mobile browser acceptance, reload recovery, family reveal and reduced-motion checks.

## Release boundaries
- Do not merge into `main` or deploy the feature branch until the user explicitly approves.
- Existing live `index.html` and its `project-wisp-v1` local save are unchanged.
- The preview lives at `preview/index.html` and uses `project-wisp-egg-preview-v2`.
- The new engine is **not** yet wired into the default live entry point.
- The preview is a proof of concept, not a final public build.

## Required before release
- [x] Simulation and lifecycle tests
- [x] 1,000-egg automated balancing smoke test
- [x] Journal tests
- [x] Desktop/mobile Chromium acceptance
- [x] Automatic hatching and interrupted-hatch recovery
- [x] Reduced-motion smoke test
- [ ] Original, properly licensed final creature artwork for Glimlet, Mistril and Pebblin
- [ ] Visual review on a physical Android device and a desktop browser
- [ ] Accessibility audit with keyboard and screen reader, beyond smoke tests
- [ ] Integrate feature into main game entry point while retaining legacy-save compatibility
- [ ] Test migration of real legacy saves and rollback strategy
- [ ] Obtain explicit user approval before merging or deploying

## Known limitations
- Glimlet, Mistril and Pebblin use temporary typographic symbols, not final illustrations.
- The preview does not provide the full post-hatch Living World.
- Chromium automation does not establish Safari/Firefox compatibility or physical-device usability.
- Existing tests verify smoke-level family distribution, not statistically uniform outcomes.
