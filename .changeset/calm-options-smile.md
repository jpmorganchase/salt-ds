---
"@salt-ds/core": patch
---

Improve Dropdown, ComboBox, and ListBox responsiveness by isolating active,
focus-visible, and selected Option updates. Active styling now follows the
aria-active Option id, so duplicate-valued Options no longer all appear active.
