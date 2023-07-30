---
"@salt-ds/core": patch
---

Make ToggleButton `value` prop optional instead of `undefined`. This fixes TS2741 error when using a later version of TypeScript.
