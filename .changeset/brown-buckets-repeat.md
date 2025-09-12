---
"@salt-ds/theme": minor
---

Updated action hover tokens to use their respective 100 (light) and 900 (dark) colors e.g.:

```diff
- --salt-palette-positive-action-hover: var(--salt-color-green-600);
+ --salt-palette-positive-action-hover: var(--salt-color-green-100);
```

```diff
- --salt-palette-positive-action-hover: var(--salt-color-green-600);
+ --salt-palette-positive-action-hover: var(--salt-color-green-900);
```
