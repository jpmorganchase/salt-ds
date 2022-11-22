---
"@jpmorganchase/uitk-theme": minor
---

Change palette-interact-border, palette-interact-active, palette-interact-hover values

Light mode:

```diff
- --uitk-palette-interact-background-active: var(--uitk-color-blue-500);
- --uitk-palette-interact-background-hover: var(--uitk-color-blue-20);
- --uitk-palette-interact-border: var(--uitk-color-gray-90);
+ --uitk-palette-interact-background-active: var(--uitk-color-blue-30);
+ --uitk-palette-interact-background-hover: var(--uitk-color-blue-10);
+ --uitk-palette-interact-border: var(--uitk-color-gray-100);
```

Dark mode:

```diff
- --uitk-palette-interact-background-active: var(--uitk-color-blue-500);
- --uitk-palette-interact-border: var(--uitk-color-gray-90);
+ --uitk-palette-interact-background-active: var(--uitk-color-blue-700);
+ --uitk-palette-interact-border: var(--uitk-color-gray-200);
```

Remove selectable foreground state tokens and respective palette tokens

```diff
- --uitk-selectable-foreground-hover
- --uitk-selectable-foreground-selected
- --uitk-selectable-foreground-blurSelected
- --uitk-palette-interact-foreground-hover
- --uitk-palette-interact-foreground-active
- --uitk-palette-interact-foreground-blurSelected
```