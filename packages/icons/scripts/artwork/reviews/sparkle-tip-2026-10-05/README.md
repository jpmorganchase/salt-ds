# Sparkle upper-point correction

The numeric SVG already has a sharp point. SVGO rounded the main closed curve in the generated Sparkle and SparkleSolid components from a starting point of (7.995, 3.392) to a final endpoint of (7.996, 3.392). Closing that gap added a horizontal edge and changed the stroked join, visibly flattening the top.

The component optimizer now preserves path conversion and path merging for SVGs explicitly declaring a miter limit above 4. The existing brand policy and configurable stroke-width mapping are unchanged. Recipes, numeric masters, CSS masks, fitting, secondary sparkle size and welding guidance are unchanged. All four Sparkle family components were regenerated; the other 546 components have no content changes.

## Verification

- Compared actual React exports in Salt Buttons and captured SVGs at 12, 14 and 16px using the corresponding themed primary widths. Checked light and dark native images and enlarged contours.
- All four final React exports are pixel-identical to their numeric masters adjusted to the same stroke width at 0.67, 1, 8/7, 4/3 and 1.5 (20 high-resolution comparisons; see measurements.json).
- Both outline and solid regain the top point; Refresh siblings retain their silhouette.
- Full build:icons, validate:icons (550 exports), and test:artwork (104 tests) passed. The new regression cases cover curved closure, inherited miter limits and independent rounding during path merging. Ordinary and brand output policies are also checked.
- Integration check passed for sparkle and sparkle-refresh; two existing spaced-synonym warnings remain outside this geometric fix.
- Mobile comparison checked at 320px and 390px in light/dark for all four variants, including navigation and native image dimensions.

Chrome DPR1 images show the captured pixels, not a physical low-resolution monitor. High-resolution paint equality and scoped visual review do not establish complete visual approval of the catalogue.

The accompanying vectors show enlarged before/after geometry, mobile390-dark.png shows the native-size comparison, and buttons.png shows real component context.
