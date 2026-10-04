# Consistent rectangular opening corners

Column chooser and all eight Panel open/close meanings, in outline and solid, now use the same construction radius at equivalent right-angle frame and divider corners. This changes 18 exports. The construction radius is 1.5, matching the existing frame profile; export fitting and painted stroke determine the visible radius. This is a local family decision, not a universal radius token.

Frame dimensions, arrow paths, simulated text and stroke weights are retained. Final generated React bounds match before and after across 144 comparisons (retained-bounds.json). The fit manifest is unchanged.

## Visual review

The six family-light/dark sheets cover all 18 exports at 12/14/16px DPR1, enlarged themed contours, a 4× enlargement of the exact 12px raster, baked SVG masks and Salt Button context. They use actual generated React components and the Salt theme from this checkout, rendered in an isolated Vite harness. Storybook has missing Roboto CSS dependencies; the harness imports the same production components without those unrelated font imports.

An independent agent recommends retaining the changes: equivalent corners look consistently restrained, with no visible movement, crowding or recognition regression. This is a consistency improvement; it does not establish a general sharpness gain. Chrome DPR1 captures do not prove identical results on every physical monitor.

Mobile page QA passed all 18 entries at 320px and 390px in both themes (72 combinations), including raster dimensions, actual SVG painting, navigation and browser errors. The private comparison is published at https://salt-icons-review-0909.joshuawooding.chatgpt.site/corner-consistency.

## Assessment of the supplied photo

The Curve Connections photo supports smaller transitions for acute recesses and broader transitions for obtuse recesses. Equivalent geometry should not receive different rounding merely because it is described as a frame or a divider. X is not defined for this system-icon context, so the diagram cannot supply literal pixel radii.

Announcement was tested with smaller acute transitions, then smaller acute and broader obtuse transitions, while straight geometry, stroke and fit stayed fixed. Neither trial clearly improved 12/14/16px clarity; broader rounding also consumed the throat opening. The current Announcement remains unchanged. The two announcement-trial images preserve that comparison. No wider radius replacement or global helper change was made.

## Validation

Generation refreshed numeric SVGs, React components, CSS masks and source hashes. Its first component-build pass encountered a Windows file-open error on the aggregate index; a complete build:icons retry succeeded (build-retry.log). The registration check passed for all 9 meanings and 18 variants, without errors or warnings.

The final-paint regression selects enclosed openings by their rendered area, compares mirrored corner profiles, and allows one high-resolution capture pixel at boundaries to avoid subpixel-phase false alarms. It covers the Column chooser lower openings in both variants, all panel main openings and the corrected Split view across five supported widths. It protects equivalent rectangular corners; it does not select an ideal radius or validate arbitrary angled joins.

The previous artwork fails 90 of the 95 icon/weight checks; the revised artwork passes all 95. Before/after proof results are retained alongside this note.

The full validate:icons command passed across all 550 exports with no reported failures or warnings (validation.log). This runs the existing automated coverage; the catalogue still contains unclassified pair-contour reviews, so it does not establish a fresh whole-catalogue visual approval.
