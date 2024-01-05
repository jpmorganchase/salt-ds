---
"@salt-ds/core": patch
---

Added CSS API variable `--saltFormField-label-width`, replacing deprecated `--formField-label-width`

Usage should be changed:

```diff
- style={{ "--formField-label-width": "100px" } as CSSProperties}
+ style={{ "--saltFormField-label-width": "100px" } as CSSProperties}
```
