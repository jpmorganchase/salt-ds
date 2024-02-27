---
"@salt-ds/lab": minor
---

- Added `valueToString` to `DropdownNext` and `ComboBoxNext`. This replaces the `textValue` prop on `Option`s. This is needed when the value is different to the display value, or the value is not a string.
- Removed `defaultValue` from `DropdownNext`.
- Mousing over options will now set them to active.
- Clearing the input will clear the list of active items.
- `Option` will now use the value or the result from `valueToString` as its default children.
