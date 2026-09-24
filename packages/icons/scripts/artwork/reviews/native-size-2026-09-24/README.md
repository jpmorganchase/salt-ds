# Native-size review — 24 September 2026

The moon artwork in this record was subsequently superseded by the [upright crescent review](../carbon-moon-2026-09-24/README.md). Catalogue and library-comparison findings remain unchanged.

The review prioritises default-size clarity on a standard-density display. It does not introduce optical variants, change Salt density sizes or change shared stroke weights.

## Artwork change

Dark and DarkSolid now use a gentler inner arc, with shorter acute tip transitions and a slightly smaller inner fillet. The outer crescent remains shared between the two variants. The new declared pair relationship is checked at all four supported artwork weights.

Only these two icons changed. The geometry source is `../../a.mjs`; generated SVGs, React exports and CSS masks were regenerated. `before-after.json` retains the baseline and final SVGs.

Baseline: `98087a5cf3b8f4a2e968a575637b91d3db1fd207`.

## Coverage and findings

All 550 exports were visually scanned in the seven catalogue PNGs at 12px, 14px and 16px, on light and dark backgrounds, in Chrome at DPR 1. Each sheet also includes a 14px / 1 CSS pixel stroke comparison. That is 4,400 native renderings. These sheets were captured before the moon edit; no other icon geometry changed. The coverage JSON records the filenames on each sheet.

- The 14px low-density default is comparatively light: a 1-unit primary stroke in the 16-unit drawing renders at 0.875 CSS pixels. High/medium default to 12px with 4/3 units (approximately 1 CSS pixel); touch/mobile default to 16px with 1 unit (1 CSS pixel).
- A 1 CSS pixel comparison at 14px adds some contrast, but does not consistently make every stroke crisp. It is a review option, not an applied theme change.
- Print is relatively crisp at 12px. The family is not uniformly softer than the comparison libraries.
- Menu and text-like horizontal lines remain sensitive to pixel placement at 14px, including in the matched-weight comparison.
- Calendar details, table/column controls, dashboard ticks, globe grids, small file labels and timer numbers deserve focused follow-up. Their detail density and gaps matter; thicker strokes alone can worsen crowding.
- Curves and diagonals use antialiasing in every library examined. Recognition, apparent weight, occupied area and detail must be judged separately from edge smoothness.

This is a visual scan and a focused moon repair, not blanket design approval or a measured recognition study. Existing pending corner/pair reviews remain pending.

## Library comparison

Twelve shared meanings were compared at 12, 14 and 16px: moon, sun, clock, heart, print, calendar, cloud, refresh, close, right arrow, document and add.

Sources are recorded per SVG in `references.json`, with their licences alongside it:

- [Lucide](https://github.com/lucide-icons/lucide/tree/66d8f9fc394b8530377e5f6112f0b8908ba01280/icons), pinned commit `66d8f9fc394b8530377e5f6112f0b8908ba01280`.
- [Tabler](https://github.com/tabler/tabler-icons/tree/0239805680a36bab4e1070529b6744924402d804/icons/outline), pinned commit `0239805680a36bab4e1070529b6744924402d804`.
- [Carbon](https://unpkg.com/browse/@carbon/icons@11.89.0/svg/), published `@carbon/icons@11.89.0`. Moon, Sun and Arrow right use 16-unit sources; the remaining examples use 32-unit sources. The repository commit in the provenance records the repository lookup, not the provenance of these published SVGs.

Lucide and Tabler use a default 2-unit stroke in a 24-unit drawing: 1px at 12px, about 1.167px at 14px and about 1.333px at 16px. Their heavier defaults and different detail/rounded ends explain some of the apparent clarity difference. Matching to a 1 CSS pixel primary stroke narrows the difference but does not remove normal antialiasing.

Carbon has filled contours rather than an adjustable live stroke, so its weight is unchanged in the matched comparison. The 12px and 14px Carbon samples are scaled stress comparisons, not endorsed native sizes. Shapes retain each library's own occupied area. The PNG benchmarks include the baseline moon; the interactive review includes the revised moon.

## Component and export checks

The revised moon was checked using actual generated React SVG markup and Salt button styles at high, medium, low and touch density, on both backgrounds at DPR 1 and DPR 2. The 64 component samples had their dimensions and theme weights verified; 64 accompanying baked CSS-mask samples were also viewed. The two screenshots and `context-metrics.json` preserve this evidence. Baked masks keep their reference weight.

Native supported-weight sheets additionally compare both moon variants, before and revised, at 12/14/16px and artwork widths 0.67, 1, 4/3 and 1.5 on both backgrounds. Enlargement is only a construction diagnostic after native review.

The new taper looks more even without closing the crescent opening. The change is modest; normal low-resolution antialiasing remains.

Checks passed:

- All 550 generated exports passed icon validation; see `validation.json`.
- The dark pair contour contract passed. Coverage remains 7 declared passing pairs and 178 pairs needing review; this change does not approve those pairs.
- 96 artwork tests and 18 browser component tests passed.
- Dark/DarkSolid integration checks reported no errors or warnings.

## Review surface

The phone review page offers native 12/14/16px, captured DPR-1 pixels or live SVG, library defaults or a 1 CSS pixel comparison, light/dark backgrounds and optional magnification of the same captured pixels. A searchable gallery contains all 550 current generated exports.

[Native-size review](https://salt-icons-review-0909.joshuawooding.chatgpt.site/native-size-review.html)

Captured pixels use a fixed origin and Chrome rasterisation. Real layout placement, device scaling, browser and zoom can affect the result. Keep the final decision grounded in actual components at 100% zoom.
