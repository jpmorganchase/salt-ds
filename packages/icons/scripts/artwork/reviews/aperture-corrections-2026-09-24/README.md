# Clear openings and crescent corrections

Follow-up: [building spacing and moon refinement](../building-spacing-2026-09-24/README.md) subsequently narrows the outline doors and refines the moon. The solid building drawings from this pass are retained.

This pass corrects twelve exports across Building, Buildings, Hospital, Storefront, Calculator and Dark, following the earlier family-alignment review. The before snapshot is the preceding uncommitted pass, not repository HEAD. The prior shared standing figures and Cloud sync changes are retained.

Entrances are wider and taller, and nearby windows are repositioned to provide comparable clear window-to-door spacing. The four solid building gaps measure 2.79–2.93 units in the final 16-unit coordinate system at component width 4/3. Doorway clear widths remain at least 2 units at all four checked weights. These are local family checks, not a universal spacing rule for every icon. Outline and solid share their entrance geometry.

The calculator display is wider and taller, with keys moved down to preserve separation. The crescent is constructed from two circular arcs with a deeper inner cut and standard miter limit; the earlier near-tangent contour with extended miter tips is removed. Structural stroke weight is preserved.

## Validation

All 550 exports pass artwork validation. All 96 artwork tests and 18 browser component tests pass. New clear-opening and spacing checks reject 42 measurements in the preceding artwork; the revised set passes. Building corner probes follow the resized entrance. Storefront's obsolete mass-center scan was removed because it included a neighboring wall; its complete aperture-contour comparison at four weights remains in place and passes.

Actual Storybook React markup and CSS masks were checked in 640 size/weight/background/DPR combinations across 16 exports: the twelve revised exports plus Home and Bank pairs. Checks covered 12px/16px, component widths 0.67, 1, 4/3 and 1.5, baked CSS masks, light/dark backgrounds, and DPR1/2. Native sheets and Salt button contexts were visually inspected. The phone comparison has no horizontal overflow at 390px. Human recognition testing and independent visual approval were not performed.

The corner map was refreshed for the twelve changed exports. Broad catalogue corner approval remains seven exports; 6 of 185 pair contour reviews are approved. Passing automated checks does not establish whole-catalogue visual approval. The separately requested source autoreview still awaits permission after automatic approval review blocked that transfer; no further transfer was attempted.

[Mobile comparison](https://salt-icons-review-0909.joshuawooding.chatgpt.site/aperture-corrections.html). Private Site source 8fc8429f6c0079cfcb52ba69ec122dc9b4f51f17; deployment appgdep_6ab5273cfbac8191836ab4e4463186a3 succeeded at 2026-09-24T13:36:28Z. Salt repository changes were uncommitted when this review was recorded.
