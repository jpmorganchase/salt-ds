---
"@salt-ds/theme": patch
---

Updated status background selected tokens to differentiate them from the status background tokens.

```diff
- --salt-status-success-background-selected: var(--salt-palette-positive-weakest);
- --salt-status-warning-background-selected: var(--salt-palette-warning-weakest);
- --salt-status-error-background-selected: var(--salt-palette-negative-weakest);
+ --salt-status-success-background-selected: var(--salt-palette-positive-weaker);
+ --salt-status-warning-background-selected: var(--salt-palette-warning-weaker);
+ --salt-status-error-background-selected: var(--salt-palette-negative-weaker);
```
