# Building frame spacing and crescent refinement

Six exports changed: Building, Buildings, Hospital and Storefront outlines, plus both Dark variants. All four solid building SVGs are byte-equivalent after line-ending normalization to the preceding aperture-corrections pass. The before snapshot includes those four unchanged solids for pair comparison.

The earlier spacing check compared solid apertures only. It missed the visible space consumed by two outlined Storefront frames. Outline doorways are now modestly narrower to reduce their apparent width; solid doorways retain their readable clear openings. Storefront narrows toward its right jamb to leave more room beside the window, while preserving that window, the wall and the threshold. Other building doorway centres are unchanged. The canonical design guidance now explains this optical compensation and requires separate outline and solid spacing review.

At the standard 4/3-unit component stroke, visible outline window-to-door gaps in the final 16-unit canvas are:

| Export | Clear gap |
| --- | ---: |
| building.svg | 1.44 |
| buildings.svg | 1.42 |
| hospital.svg | 1.46 |
| storefront.svg | 1.01 |

These are local optical checks, not a universal token. The outline frame and solid aperture have different painted relationships; their raw distances are not forced to match. The Storefront window still has identical complete apertures in both variants. Its narrower outline door stays within the solid opening at every tested weight.

The moon now uses intersecting circular arcs with a diagonal cut that gives both horns a natural taper. Outline and solid share the same contour and final frame. An exploratory simplified Storefront window was rejected; the existing framed window is retained.

## Validation and scope

All 550 exports pass validation. All 96 artwork tests and 18 browser component tests pass. Integration passes for five meanings and ten variants. The new visible-gap and frame-width checks reject 16 measurements in the preceding artwork; the current features, doorway joins and Storefront pair checks pass. The corner report was refreshed for six changed exports. Broad approval remains seven corner reviews and 6 of 185 pair-contour reviews; this focused pass does not claim catalogue-wide visual approval.

Actual Storybook React markup and generated CSS masks were checked across 400 size/weight/background/DPR combinations: ten exports, 12px/16px, four component widths (0.67, 1, 4/3 and 1.5), baked masks, light/dark, DPR1/2. Native sheets and actual Salt button contexts were inspected. Temporary capture waits initially selected a hidden Storybook control; the completed review selects visible Salt buttons. The phone comparison fits a 390px viewport without horizontal overflow. No human recognition study or independent visual approval is claimed.

[Mobile comparison](https://salt-icons-review-0909.joshuawooding.chatgpt.site/building-spacing.html). Private Site source f953c417eba29e3ae1fddd56e6cf5c5b4f03fd09; deployment appgdep_6ab530436e2c819187912f4f56f91dac succeeded at 2026-09-24T14:14:51Z. Salt repository changes were uncommitted when this review was recorded.
