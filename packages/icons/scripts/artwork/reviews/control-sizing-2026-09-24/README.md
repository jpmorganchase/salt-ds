# Compact control sizing — 24 September 2026

Ten exports were corrected: KeyControl, Close, CloseSmall, First, Last, TriangleUp, TriangleDown, TriangleLeft, TriangleRight and TriangleRightDown. Source hashes confirm the other 540 exports are unchanged by this pass. Earlier work in this checkout was preserved.

## Design decision

The canvas remains available for fuller icons. Compact families inherit reviewed apparent size, proportions and placement; a global inset has not been adopted. The original set is the historical recognition baseline, from commit 1beb88c50af5b4642cf701f22f0cf7d09e48fd40.

KeyControl regains its small raised position. First and Last share one mirrored construction and an approximately 8px square footprint at 12px, with their boundary bars close to the pixel grid. Close is approximately 9.28px and CloseSmall 7.78px. The four directional triangles return to 10×5px proportions; the diagonal corner indicator returns to approximately 7×7px. Warning, Play, other objects, existing brands and full-canvas badges keep their current frames.

The Close recipes compensate their inner curves for the smaller framing. Their exposed inner radii at the heaviest 1.5-unit stroke are approximately 0.21 and 0.20 master units, preserving subtle softening without thinning the arms. Primary configurable stroke widths remain unchanged.

The durable changes live in the shared optical-fit configuration and owning recipes. The icon design page, contribution page and maintenance guide explain the family-sizing decision for future icons. Generated SVGs, React components, CSS masks and fit metadata were rebuilt. A patch changeset records the consumer-visible changes.

## Review outcome

The corrected glyphs retain their identifying gestures and approach the originals’ visual scale. First/Last no longer dominate their button boxes. Directional triangles regain their shallower silhouettes. KeyControl reads as a raised keyboard modifier rather than a large navigation chevron. Close remains recognizably an X with restrained inner transitions. This is expert visual judgment, not human recognition testing.

The interactive index compares original, previous redraw and corrected artwork for 46 relevant exports. The all-icons page compares the original set against all 550 current exports. Native rows use 12px at primary width 4/3 and 16px at width 1 by default, with controls for the reference width and heavier settings.

## Verification and limits

- Full generation and validate:icons passed for all 550 exports, including painted bounds, optical fits, compact dismissal size/weight and existing pair/clearance checks.
- Integration passed for all ten changed names, with four pre-existing warnings about spaced triangle synonyms. No catalogue metadata changed.
- 160 size/weight/background cases checked actual Storybook component markup and generated CSS masks: ten exports × two sizes × four widths × two backgrounds. Dimensions and component stroke resolution passed; masks retained the fixed 0.67 reference. This amounts to 320 component/mask specimens.
- All changed SVGs were captured at native 12px/16px and enlarged, on light/dark backgrounds at DPR1/2. Final direct inspection included changed SVGs at DPR1, the first six at DPR2 dark, component/mask sheets at the default widths on light/dark, and the reference/heavy specimens used to diagnose join exposure. Other captures remain available for review and are not claimed as individually inspected.
- Keyboard siblings and the playback/status comparison were inspected as retained context. The ten changed exports received the focused correction; this is not approval of every family in the wider catalogue.
- Before/after control comparisons used existing Salt button styling at normal 12px high-density and 16px touch-density sizes, plus an equivalent keyboard shortcut presentation. Direct final inspection covered 12px light and 16px dark. The captures are context comparisons, not interaction tests.
- The responsive preview passed its 390px viewport check without horizontal overflow and produced no page errors.
- The full larger-size/density matrix and human recognition testing were not rerun. Existing pair-review migration remains open: six declared pairs pass and 179 still need review.

The correction does not add runtime scaling or require new per-icon lint rules. Existing optical target validation protects the accepted frames; the compact-dismissal check now protects the restored relative scale.
