---
"@salt-ds/core": patch
---

Fixed `LinkButton` rendering 2px taller than `Button`. It now uses `box-sizing: border-box`, so its border is included in its `--salt-size-base` height.
