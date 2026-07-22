---
"@salt-ds/core": minor
---

Added a top-level `name` prop to form controls which map to underlying native inputs:

- `Input`, `MultilineInput`, `NumberInput`, `PillInput`, `ComboBox`, `Slider` and `FileDropZoneTrigger` accept `name`
- `FileDropZoneTrigger`: `name` is now applied to the hidden input instead of the button
- `RangeSlider` accepts `startName` and `endName`
- `Checkbox` now inherits `name` from `CheckboxGroup` when not set on the checkbox itself
