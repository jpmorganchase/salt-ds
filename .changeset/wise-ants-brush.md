---
"@salt-ds/core": patch
---

Fixed ComboBox having 2 popup lists due to browser's default `autoComplete` behaviour on `input`.
You can still enable it via `inputProps={{autoComplete: "on"}}` if needed.
