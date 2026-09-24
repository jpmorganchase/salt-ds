---
"@salt-ds/core": patch
---

Fixed `NumberInput` increment and decrement buttons remaining enabled inside a disabled `FormField`. The buttons now inherit the disabled state from the field.

Fixed keyboard navigation in a multiselect `ComboBox` so its selected pills form a single tab stop. Use the arrow keys to move between pills and Tab to leave the pill list.
