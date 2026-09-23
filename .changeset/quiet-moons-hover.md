---
"@salt-ds/core": patch
---

Fixed `Checkbox` and `RadioButton` showing hover styling when disabled. Pointing at a disabled checkbox or radio button changed its border and tick color to the interactive hover color, making it look selectable. Disabled controls now keep their resting appearance on hover.
