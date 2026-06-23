---
"@salt-ds/core": patch
---

Fixed `mergeProps` discarding the host component's inline `style` when the render element supplied its own `style`. Both `style` objects are now shallow-merged, so CSS custom properties set internally by the component are preserved. Conflicting keys still resolve in favor of the render element's value.
