---
"@salt-ds/core": patch
---

Fixed `ListBox`, `Dropdown`, and `ComboBox` scrolling the page when navigating with the keyboard.

`preventDefault` was only called when the highlighted option actually changed, so pressing ArrowUp on the first option, ArrowDown on the last option, or Home and End when already at that end, let the browser scroll the page instead of doing nothing.

`ComboBox` also scrolled the page when ArrowDown or ArrowUp was used to open the list.

In `ComboBox`, Home and End are unchanged, because it is an editable text field where those keys also move the caret.
