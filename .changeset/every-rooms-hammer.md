---
"@salt-ds/core": patch
---

Fixed `Dialog` not closing on `Escape` when `disableDismiss` was set. `disableDismiss` now only prevents dismissal via outside press, keeping `Escape` available so the dialog remains accessible.
