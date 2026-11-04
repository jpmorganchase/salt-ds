---
"@salt-ds/core": patch
---

Fixed `Slider` and `RangeSlider` to align with their Figma designs.

- Fixed the labels of marks at the minimum and maximum values being centered on their marks by default. `constrainLabelPosition` now defaults to `true`, so these labels align to the ends of the track. Set `constrainLabelPosition` to `false` to keep them centered.
- Mark labels now sit `--salt-spacing-50` below the ticks at all densities. The slider's height now includes the mark labels, including inside a `FormField`, so they no longer overflow into the content below.
- The thumb now stays within the track at the minimum and maximum values, and ticks and mark labels line up with it.
- Only ticks and mark labels at the minimum and maximum values are aligned to the ends of the track. Previously, the first and last ticks, and the first and last mark labels when `constrainLabelPosition` was set, were offset from their values even when they weren't at the minimum or maximum.
- The value tooltip now matches `Tooltip`'s height, padding, arrow size and offset from the thumb at all densities.
- Corrected the prop documentation: `max` defaults to `100`, and `format` isn't applied to `minLabel`, `maxLabel` or `marks`.
