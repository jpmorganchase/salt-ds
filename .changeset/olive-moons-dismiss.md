---
"@salt-ds/core": patch
---

Fixed `disableDismiss` on `Drawer` also preventing Escape from closing the drawer. It now only prevents dismissal on click away, matching its documentation and `Dialog`.
