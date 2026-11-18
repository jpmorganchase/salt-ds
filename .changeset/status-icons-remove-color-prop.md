---
"@salt-ds/core": patch
---

Removed `color` from the props of `StatusIndicator` and `StatusAdornment`. They had inherited it from `Icon` by mistake. On `StatusIndicator`, setting it replaced the color that `status` sets, and on `StatusAdornment` it had no effect. To change the color of a status indicator, set `--saltStatusIndicator-color`.
