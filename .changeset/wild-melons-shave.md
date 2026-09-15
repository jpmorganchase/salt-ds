---
"@salt-ds/theme": patch
---

Updated `--salt-curve-0` from `0` to `0px`, so all curve tokens resolve to a length. This fixes `calc()` expressions such as `calc(var(--salt-palette-corner-weak) + 1px)`, which were invalid in themes where the corner token resolved to the previously unitless `--salt-curve-0`, as `calc()` cannot add a number to a length.
