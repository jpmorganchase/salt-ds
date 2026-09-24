# Standing figures and pictogram details

Follow-up: doorway size, window-to-door spacing, the calculator display and crescent tips were subsequently corrected. See [the aperture corrections review](../aperture-corrections-2026-09-24/README.md) for current artwork and evidence. This page records the earlier pass.

Baseline: fe5c583fa. Twenty exports across ten meanings changed.

Man, Woman and Man–woman now reuse the same figures, head dimensions, shoulder level, leg width and foot line. Both standalone and combined versions retain the same construction and optical frame. The combined painted bounding box is slightly right of the shared head grid because the dress is wider than the straight garment.

The moon is a lighter crescent whose two circle intersections form clean tips. Calculator keys have larger, regularly spaced paint and its display aperture is shared. Cloud sync uses shorter heads and closer, raised arrow rows. Its solid clearance is rebuilt from the actual foreground; the tiny detached cloud sliver between the arrows is removed.

Building, Buildings, Hospital and Storefront use continuous open entrance thresholds. Doorways are rectangular with restrained inner corners; Home already follows this treatment. Bank's deliberate architectural arch and plinth remain unchanged. Storefront's window and door now share the primary structural weight.

These were family inconsistencies and optical refinements, not changes to icon meaning or metadata. Before-and-after visual comparisons cover the changed exports plus Home, Cloud upload and Cloud download at 12px and 16px on light and dark backgrounds and enlarged. Human recognition testing has not been performed.

The cloud construction evidence is reproducible with Python fonttools 4.61.1 and skia-pathops 0.9.2: run cloud-build.py beside cloud-input.json. The input contains the real foreground and rim paint from the vector helpers. It creates cloud-result.json; no Python dependency is required for ordinary package generation. The source construction uses a 0.75-unit foreground clearance at midpoint width 7/6.

Validation: all 550 exports pass artwork validation. All 96 artwork tests and 18 browser component tests pass. Integration passes for all ten meanings and twenty variants, with no metadata changes. Focused geometry checks pass. The new family check rejects the prior exports in 25 measurements; the open-threshold check rejects the old Storefront in eight measurements.

Actual Storybook React markup and CSS masks were checked in 960 size/weight/background/DPR combinations across 24 exports: 12px and 16px; component widths 0.67, 1, 4/3 and 1.5; baked masks; light/dark; DPR1/2. Native sheets and temporary Salt button contexts were visually inspected. No human or independent visual recognition approval is claimed. Mobile comparison has no horizontal overflow at 390px. A final regeneration reproduces the same reviewed SVGs exactly.

The corner map was refreshed for the twenty changed exports. Broad catalogue corner approval remains seven exports; this focused review does not establish whole-catalogue visual approval. A separate source autoreview was blocked by automatic approval review pending explicit permission to transfer the selected source files to another reviewer; local source and visual checks were completed.

[Mobile comparison](https://salt-icons-review-0909.joshuawooding.chatgpt.site/family-alignment.html). Published private Site source d47d6ae2d53dbd62597f3ab83618c89a49a846aa; deployment appgdep_6ab51a5a4dfc8191a50dc229b8d2b24d succeeded on 24 September 2026. Salt repository changes were uncommitted when this review was recorded.
