# Curved-arrow alignment — 24 September 2026

The stems met their arrowhead tips but arrived off-axis, which made the heads look uneven. This follow-up changes 15 exports / 14 meanings: all Replay and Forward timers, History, Refresh, Undo, Redo, Sync and both Sparkle refresh variants. Baseline: d14864e265f51580da825a33490e85678fc81b18, retained in `before.json`.

## Design decision

Retain the head tips and arm endpoints in the construction, then reshape only the nearby shaft to approach along the head bisector. A tangent cubic rejoins the original distant curve without changing its tangent there. Derive the two restrained inner fillets from the new curve. This keeps the primary weight, numbers, clock hands and shared sparkle geometry.

The default approach has a five-unit chord on the 24-unit construction grid; the inner fillet radius is 1.15 units. These are family construction values, not universal rules for every arrow. A prototype compared four, five and 6.5-unit approaches. Five retained a natural local turn while balancing the head. The final before/after comparisons are [timers](details-0-dpr1.png), [remaining timers, History, Sync and Sparkle refresh](details-1-dpr1.png), and [Refresh, Undo and Redo](details-2-dpr1.png).

All 550 SVG hashes were compared with the baseline: exactly the 15 listed exports changed. Fourteen retain their fitting transform exactly. History keeps its scale and vertical placement; fitting recentres it horizontally by -0.018229 final canvas units after the local contour correction. Source head and hand positions are unchanged. This is not a glyph-size redesign.

## Verification

- Full generation and 550-export validation passed; see `validation.log`.
- 91 artwork tests and 18 browser component tests passed.
- Independent final-SVG alignment checks detect all 16 heads, including both Sync heads. All 15 baseline exports fail the new rule (9.31–23.66 degrees off-axis); all revised exports pass. Maximum final error is 0.003669 degrees, below the 0.1-degree export-rounding tolerance. See `alignment-proof.json`.
- Constructor tests cover circular, cubic and mirrored shafts, unchanged far endpoints, tangent continuity into the retained curve, the former mismatch and invalid short/straight inputs.
- All 550 source drawing hashes still match the generated, validated state after formatting cleanup.
- Integration checks passed for 14 meanings / 15 exports. Eight pre-existing spaced-synonym warnings remain; search metadata did not change.
- Native 12px/16px SVG comparisons cover widths .67, 1, 4/3 and 1.5, light/dark, DPR1/2, plus enlarged inspection. The family retains clear tips and flat arm ends; local curves and welds read more evenly.
- Existing Storybook Icon/All Icons and Button/With Icon stories supplied the actual generated component markup and Salt styling. Temporary review layouts reused that markup; no QA stories or product UI were added. CSS masks use the package stylesheet at their baked .67 weight. Component size/weight and mask-loading checks passed for all 840 samples in `surface-checks.json`.
- The [light](components-light-dpr1.png) and [dark](components-dark-dpr1.png) component sheets show all revised icons at the four weights and two native sizes, plus 64px detail and CSS masks. Button comparisons cover medium 12px / W4/3 and touch 16px / W1 on light/dark at DPR1/2. DPR1 captures are retained here; all DPR2 captures and the responsive comparison page are in the task artifact directory `curved-arrow-alignment-2026-09-24`.

The canonical icon design and contribution pages explain alignment before weld calibration. Maintenance guidance documents the shared helper and independent final-export check. An angle check cannot approve perceived balance, weld strength or recognition; these still require visual comparison. This review is a local geometry and visual review, not human brand approval. The broader pair/corner review migration remains pending; this task does not approve unrelated catalogue artwork.

At the time of this review, the changes were local and uncommitted.
