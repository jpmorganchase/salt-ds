# Circular-arrow family — 24 September 2026

This follows the earlier tangent-alignment correction. The user identified inconsistent apparent arrow sizes and a crowded History. Baseline artwork is retained in before.json; it includes that uncommitted alignment correction. The base branch HEAD is d14864e265f51580da825a33490e85678fc81b18.

## Design

All 15 exports / 14 meanings now inherit circular-arrow.mjs: a final circle centred at [8, 8] with radius 7, equal 35/12-unit head arms, mirrored head positions and the same local approach and restrained welds. Refresh, Replay, Forward, History and Sparkle refresh use the same loop. Sync uses two opposing shorter arcs. Undo and Redo deliberately end at the bottom, inheriting Refresh's export frame to prevent an asymmetric painted box from shifting the circle centre.

History receives the common smaller head, a fuller counterclockwise loop, a 3.5-unit vertical hand and a shorter angled hand retaining the established 2:3 slope. Its pivot is centred, with a quieter inner elbow. Primary weight is unchanged. Refresh, Undo and Redo receive the common head size. Timer numerals and the sparkle pair retain their geometry. Seven SVG files differ from the immediately preceding baseline: four visible corrections plus head-path serialization changes for Sync and both Sparkle refresh variants. The eight timer SVGs remain byte-identical to the preceding alignment correction.

## Verification

- Full generation and 550-export artwork validation passed; validation.log. The package review-decision gate also passed; review-gate.log.
- All 15 exports / 16 heads pass independent final-export tangent, circle, centre, arm length/direction, tip placement and arc-opening checks; proportions.json.
- 96 artwork tests pass, including deliberate head enlargement, translation, scaling, reversal and wrong-arc substitutions. The previous History, Refresh, Undo and Redo fail the new family contract as expected.
- 18 browser component tests pass. Integration checks pass for 14 meanings / 15 variants; eight existing spaced-synonym warnings remain unchanged.
- SVG before/after comparisons cover all 15 at 12px and 16px, widths .67, 1, 4/3 and 1.5, light/dark and DPR1/2, plus enlarged views. Focused DPR1 sheets are retained here. All screenshots and the mobile page are in the task's circular-arrow-family-2026-09-24 artifact folder.
- Existing Storybook Icon/All Icons supplied the actual generated React SVGs; Button/With Icon supplied the styled button. Focused temporary layouts reused them without adding stories or product UI. 600 React/mask size and stroke checks pass across the four weights, two sizes, two modes and DPR1/2. Buttons were visually checked in medium 12px/W4/3 and touch 16px/W1 in both modes and DPR1/2.
- A fresh corner audit matches all 550 current exports. All catalogue SVGs also match; the focused comparison, all-icons, guidance and corner-map pages load at 390px without overflow or script errors.
- Structured autoreview completed cleanly, with no accepted/actionable findings. The first full-tree attempt declined an oversized pre-existing raster-review log. The successful review used an isolated 31-file snapshot of the changed source, guidance and SVGs against HEAD, excluding bulk evidence and generated CSS/React (verified separately). Command: autoreview --mode local --no-web-search with a scope prompt; autoreview.txt records its result.

The shared constructor prevents new siblings from drifting by default; the independent checks catch changes introduced in final export fitting. They do not approve perception or recognition automatically. This is a focused family review, not brand-team approval or whole-catalogue visual acceptance. Existing broader corner/pair approval migration remains outstanding.

Canonical design, contribution and maintenance guidance, generated outputs and the changeset are updated. The mobile review site contains the new comparison and current catalogue. At the time of this review, Salt repository changes were uncommitted.
