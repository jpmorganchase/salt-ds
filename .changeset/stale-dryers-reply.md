---
"@salt-ds/core": patch
---

Removed `onPillRemove` callback from the ComboBox's type definitions. `onPillRemove` has never been supported nor is it intended to be supported. `onSelectionChange` can be used instead to detect the removed pill.
