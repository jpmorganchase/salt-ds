---
"@salt-ds/core": patch
---

Updated `InteractableCard` disabled styling to apply `opacity: 0.4` at the card level.

This may introduce a visual regression for apps that relied on the previous per-variant disabled appearance or on disabled tokens applied to nested content.
