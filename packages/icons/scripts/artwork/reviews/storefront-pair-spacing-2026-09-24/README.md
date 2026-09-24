# Storefront pair and lettering spacing review

The earlier Storefront repair removed the threshold notch but left independently sized window and door openings. Both variants now share the window and door contours, their rims, the side walls and ground joins. Solid fills the wall and canopy behind that shared construction. The complete clear openings agree at widths 0.67, 1, 4/3 and 1.5; matching only their centers was insufficient. The contour-following clearance below the canopy is retained.

CC was positioned using two fixed centers inherited from the previous drawing. It now uses the same Roboto advance-plus-tracking method as the other labels and is centered as one label. The positive, inverse and disabled variants retain that spacing. The disabled slash clearance is regenerated from the shifted letter outlines.

All 36 lettering exports were reviewed at native 12px and 16px, on light and dark backgrounds, with enlarged details. CC was the spacing outlier; the other 32 lettering exports retain their current spacing. File labels (CSV/PDF/XLS/ZIP), replay and forward numbers, alphabetical/numeric sorting, string labels, type and text commands are included. Typeface advances plus the shared tracking preserve natural letter rhythm; equal visible gaps are not the target. The conventional italic I and brand marks remain unchanged.

Validation: all 550 SVGs pass the artwork validator. All 96 artwork tests and 18 browser component tests pass. Integration checks pass for three meanings / six variants, with four pre-existing whitespace-synonym warnings; metadata is unchanged. Focused checks pass 24 Storefront pair measurements, four doorway threshold measurements, 364 cutout-composite measurements and five disabled-cutout checks. The new full-opening comparison fails the prior Storefront pair in 20 measurements, so it detects the observed mismatch. Actual React and CSS-mask surfaces were checked in 240 combinations across 12px/16px, light/dark, DPR1/2 and configurable/baked widths. Native component contact sheets were visually inspected. A focused source autoreview returned no actionable findings.

The mobile layout has no horizontal overflow at 390px. The corner map was regenerated, but broader review coverage is still 7 approved corner reviews and 6 approved pairs of 185. This focused pass does not claim visual approval of the whole catalogue.

[Mobile comparison](https://salt-icons-review-0909.joshuawooding.chatgpt.site/storefront-lettering.html)

Published private review source: 316829d0a574497b496ca846007cf351d0e37339. Deployment appgdep_6ab4f9fda8388191947ccc5dbc878886 succeeded on 24 September 2026.
