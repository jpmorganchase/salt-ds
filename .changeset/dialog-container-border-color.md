---
"@salt-ds/core": patch
---

Updated `Dialog` border color to use `--salt-container-borderColor` instead of `--salt-separable-tertiary-borderColor`, to align with design.

The visible change is limited to the Legacy theme. In JPM Brand (Salt Next) and Salt (Interim) both tokens resolve to the same value, so there is no visual difference. In the Legacy theme, the `Dialog` border now uses the solid container border color used by `Card`, instead of the translucent separable border color.
