# Corner consistency review - 23 September 2026

The shared default now covers angled straight turns, line/curve turns, negative fill corners and actual straight contacts across subpaths. Bank, Battery, Browser, Announcement, Warning and compact tick shoulders received targeted repairs. 361 of 550 SVG exports changed relative to the start-of-turn snapshot.

All 28 contact sheets were inspected: 550 exports at native 12px and 16px, four stroke widths, light and dark, with enlarged before/current comparisons. This confirms visual review coverage, not final corner approval. The strict new review contract remains open. Geometry/clearance validation passed and 73 artwork tests passed.

The independent final-paint scan records 3,120 inner-corner observations across four weights. These are neither unique defects nor an approval metric. Some describe legitimate inverse mark terminals or retained official logo contours; some are raster artifacts. They still need explicit decisions. A zero count does not prove completeness.

## Remaining decisions

- Crops: compound stem/leaf attachments and narrow leaf apertures. Preserve the preferred solid silhouette while developing tangent attachments.
- Globe: mixed-weight meridian/latitude contacts create residual direction changes, including at the poles.
- ChartLine and its legacy alias: marker/line attachments need a shared solution that preserves marker centers and outlined/solid identity.
- Document family: compact triangular fold openings need explicit small-size comparison; a triangle is not an automatic sharp exception.
- Shared inverse marks, including plus/tick/status faces: review negative-space terminals separately from the positive symbol's flat terminals, without silently exempting the whole semantic role.
- Other flags remain discoverable in the generated full catalogue report. No unreviewed candidate has been auto-approved.

SendSolid retains its original tapered seam because the generic filled-corner treatment closed the required opening and failed the existing taper/clearance regression. This is an unresolved exception decision until a saved rounded-versus-retained comparison is accepted; preserving the working seam does not waive review.

Use `audit:corners` for the live report and `check:corner-reviews` for strict completion. Old source contact records and previous B snapshots do not satisfy the new approval contract.

Generated component and CSS-mask spot checks covered 16 meanings and their available variants at 12px/16px and enlarged, on light/dark. Components were inspected at the standard 4/3 width; masks use the baked 0.67 width. All native dimensions were verified. See `evidence/surface-checks.json` for the exact checks.

The integration scan covered 251 changed meanings and 395 registered variants. Its nine missing website rows are existing deprecated aliases (LineChart pair, PieChart, StepSuccess, Success pair, SuccessSmall pair and SuccessTick), with replacements declared by the generator. They were not restored to the supported catalogue. The raw 99 warnings concern existing synonym whitespace; this artwork change does not alter search metadata.

Seven exports have current detailed approval: Announcement, AppSwitcher, Bank outline, Battery solid, Browser outline/solid and Warning outline. The other 543 exports remain pending; this is not a claim that all 543 are defective. The strict completion gate correctly exits unsuccessfully until the remaining decisions are resolved.
