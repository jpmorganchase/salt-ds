---
"@salt-ds/react-resizable-panels-theme": minor
---

Added support for `react-resizable-panels` v4. Version 3 is still supported, and the theme styles both versions.

`react-resizable-panels` v4 requires React 18 or later. Applications using React 16 or 17 must stay on `react-resizable-panels` v3.

For v4 panels that can resize to zero, set `data-panel-collapsed` from `onResize` to preserve border overlap when collapsed. Version 3 continues to work without this attribute.
