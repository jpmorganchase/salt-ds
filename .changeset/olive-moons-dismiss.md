---
"@salt-ds/core": patch
---

Fixed `disableDismiss` on `Drawer` also preventing <kbd>Escape</kbd> from closing the drawer. It now only prevents dismissal on click away, matching its documentation and `Dialog`.
