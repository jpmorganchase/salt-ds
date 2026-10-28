---
"@salt-ds/core": patch
"@salt-ds/date-components": patch
---

Added a development warning when a form control's `aria-label` is ignored because a `FormFieldLabel` provides its accessible name. The warning suggests using `aria-labelledby` to add to the name, or `aria-describedby` to add a description.

This applies to `Input`, `MultilineInput`, `NumberInput`, `ComboBox`, `Dropdown`, `Checkbox`, `RadioButton`, `Switch`, `Slider`, `RangeSlider`, `Rating`, `CheckboxGroup`, `RadioButtonGroup`, `PillGroup` and `DateInputSingle`.
