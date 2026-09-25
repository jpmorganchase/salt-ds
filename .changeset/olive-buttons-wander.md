---
"@salt-ds/core": patch
---

Fixed `ToggleButtonGroup` keyboard navigation so arrow keys no longer scroll the page. Arrow keys pressed with Alt, Ctrl or Meta are left to the browser, so shortcuts such as history navigation still work.

Fixed selection in uncontrolled `ToggleButtonGroup` components whose `ToggleButton` components use numeric or array `value` props. The selected button is now correctly conveyed to assistive technologies, and selecting it again no longer triggers `onChange`.

Fixed a `ToggleButtonGroup` having no tab stop when its selected or focused button is disabled or removed, or when its value matches no button. When no enabled button is selected, the group now has a single tab stop on the first enabled button. A value of `0` no longer makes every button in the group a tab stop.

`ToggleButton` no longer adds an unsupported `readOnly` attribute to its underlying button.
