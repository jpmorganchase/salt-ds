---
"@salt-ds/ag-grid-theme": patch
"@salt-ds/core": patch
"@salt-ds/countries": patch
"@salt-ds/embla-carousel": patch
"@salt-ds/lab": patch
"@salt-ds/theme": patch
---

Lowered the published CSS to Salt's supported browsers. Selectors that use `:is()` or a selector list in `:not()` now have `:-webkit-any()` fallbacks for Chrome and Edge before version 88, `inset` is expanded for Chrome 86, and `mask`, `user-select` and `text-decoration` have the `-webkit-` prefixes that Chrome and Safari need. `-webkit-appearance`, which no supported browser needs, is removed.
