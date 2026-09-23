# Weld strength review — 23 September 2026

Reviewed all 550 exports with names hidden in 22 contact sheets: native 12px and 16px at DPR 1, weights 0.67, 1, 4/3 and 1.5, light and dark, plus enlarged views. Initial visual observations identified a heavy X center, crowded four-way arrowheads and a heart contour discrepancy. Names were consulted after the initial sheet review. This is expert visual judgment, not a human recognition study.

## Corrections

- Close, Close small and Multiply: smaller curved roots preserve longer straight arms and a quieter center. Multiply now uses the same configurable crossing construction as Close.
- Filter clear (both), Tag clear (both), Key backspace, Signature and Volume off: locally reduced crossing radii preserve the existing endpoints, line weights, proportions and relationships to their base objects. Tag's cap clearance remains intact because the changed center is outside the tag; all cutout checks pass.
- Expand and Collapse: smaller shaft/head fillets retain longer straight arrowhead arms. Explicit root construction replaces the overlapping generic and explicit treatments; outward points and endpoints stay fixed.
- Like (heart), outline and solid: close the path on a smooth flank instead of at the bottom cusp, so export rounding does not introduce a tiny third segment at that pointed join. Continuous lobe curves allow tangent softening at the upper cleft. The solid retains the outline's complete stroked perimeter and shared export frame, removing the independently fitted shape and exposed fill-patch seam.

The 536 other exports were retained for this strength pass. Primary arrows, chevrons, compact panel/cloud arrows, status marks, addition marks and structural attachments retain useful straight lengths or open counters at native size. A softer Close does not establish a new radius for those families. Official brand artwork remains owner-defined.

## Evidence and checks

- `coverage.json` maps every export to its inspected sheet and records the final SVG hash. `before.json` retains the 14 changed baselines. The two comparison sheets show before/after enlargements and native-size comparisons.
- Live Storybook checks covered 36 changed/related exports as generated components at all four widths and both native sizes on light/dark at DPR 1; DPR 2 was checked on light. CSS masks were checked at their baked width on both backgrounds at DPR 1. `surface-checks.json` records actual dimensions; enlarged samples are diagnostic.
- Full 550-export validation passed, including existing gap, bounds, pair, arrow and pixel-grid checks. 80 artwork tests and 18 browser component tests passed.
- The heart's retained outer perimeter and symmetric tip are now measured at all four weights by the existing symbol regression checks. Running those checks on the saved baseline rejects the old pair at all four weights; the revised pair passes.
- Integration passed for 11 meanings / 14 exports. Five warnings concern unchanged spaced search synonyms; no names or metadata changed.

This review calibrates strength; it does not certify every corner in the catalogue. The existing final-paint gate still has seven detailed approvals, with other individual corner decisions pending. No detector observation was automatically approved by this pass. The full-density size-multiplier matrix was not rerun because these changes target 12–16px weld strength, not a whole-scale redesign.

Local source review found no additional actionable issue in the bounded patch. The external autoreview helper was blocked by automatic approval review because it could transmit repository source to an unspecified review service; no external review was run.
