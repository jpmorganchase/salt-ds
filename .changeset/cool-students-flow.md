---
"@jpmorganchase/uitk-theme": minor
---

Change `--uitk-palette-navigate-indicator-activeDisabled` to orange

Light mode:

```diff
- --uitk-palette-navigate-indicator-activeDisabled: var(--uitk-color-gray-90-fade-border)
+ --uitk-palette-navigate-indicator-activeDisabled: var(--uitk-color-orange-600-fade-border)
```

Dark mode:

```diff
- --uitk-palette-navigate-indicator-activeDisabled: var(--uitk-color-gray-90-fade-border)
+ --uitk-palette-navigate-indicator-activeDisabled: var(--uitk-color-orange-400-fade-border)
```

Add fade tokens

```diff
+ --uitk-color-orange-400-fade-border: rgba(238, 133, 43, var(--uitk-palette-opacity-border));
+ --uitk-color-orange-600-fade-border: rgba(224, 101, 25, var(--uitk-palette-opacity-border));
```
