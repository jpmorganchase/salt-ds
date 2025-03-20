---
"@salt-ds/lab": patch
---

Slider / RangeSlider updates

Updated lab feature set and API for `Slider` and `RangeSlider`

- track now support tick marks with the `showTicks` prop.
- `restrictToMarks` prop will snap the value to the closest mark.
- `decimalPlaces` prop specifies the number of decimal places for the value.
- `constrainLabelPosition` will ensure that mark labels remain within the boundary of the track.
- updated slider examples and docs

This represents the final feature set before we move these changes to a stable API in core.
