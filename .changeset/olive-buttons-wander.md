---
"@salt-ds/core": patch
---

Fixed `ToggleButtonGroup` keyboard navigation so arrow keys no longer scroll the page. Arrow keys pressed with Alt, Ctrl or Meta are left to the browser, so shortcuts such as history navigation still work.

Fixed selection when `ToggleButton` components use numeric `value` props. The selected button is now correctly conveyed to assistive technologies, and selecting it again no longer triggers `onChange`. A value of `0` no longer makes every button in the group a tab stop.

A `ToggleButtonGroup` can now be reached with Tab when its selected or focused button is disabled or removed, or when its value matches no button. Previously the group had no tab stop in these cases.

`ToggleButton` no longer adds an unsupported `readOnly` attribute to its underlying button.
