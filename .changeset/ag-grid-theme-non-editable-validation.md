---
"@salt-ds/ag-grid-theme": minor
---

Added cell validation support for non-editable cells. The `.error-cell`, `.warning-cell` and `.success-cell` classes no longer need `.editable-cell`, and show the status background, status adornment and focus ring color on any cell. When used together with `.editable-cell`, the editable border also reflects the validation state.
