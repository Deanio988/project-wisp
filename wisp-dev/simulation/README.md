# Egg Simulation (v2 prototype)

Pure ESM engine, deliberately **not wired into the existing game UI**. This preserves the current development-branch experience while simulation rules are tested and balanced.

Run with Node 20+: `node --test tests/egg-engine.test.mjs` from repository root.

Exports: `createEgg(seed)`, `applyCare(state,action)`, `getReadiness(state)`, `beginHatch(state)`, `completeHatch(state)`, `migrateLegacy(old,seed)`.

No wall-clock timers, network calls, random rerolls or storage writes. The caller chooses a persistent random seed and persists each returned state atomically. `ready` locks the family and birth record; subsequent hatching steps do not reroll.

Known limitations: family event contribution is reserved for future family-specific developmental events; legacy migration is intentionally conservative and does not yet preserve old chat messages; thresholds and balancing need simulation testing; this engine is not integrated into the UI or deployed.
