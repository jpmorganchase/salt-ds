---
"@salt-ds/ag-grid-theme": patch
---

Fixed two AG Grid theme styling issues:

- Cell validation icons now show in Chrome and Edge before version 120, which only support the prefixed `-webkit-mask` property. Previously the icons showed as filled squares in these browsers.
- Header filter and menu icon margins are now scoped to Salt-themed grids. Previously they also applied to other AG Grid themes on the same page. Salt-themed grids are unchanged.
