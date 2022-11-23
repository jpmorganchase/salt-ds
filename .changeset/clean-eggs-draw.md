---
"@jpmorganchase/uitk-theme": minor
---

Change palette-interact values

Light mode:

```diff
- --uitk-palette-interact-background-active: var(--uitk-color-blue-500);
- --uitk-palette-interact-background-hover: var(--uitk-color-blue-20);
- --uitk-palette-interact-border: var(--uitk-color-gray-90);
- --uitk-palette-interact-border-active: var(--uitk-color-blue-400);
- --uitk-palette-interact-border-activeDisabled: var(--uitk-color-blue-400-fade-fill);
- --uitk-palette-interact-border-disabled: var(--uitk-color-grey-90);
- --uitk-palette-interact-border-readonly: var(--uitk-color-gray-90-fade-border-readonly);
+ --uitk-palette-interact-background-active: var(--uitk-color-blue-30);
+ --uitk-palette-interact-background-hover: var(--uitk-color-blue-10);
+ --uitk-palette-interact-border: var(--uitk-color-gray-200);
+ --uitk-palette-interact-border-active: var(--uitk-color-blue-600);
+ --uitk-palette-interact-border-activeDisabled: var(--uitk-color-blue-600-fade-fill);
+ --uitk-palette-interact-border-disabled: var(--uitk-color-grey-200);
+ --uitk-palette-interact-border-readonly: var(--uitk-color-gray-200-fade-border-readonly);
```

Dark mode:

```diff
- --uitk-palette-interact-background-active: var(--uitk-color-blue-500);
- --uitk-palette-interact-border-active: var(--uitk-color-blue-600);
- --uitk-palette-interact-border-activeDisabled: var(--uitk-color-blue-600-fade-fill);
- --uitk-palette-interact-foreground-partial: var(--uitk-color-blue-400);
- --uitk-palette-interact-foreground-partialDisabled: var(--uitk-color-blue-400-fade-foreground);
+ --uitk-palette-interact-background-active: var(--uitk-color-blue-700);
+ --uitk-palette-interact-border-active: var(--uitk-color-blue-100);
+ --uitk-palette-interact-border-activeDisabled: var(--uitk-color-blue-100-fade-fill);
+ --uitk-palette-interact-foreground-partial: var(--uitk-color-blue-100);
+ --uitk-palette-interact-foreground-partialDisabled: var(--uitk-color-blue-100-fade-foreground);
```

Remove selectable foreground state tokens and respective palette tokens
Remove `uitk-palette-neutral-highlight` as it now can be replaced by `uitk-palette-interact-background-active`

```diff
- --uitk-selectable-foreground-hover
- --uitk-selectable-foreground-selected
- --uitk-selectable-foreground-blurSelected
- --uitk-palette-interact-foreground-hover
- --uitk-palette-interact-foreground-active
- --uitk-palette-interact-foreground-blurSelected
- --uitk-palette-neutral-highlight
```

Remove redundant fade tokens, add new requirements

```diff
- --uitk-color-blue-400-fade-fill
- --uitk-color-blue-400-fade-foreground
+ --uitk-color-blue-100-fade-fill
+ --uitk-color-blue-100-fade-foreground
+ --uitk-color-gray-200-fade-border
+ --uitk-color-gray-200-fade-border-readonly
```