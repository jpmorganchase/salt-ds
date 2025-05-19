---
"@salt-ds/core": patch
---

Remove `onPillRemove` callback from the ComboBox API. `onPillRemove` callback has never been supported nor is it intended to be supported in the ComboBox as the ComboBox already has an `onSelectionChange` callback which can be used to detect the removed pill.
