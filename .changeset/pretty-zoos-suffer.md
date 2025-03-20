---
"@salt-ds/lab": patch
---

Slider / RangeSlider updates

- track now support tick marks with the `showTicks` prop.
- `restrictToMarks` prop will snap the value to the closest mark.
- `decimalPlaces` prop specifies the number of decimal places for the value.
- `constrainLabelPosition` will ensure that mark labels remain within the boundary of the track.

This represents the final feature set before we move these changes to a stable API in core.
