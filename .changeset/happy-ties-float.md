---
"@salt-ds/core": patch
---

When Link is set to `color="inherit"` its hover, active and focus colors will now also be inherited.
Fixed status colors being included in Link's `color` type. This was accidentally added when status color support was added to Text. If you need to achieve this behaviour you can use `color="inherit"`.
