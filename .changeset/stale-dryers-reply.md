---
"@salt-ds/core": patch
---

Remove `onPillRemove` support from ComboBox API since ComboBox already has an `onSelectionChange` callback which can be used to detect the removed pill.
