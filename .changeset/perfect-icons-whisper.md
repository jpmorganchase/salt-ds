---
"@salt-ds/ag-grid-theme": patch
"@salt-ds/countries": patch
"@salt-ds/icons": patch
"@salt-ds/theme": patch
"@salt-ds/core": patch
"@salt-ds/lab": patch
---

Marked CSS files as having side effects. This fixes Webpack tree-shaking CSS files when `sideEffects: true` is not set on style-loader rules.
