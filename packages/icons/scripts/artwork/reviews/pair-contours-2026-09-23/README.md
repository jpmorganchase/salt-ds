# Pair contour lint and glyph-size review — 23 September 2026

The reported Sparkle refresh mismatch was a confirmed construction defect. Its solid filled the source centerline while the outline added stroke and corner profiles. Standalone Sparkle shared the defect. Favorite also had independent fitting and a smaller solid optical target.

## Repairs and repeatable checks

- Sparkle and Sparkle refresh share a complete painted rim. A miter limit of 5 preserves their four acute outward points instead of the previous outline's beveled tips. Inner softening remains shared.
- Favorite retains its five-point outline and uses the same frame when filled. Favorite half and strong are retained.
- The reusable retained-surface construction and declarative pair contracts avoid hand-maintained pixel probes.
- The audit discovers all 185 pairs. It measures every connected component's exterior, including detached internal marks, at four weights. Six declared relationships are enforced; 179 existing pairs remain explicitly **needs-review**.
- Normal validation runs the check. New pairs need a declared relationship. Strict completion fails while any pairs need review. This does not evaluate inverse marks, internal hole geometry, weld quality or human recognition.

The regression-proof.json file runs the same final 32-samples-per-unit checker against saved before artwork and final exports. Favorite, Sparkle and Sparkle refresh fail at every width before repair; all six declared contracts pass afterward. The before-audit.json file retains the initial full-catalogue audit at 64 samples per unit; it is not the final coverage report.

## Visual review

Comparison sheets show before/after, pair overlays and native 12px/16px at 0.67, 1, 4/3 and 1.5, on light/dark at DPR1/2. Favorite half/strong and Like are family references. The pointed sparkle repair preserves separation from the refresh arrow and small companion sparkle.

Generated-component sheets use actual Storybook component markup and package CSS masks. The component-checks.json file records 400 component/mask dimension and load checks across 10 exports, two sizes, four component widths, both backgrounds and DPR1/2. Calculated secondary widths resolve as CSS numeric values. Button captures retain the With Icon story's control styling at 12px/W4/3 and 16px/W1. This is expert visual inspection, not human recognition testing.

The earlier broad sprite review missed the sparkle mismatch. This focused comparison and measured proof supersede that conclusion for these pairs.

## Historical glyph sizes

Baseline: 1beb88c50af5b4642cf701f22f0cf7d09e48fd40, immediately before the first redraw generator commit, 75093c2ef. The baseline commit only adds reference assets; its production SVGs are the previous system set.

The comparison preserves original viewBoxes, fixed original strokes and equal display boxes. Painted width/height, center and alpha-weighted ink area are measured separately. It matches 548 exports; the two Remove bookmark variants are new. Aliases remain separate because several original alias glyphs differed.

At 12px/W4/3, median longest painted span is 4.1% smaller. Ten exports are over 10% smaller and 46 over 10% larger. At 16px/W1, the median is 6.2% smaller. These are export counts and geometric extents, not perceptual size judgments.

| Glyph | Longest-span change at 12px | Review reason |
| --- | ---: | --- |
| Key control | +72.4% | Originally a small raised keyboard symbol; size and placement both change. |
| Triangle right down | +66.2% | Originally inset; fitting expands the directional marker. |
| First / Last | +44.6% | Navigation controls become substantially taller. |
| Close | +25.5% | Compare existing control spacing and neighboring icons. |
| Success / Success tick | −23.7% | Legacy aliases previously had larger ticks than Checkmark; prioritize status recognition. |
| Print, both variants | −16.6% | Deliberate grid alignment; compare clarity against apparent size. |
| Minimize | −31.3% | Compact framing and a thinner visible bar; compare window-control siblings. |

No catalogue-wide size adjustment was made. The interactive report supports filtering, variants, light/dark, native sizes and enlarged overlays. The CSV covers 12px/W4/3 and 16px/W1. Larger published sizes are available for follow-up, without claiming visual approval at every size.

## Validation

- Complete generation succeeded.
- 86 artwork tests and 18 browser component tests passed.
- Integration passed for three repaired meanings / six variants, with three existing spaced-synonym warnings.
- Both canonical MDX pages compile.
- Final full-catalogue validation and pair coverage are recorded alongside this note.

Final result: all 550 exports pass normal validation. Pair coverage: 6 declared relationships pass at every weight; 179 remain needs-review. All 550 hashes in the delivered size report match the final exported artwork.
