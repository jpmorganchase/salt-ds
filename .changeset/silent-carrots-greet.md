---
"@salt-ds/lab": minor
---

Updated the `NumberInput`:

1. Added support for `format` and `parse` callbacks for formatting capabilities.
2. Added `clampValue` prop to allow enforcement of values within the min and max range.
3. Refactored `stepBlock` prop to be `stepMultiplier` to be consistent with `Slider` and `RangeSlider` components and to ensure that valid values remain reachable.
4. Refactored `decimalPlaces` to be `decimalScale`.

Example:

```diff
<NumberInput
+ format={(value) => `${value}%`}
+ parse={(value) => String(value).replace(/%/g, "")}
- decimalPlaces={2}
+ decimalScale={2}
- stepBlock={10}
+ stepMultiplier={4}
  min={0}
  max={100}
+ clampValue={true}
  defaultValue={20}
/>
```
