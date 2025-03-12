---
"@salt-ds/lab": minor
---

Updated the `NumberInput`:

1. Added support for `format` and `parse` callbacks for formatting capabilities.
2. Added `clampValue` prop to allow enforcement of values within the min and max range.
3. Refactored `stepBlock` prop to be `stepMultiplier` to be consistent with `Slider` and `RangeSlider` components and to ensure that valid values remain reachable.
4. Refactored `decimalPlaces` to be `decimalScale`.

Updated site documentation and prop descriptions.
