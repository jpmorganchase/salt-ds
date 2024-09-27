---
"@salt-ds/ag-grid-theme": patch
---

Fixed `.editable-cell` incorrectly setting text-align. For numeric columns, use both `.edtiable-cell` and `.numeric-cell` for `cellClass`. Fixes #4141.
