---
"@salt-ds/core": patch
---

Fixed browser API usage to respect the `WindowProvider` target and element owner documents. `BreakpointProvider`, `ViewportProvider`, and `useResizeObserver` now resolve APIs such as `matchMedia`, `ResizeObserver`, and animation frames from the appropriate window when rendered in secondary windows such as iframes.
