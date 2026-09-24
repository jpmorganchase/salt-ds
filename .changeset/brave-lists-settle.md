---
"@salt-ds/core": patch
---

Fixed `ListBox` and `Dropdown` unexpectedly scrolling the page during keyboard navigation, including when navigation reaches the first or last option.

`ComboBox` now prevents PageUp and PageDown from scrolling the page when navigation cannot move beyond the first or last option.
