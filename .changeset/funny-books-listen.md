---
"@salt-ds/core": patch
---

Fixed a standalone `InteractableCard` ignoring the `tabIndex` prop. It now uses the `tabIndex` you pass, and still defaults to `0`.
