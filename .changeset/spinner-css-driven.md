---
"@salt-ds/core": patch
---

- Refactored `Spinner` so its size and stroke width are driven by CSS density tokens rather than computed in JavaScript. Density changes no longer cause `Spinner` to re-render.
- Fixed the small `Spinner` rendering at a smaller size than intended in high density.
