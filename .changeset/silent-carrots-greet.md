---
"@salt-ds/lab": patch
---

Added accessibility improvements to `NumberInput` including:

- Screen reader announcing correct values across all browsers.
- Screen reader announcing validation state of the `NumberInput`.
- Examples and stories of reset and sync adornments updated with proper screen reader support.

Refactored `stepBlock` prop to be `stepMultiplier` to be consistent with `Slider` and `RangeSlider` components and to ensure that valid values remain reachable.

Updates site documentation and prop descriptions.
