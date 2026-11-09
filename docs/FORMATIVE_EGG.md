# Project Wisp — Formative Egg Design (v0.2)

## Two-stage experience
**Egg Sanctuary:** A small intimate space focused on building personality through care. No fixed hatch timer.
**Living World (future):** On hatching, transition to a richer woodland home. The creature uses its inherited temperament to influence autonomous exploration, reactions and conversations. This environment is not implemented yet.

## Trait model
Six numeric scores: curiosity, sociability, calm, courage, affection and playfulness. All begin at zero for new eggs and are stored in the existing local save key `project-wisp-v1` to preserve current progress.

| Action | Main traits |
|---|---|
| Warm | affection +3, calm +1 |
| Sing | sociability +3, playfulness +1 |
| Rest | calm +3, affection +1 |
| Explore | curiosity +3, courage +2 |
| Play | playfulness +3, courage +1 |
| Story | curiosity +2, sociability +2 |

Trust and warmth also change with actions. Traits are capped at 100. Current scores are visible to the player.

## Natural hatch rule
Hatch automatically once all are true:
- trust >= 55
- warmth >= 40
- at least three distinct traits reach score >= 6
- at least three distinct care action types have been performed

No real-world timer. On hatch, freeze a snapshot of the six trait scores and the two leading traits in `hatchedProfile`. Scores may later continue evolving, but the snapshot preserves the starting temperament.

## Save compatibility
Existing `project-wisp-v1` saves are loaded and missing fields initialized. Previously hatched companions remain hatched. Previously completed interactions do not retroactively grant personality points. Starting a new story deletes the saved data after confirmation.

## Current limitations
This is a deterministic personality model, not machine learning or a language model. Chat responses remain scripted. Hatchling art and the post-hatch living world remain future work. The draft PR should be tested on a phone before merging into the public site.

## Manual test checklist
1. Fresh story: verify six trait meters begin at zero and no immediate hatch.
2. Repeat Sing only: verify no hatch regardless of trust.
3. Mix Warm, Sing, Rest, Explore, Play and Story: verify all trait meters update.
4. Meet all four conditions: verify shell animation and one hatch event.
5. Reload page: verify hatched state and recorded personality remain.
6. Start a new story: verify reset clears traits and messages.
7. Test older saved data: verify no crash and no loss of existing warmth/trust/messages.
8. Test reduced-motion accessibility and mobile layout.
