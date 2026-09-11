---
"@salt-ds/theme": patch
"@salt-ds/icons": patch
---

Added `--salt-size-icon-strokeWidth` to control the weight of generated inline icon strokes, with unitless theme defaults of `1.5` in high and medium densities and `1` in low, touch and mobile densities. The 12px icons in high and medium density therefore render 1.125px primary strokes for improved visibility. Generated components retain a fallback of `1` when neither stroke variable is defined. Added the per-icon `--saltIcon-strokeWidth` override while preserving proportional secondary strokes. Changing stroke width preserves the fitted filled contours and official brand shapes. Standalone SVGs and CSS background mask assets retain their numeric 0.67-unit reference strokes.
