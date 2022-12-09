---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-theme": minor
---

Change to Scrim styling; remove variant prop from Scrim component

```diff
- --uitk-palette-opacity-primary-scrim
- --uitk-palette-opacity-secondary-scrim
- --uitk-palette-neutral-primary-background-scrim
- --uitk-palette-neutral-secondary-background-scrim
- --uitk-overlayable-primary-background
- --uitk-overlayable-secondary-background
+ --uitk-palette-neutral-background-backdrop
+ --uitk-overlayable-background: var(--uitk-palette-neutral-background-backdrop)
```
