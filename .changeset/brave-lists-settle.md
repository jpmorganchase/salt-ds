---
"@salt-ds/core": patch
---

Fixed `ListBox` and `Dropdown` unexpectedly scrolling the page during keyboard navigation, including when navigation reaches the first or last option.

`ComboBox` now prevents PageUp and PageDown from scrolling the page when navigation cannot move beyond the first or last option.

`Dropdown` and `ComboBox` no longer handle Home, End, PageUp, and PageDown while no list is shown, so these keys scroll the page or move the text cursor as normal instead of highlighting a hidden option.
