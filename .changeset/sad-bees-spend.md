---
"@salt-ds/core": minor
---

Added a top-level `name` prop to form controls which map to underlying native inputs:

- `Input`, `MultilineInput`, `NumberInput`, `PillInput`, `ComboBox`, `Slider`, `FileDropZoneTrigger`, and `DateInputSingle` accept `name`
- `RangeSlider` accepts `minName` and `maxName`
- `Checkbox` now inherits `name` from `CheckboxGroup` when not set on the checkbox itself
