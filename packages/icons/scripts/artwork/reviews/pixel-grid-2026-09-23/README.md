# Pixel alignment review — 23 September 2026

Improve native 12px clarity while preserving the sharp outer silhouettes, softened inner joins and recognition of the existing family. The baseline is commit `670a0ac0c280d2b20c5e2fd2927409ecda98819a`. This review changes 19 exports across 18 meanings.

## Changes

- Printer outline and solid share a smaller frame whose important paper and housing edges align at 12px. Both retain primary stroke weight, welds and a clear output sheet. The optical profile preserves this authored frame instead of scaling it up again.
- Add, remove, divide, the four arrows and the two move controls shift as connected drawings to improve the pixel phase of their primary straight strokes. Their spans and stroke weight stay unchanged.
- The four single and four double chevrons use a more compact span with unchanged primary stroke weight, 45-degree arms and inner welds. These diagonal drawings are judged visually rather than through the straight-edge score.

## Visual evidence

Open the PNGs at their original scale when judging 12px and 16px icons. Enlarged columns expose construction; they do not demonstrate native-size clarity. Before is on the left of each pair.

- [Light comparison, first group](light-0.png) and [second group](light-1.png)
- [Dark comparison, first group](dark-0.png) and [second group](dark-1.png)
- [Real Salt buttons and components at DPR 1](buttons-dpr1.png) and [DPR 2](buttons-dpr2.png)
- [CSS masks in light](masks-light.png) and [dark](masks-dark.png)

The SVG sheets compare 12px/W4/3, 16px/W1, 16px/W4/3 and enlarged construction. The button captures use actual Salt components in medium and touch densities, in light and dark, including label-driven fractional placement. `components.json` records dimensions, positions and computed primary widths. The mask comparisons use the baked reference width, 0.67, on both sides; this is thinner than the component default. All captures use normal antialiasing. A subsequent read-only inspection of the supplied Vercel Button preview found the previous printer and chevron geometry at 12px, with the expected 4/3 master stroke, normal antialiasing, fractional layout positions and no transformed ancestors. This supports checking both artwork and placement; it does not isolate the cause on the user's own screen. The agreed primary acceptance view is 12px at DPR 1 and 100% zoom, alongside 16px and higher-density checks.

The 12px control edges look stronger and the printer remains recognizable at both sizes. Compact chevrons balance better beside text without reducing their stroke. The printer's average straight-edge alignment error improves at 12px but increases at 16px; that is an explicit tradeoff in favor of the requested smallest size, accepted after viewing both sizes. Alignment cannot be guaranteed at every browser zoom, display density or layout position.

## Catalogue coverage and limits

`coverage.json` retains compact before/after measurements for all 550 exports and the advisory follow-up queue. 440 exports have qualifying exposed straight edges. Eleven repaired exports have their sampled straight edges aligned at 12px; eight diagonal chevrons are outside this measure. The 294 remaining queue entries are candidates for visual investigation, not confirmed defects. Other icons have not received new visual sign-off in this review. Brand geometry is excluded from prioritization.

The audit samples long horizontal/vertical boundaries in the union of the final exported paint. Its score assumes an integer CSS origin, 100% zoom and DPR 1. It cannot certify recognition, curves, diagonals, short details, all layout phases or the entire set's visual quality. Rerun `yarn workspace @salt-ds/icons audit:pixel-grid` for the detailed current report in `dist/icon-pixel-grid/report.json`.

## Validation

- Full generation and validation: all 550 exports passed, including printer paper continuity, internal joins, stroke consistency, cutout clearance and painted bounds.
- Artwork tests: 80 passed, including three pixel-grid tests that cover phase, hidden edges and the 11 repaired straight-edge exports.
- Browser icon component tests: 18 passed.
- Icon integration: 18 meanings / 19 variants, zero errors; 18 existing spaced-synonym warnings remain outside this change.
- Icon source typecheck passed using the repository's workspace source mappings. The standalone package config cannot resolve the unbuilt styles/window package declarations in this checkout.
- Both changed MDX guidance pages compile; the new pixel-alignment links match the section heading.
- Independent `autoreview --mode local --no-web-search` review of the source change returned no actionable findings. Generated artifacts were excluded from that review bundle and covered by generation, validation and visual inspection. The result is retained in `review.json`.

The audit is advisory and supplements the visual workflow. It does not replace existing intersection or corner review decisions. `before.json` retains the 19 baseline drawings for later comparison.
