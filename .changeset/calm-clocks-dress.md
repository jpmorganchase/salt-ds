---
"@jpmorganchase/uitk-theme": minor
---

Tweak palette disabled token used in editable

```diff
- --uitk-editable-background-disabled-low: var(--uitk-palette-interact-background-low)
+ --uitk-palette-interact-background-disabled-low
+ --uitk-editable-background-disabled-low: var(--uitk-palette-interact-background-disabled-low)
```
