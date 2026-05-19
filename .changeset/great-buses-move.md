---
"@salt-ds/lab": patch
---

Fix `SidePanel` animation, focus behaviour, and width handling.

- `--saltSidePanel-width` now accepts any CSS length, including percentages (`20%`), `clamp()`, `vw`, and `rem`.
- Tabbing into, through, and out of an open panel now works in both directions, including for custom triggers registered via `setTriggerRef` (e.g. table rows). Focus no longer gets trapped or lost.
