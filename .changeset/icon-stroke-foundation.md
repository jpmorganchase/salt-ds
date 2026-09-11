---
"@salt-ds/theme": patch
"@salt-ds/icons": patch
---

Added `--salt-size-icon-strokeWidth` to control the weight of generated inline icon strokes, with a unitless default of `1` across densities for improved legibility at component sizes. Added the per-icon `--saltIcon-strokeWidth` override while preserving proportional secondary strokes. Changing stroke width preserves the fitted filled contours and official brand shapes. Standalone SVGs and CSS background mask assets retain their numeric 0.67-unit reference strokes.

Fitted each ordinary icon export independently to a centered 15.5-unit longest painted dimension at stroke width 1.5 within its 16-unit viewBox. The generator preserves aspect ratios and stroke weights, gives filled variants the same extent target as outlines, and keeps aliases identical. Official brand marks and the full-canvas solid checkmark control surfaces retain their existing 16-unit frames. This also normalizes legacy compact icons to the common frame and improves legibility at component sizes.

Artwork generation now uses installed Chrome through Playwright to measure paint and produces a fit manifest for geometry regression and occupancy checks. Added the All Icon View Boxes Storybook story for catalogue-wide size, background and stroke review.
