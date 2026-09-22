---
"@salt-ds/core": patch
---

Fixed ToggleButtonGroup arrow keys to select the focused option outside a toolbar, matching its radio-group semantics. Disabled options are skipped, read-only values remain unchanged, and toolbar navigation continues to move focus without changing selection.
