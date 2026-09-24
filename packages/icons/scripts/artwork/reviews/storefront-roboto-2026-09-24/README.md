# Storefront doorway and Roboto lettering

The solid Storefront doorway had a notch at its threshold: outline jamb joins intruded into a differently sized solid cutout. The solid now has a closed aperture with its own softened corners and a continuous threshold; the outline is unchanged. The painted-output regression rejects the previous artwork at widths 0.67, 1, 4/3 and 1.5 and passes the corrected output at all four.

Shared labels now use Roboto v3.015 regular 400 and bold 700 at width 100, with proportional lining numerals. Natural glyph advances plus the existing tracking remain; the visible label is centred and timer capital height stays common across 5, 10, 15 and 30. File labels, string labels, sort controls, text commands and caption lettering share the new source. The conventional barred italic I is retained as a command symbol. Brand artwork is unchanged.

The font converter pins SHA-256 d7598e12c5dbef095ff8272cfc55da0250bd07fbdecbac8a530b9b277872a134, unions overlapping variable-font contours before even-odd SVG export and derives the caption slash clearance geometrically. Font provenance, license and regeneration instructions are in the source and maintenance guide.

Validation: 550 exported SVGs pass the complete validator; 96 artwork tests and 18 browser component tests pass. Integration checks cover 29 meanings / 37 variants with no errors and 10 pre-existing whitespace-synonym warnings. The changed 36 exports plus Storefront outline were inspected at 12px and 16px, weights 0.67/1/4/3/1.5, light/dark, DPR1/2 in actual React and CSS masks (1,480 samples). Painted React output agrees with numeric SVG geometry within the export rounding tolerance. Native DPR1 sheets and enlarged before/after details were visually inspected.

The corner map was regenerated from the new source. Existing broader pair-review coverage remains 6 approved of 185; this focused review does not claim the whole catalogue is visually approved. A focused 95,743-character source bundle passed autoreview with no actionable findings; generated exports were verified separately. The mobile layout has no overflow at 390px.

Review: https://salt-icons-review-0909.joshuawooding.chatgpt.site/storefront-lettering.html

Published source commit: b11a00784414f284b146e827022e1855418f2a6b. Private deployment appgdep_6ab4e5f0fd148191b3029d3952e5a390 succeeded on 24 September 2026.
