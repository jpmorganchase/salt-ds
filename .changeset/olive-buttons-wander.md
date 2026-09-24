---
"@salt-ds/core": patch
---

Fixed `ToggleButtonGroup` keyboard navigation so arrow keys no longer scroll the page.

Fixed selection when `ToggleButton` components use numeric `value` props. The selected button is now correctly conveyed to assistive technologies, and selecting it again no longer triggers `onChange`.

`ToggleButton` no longer adds an unsupported `readOnly` attribute to its underlying button. Read-only state remains available to assistive technologies.
