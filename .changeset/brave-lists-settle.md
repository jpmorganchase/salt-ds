---
"@salt-ds/core": patch
---

Fixed `ListBox`, `Dropdown`, and `ComboBox` unexpectedly scrolling the page during keyboard navigation, including when navigation reaches the first or last option.

Opening a `ComboBox` with ArrowUp or ArrowDown also no longer scrolls the page.
