# Upright crescent — 24 September 2026

Follow-up to the native-size review: the user preferred the Carbon moon silhouette.

## Design decision

Adopt the more upright upper horn and fuller lower bowl. Draw the Salt crescent independently from two circular arcs: outer radius 9.75 on the construction grid, endpoints at -100° and 35°, inner radius 10.75. Preserve Salt's primary rim, sharp outward tips and small inner fillets (radius 1.05 before normalization/fitting).

Both variants share this contour and the existing shared export frame. DarkSolid fills the crescent; it intentionally has a fuller body than the previous Salt drawing. No optical variants, shared stroke changes, catalogue names or metadata changes are included.

The reference was the 16-unit Carbon `asleep` SVG from [@carbon/icons@11.89.0](https://unpkg.com/@carbon/icons@11.89.0/svg/16/asleep.svg). Its SVG and Apache licence remain recorded in [the preceding review](../native-size-2026-09-24/references.json). Carbon's rounded terminal caps were not adopted.

A read-only independent agent reviewed the reference and three rendered candidates. It preferred candidate A, the chosen contour, for its match to the upright silhouette and clear native-size opening. This is an expert judgment, not a human recognition study or evidence of an antialiasing improvement.

## Visual evidence

- `before-after.json` preserves the immediate previous and revised SVGs.
- `buttons-dpr1.png` and `buttons-dpr2.png`: actual generated React SVG markup with Salt button styles, high/medium/low/touch densities, outline/solid and both backgrounds. The 64 component samples have measured dimensions and themed strokes in `context-metrics.json`. The same sheets include 64 baked CSS-mask samples.
- `supported-weights.png`: both variants before/revised at 12/14/16px, both backgrounds and 0.67, 1, 4/3 and 1.5 artwork widths. Enlarged shapes are secondary construction views; the adjacent sun provides family context.
- The revised curve remains recognizably a crescent at native size. Its fuller solid and more upright tips match the requested direction. Native curves still antialias.

The comparison page places the previous Salt outline, revised Salt outline and unchanged Carbon reference alongside one another, with the solid pair below. Its default is captured DPR-1 pixels at 14px; users can switch to live SVG or another native size.

[Phone review](https://salt-icons-review-0909.joshuawooding.chatgpt.site/native-size-review.html)

## Checks

Full regeneration and validation passed for all 550 exports, with no reported geometry errors or bounds failures. The existing declared Dark pair contract checks retained contours at the supported weights; it does not establish approval of unrelated pairs. Integration checks passed for both Dark exports with no errors or warnings. Validation outputs accompany this record.
