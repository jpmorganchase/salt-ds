# Empty calendar field — 24 September 2026

The user selected the empty date field after comparing eight dates, six dates and an empty field at native sizes. This is an accepted simplification preference, not a repair to Calendar's shell.

## Design and implementation

Remove all eight positive date squares from Calendar and all inverse date counters from CalendarSolid. Keep the shared frame, header, bindings, welds, stroke weights and export frame. CalendarSolid fills only the date field. Schedule continues to place its unchanged plus inside the same shell; Schedule time remains the separate document-and-clock meaning.

The owning recipe is reference-frames.mjs. Generated SVGs, React components and CSS masks are included. Names, inventory, synonyms and categories are unchanged. The public design guide now explains the empty field.

The Calendar pair declares the existing component-exteriors contract: filling the date field must retain the shell. This is checked at all four audit weights. The family check still compares Calendar and Schedule outside the date field.

## Review evidence

- before.json and after.json retain the affected pair and three scheduling siblings. The scheduling SVGs are byte-identical.
- native-family.png compares preceding and selected artwork in matching Salt Button contexts at 12, 14 and 16px, with a 64px construction view. It includes light/dark surfaces, baked CSS masks, Schedule and both Schedule time variants.
- Primary component widths are 4/3 at 12px, 8/7 at 14px and 1 at 16px. Additional 12px rows inspect the 0.67 reference and 1.5 fitting widths. CSS masks retain baked widths.
- component-metrics.json records 36 generated-component measurements. Captures use Chrome at DPR 1. This is a focused native-size review, not a full multiplier or high-DPI review.
- phone-selected.png and page-checks.json record the mobile comparison: selected option first, live/raster controls, no horizontal overflow at 390px and no page errors.

An independent read-only agent inspected the same-background native sheet and generated diff. No concrete regression was found: the empty outline is less busy; the solid body is uninterrupted; retained landmarks, Schedule's plus and apparent size remain consistent. The solid naturally has more visual mass and the existing header remains dominant. This is expert visual judgment, not user recognition testing or approval of the entire set.

## Checks

Full package regeneration and validation passed for all 550 exports. No geometry, family, contour, stroke, clearance or bounds failures were reported. The pair audit has 8 declared passes and 177 unclassified pairs; those unclassified pairs remain needs-review.

The integration checker passed Calendar and Schedule: 3 variants, zero errors. It reported one existing Schedule synonym containing whitespace; artwork-only scope leaves this unrelated metadata warning unchanged. The full validation output is retained in validation.log. The working diff passed whitespace checks.

[Phone comparison](https://salt-icons-review-0909.joshuawooding.chatgpt.site/calendar-study.html)
