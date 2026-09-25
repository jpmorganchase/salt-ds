---
"@salt-ds/core": patch
---

Fixed `ListBox` and `Dropdown` unexpectedly scrolling the page during keyboard navigation, including when navigation reaches the first or last option.

`ComboBox` now prevents PageUp and PageDown from scrolling the page when navigation cannot move beyond the first or last option.

`Dropdown` now opens the list when Home or End is pressed while it is closed, and moves focus to the first or last option.

Fixed `Dropdown` moving focus away from the first option when it re-rendered while the list was open, or when a typed character matched the first option while opening the list.

While no list is shown, `Dropdown` and `ComboBox` leave PageUp and PageDown to the browser, and `ComboBox` also leaves Home and End, so these keys scroll the page or move the text cursor as normal instead of highlighting a hidden option.
