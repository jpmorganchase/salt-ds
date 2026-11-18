---
"@salt-ds/core": patch
---

Keep active options synchronized with changing option collections in ComboBox, Dropdown and ListBox. Removed options can no longer be selected, and selection uses each option's current value and disabled state. Reordering options preserves the active option, and filtering preserves committed selections.

In Dropdown and ListBox, pressing ArrowDown when no option is active now moves to the first option instead of the second.

Report ComboBox and Dropdown popup expansion and relationships only while the popup is available, including when options disappear or the control becomes read-only.
