# Secondary sparkle review — 24 September 2026

The upper-right star in Sparkle was nearly dot-sized at 12px. The artwork recipe now scales that star by 1.5 around its own centre and shifts it slightly toward the main star while preserving a clear gap. The outline and solid variants use the same secondary star. Sparkle refresh is unchanged.

The before and after variants were captured from Salt React icons inside buttons at 12, 14 and 16 CSS pixels with device pixel ratio 1, in light and dark contexts. The companion capture at 64px checks the vector silhouette and gap. At 12px the mark remains only a few pixels; this is an optical improvement, not a guarantee of star recognition on every low-resolution display.

Regeneration produced 550 SVGs and generated components. validate:icons passed, including pair and contour checks. Integration check passed for both Sparkle families (four variants, zero errors; two pre-existing synonym-whitespace warnings). git diff --check passed.

Native button capture: native-buttons.png. Current final 1× captures: current-rasters.json. Before and after SVGs are stored alongside this note.
