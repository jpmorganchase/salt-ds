---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-theme": minor
---

Change to Scrim styling; remove variant prop from Scrim component

```diff
- --uitk-opacity-5
- --uitk-palette-opacity-scrim-primary
- --uitk-palette-opacity-scrim-secondary
- --uitk-palette-neutral-primary-background-scrim
- --uitk-palette-neutral-secondary-background-scrim
- --uitk-overlayable-primary-background
- --uitk-overlayable-secondary-background
+ --uitk-palette-neutral-background-scrim
+ --uitk-overlayable-background: var(--uitk-palette-neutral-background-scrim)
```
