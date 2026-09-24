# Curved-arrow weld review — 23 September 2026

**Follow-up:** the later pair-contour review confirmed a Sparkle/Sparkle refresh mismatch that the broad sprite review missed. Its repair, measured before/after proof and final pair coverage are in [the pair review](../pair-contours-2026-09-23/README.md). The original statements about matching sparkle landmarks below are superseded.

Refined 12 exports across 11 meanings: all Replay and Forward timers, History, Sync and both Sparkle refresh variants. The issue was existing crowding around short curved arrowheads, not a regression introduced by the preceding Close/Expand/Collapse changes. `before.json` retains the baseline from cbd80ba09be1559aa1ad3c94c5ab0e8e54af96df.

## Decisions

- Replay/Forward: smaller tangent fillets preserve the circle, numerals, tips, flat ends, frame and primary weight. Both directions and all four numerals share the construction.
- History: remove the general head-corner round and reduce the circular-shaft joins. The clock hands retain their own softened elbow.
- Sync/Sparkle refresh: replace overlapping general rounds and quadratic bridges with the exact circle-to-head construction. Move the head slightly along the circle to make room for visible welds and straight arms. Their automatic fit updates; the sparkle pair retains identical shared landmarks.
- Retained after comparison: Undo, Redo, Refresh, straight arrows, chevrons, cloud/panel/sort arrows and the previously reduced Close/Expand/Collapse family. No blanket radius reduction.
- Canonical design/contribution guidance now separates visible band thickness, weld strength and pixel clarity. Filled rims and inverse openings belong in the thickness review.

## Evidence and checks

[Light](comparison-light.png) and [dark](comparison-dark.png) comparisons cover every changed export at 12/16px, widths .67, 1, 4/3 and 1.5, with enlarged W4/3 views.

Actual generated component markup and package CSS masks were inspected in local Storybook using temporary review layouts. Thirty changed/related exports were rendered at 12/16px on light/dark at all four widths, plus 64px at 1, 4/3 and 1.5, DPR1/2. Masks retain .67. The four `components-dpr*.png` captures include Print and User badge as weight references.

The changed family was compared before/after in the existing Salt button-with-icons story: medium 12px/W4/3 and touch 16px/W1, light/dark, DPR1/2. Temporary labels/layout supplied the comparisons; native button and icon styling were retained. Eight `buttons-*.png` captures record these views. All 1,572 samples in `surface-checks.json` have correct dimensions and loaded masks; explicit component stroke ratios match the authored SVG widths.

- Full generation and 550-export validation passed: `validation.log`.
- 80 artwork tests and 18 browser component tests passed. Both edited MDX pages compile; whitespace checks passed.
- Integration passed for 11 meanings / 12 exports. Eight existing spaced-synonym warnings remain; identity and search metadata are unchanged.
- `head-measurements.json` compares final paint at all four weights: 208 before/after arm samples, including both Sync heads. Sampling just outside each arm's stroke, the minimum clear straight reach increased from 0.36 to 0.82 final 16-unit canvas units. Every revised sector adds measurable weld paint at each width. This is diagnostic geometry evidence, not a perceptual score or universal minimum.

## Separate visual review

At the user's request, a separate agent received design guidance and rendered sheets without the implementation discussion. It used built-in image perception to inspect all 550 exports on 22 unnamed detail sheets, then resolved observations through the coverage map, and reviewed the curved-arrow comparisons. See [the report](independent-visual-review.md) and `catalogue-coverage.json` for identities and hashes.

No high-confidence blocking issue was found in the changed arrow family. Two minor catalogue follow-ups concern 12px detail in Currency exchange and Handshake (both variants). These are recognition/density tradeoffs, not established weld regressions, and were not changed here.

The complete sprite and detail sheets are in the task's durable visualization output, `subtle-welds-review-2026-09-23`. The overview uses 32px/W4/3. Detail sheets show 12/16px at W1/W4/3 on light/dark, 48px enlargements, and baked .67 samples. All 550 hashes match the final artwork.

This is model-based visual review, not human recognition testing or brand approval. The full density/multiplier scale was not rerun. The detailed corner-review migration remains pending with seven recorded approvals; this task does not approve every catalogue corner.

The changes are ready locally, with no commit or push. Temporary probe/render scripts were removed and local Storybook was stopped after review.
