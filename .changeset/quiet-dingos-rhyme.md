---
"@salt-ds/core": patch
---

Fixed Dropdown and ComboBox throws error when moving focus via `keyDownCapture`, for example used as `cellRenderer` in Ag Grid. Closes #5011.
