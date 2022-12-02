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

Remove redundant tokens, add new requirements

```diff
- --uitk-color-blue-400-fade-fill
- --uitk-color-blue-400-fade-foreground
+ --uitk-color-blue-100-fade-fill
+ --uitk-color-blue-100-fade-foreground
+ --uitk-color-gray-200-fade-border
+ --uitk-color-gray-200-fade-border-readonly
```

Update opacities

```diff
- --uitk-opacity-1: 0.2
- --uitk-opacity-2: 0.4
- --uitk-opacity-3: 0.7
- --uitk-opacity-4: 0.8
- --uitk-palette-opacity-background: var(--uitk-opacity-2)
- --uitk-palette-opacity-border: var(--uitk-opacity-2)
- --uitk-palette-opacity-border-readonly: var(--uitk-opacity-1)
- --uitk-palette-opacity-fill: var(--uitk-opacity-2)
- --uitk-palette-opacity-foreground: var(--uitk-opacity-3)
- --uitk-palette-opacity-scrim-low: var(--uitk-opacity-4)
- --uitk-palette-opacity-stroke: var(--uitk-opacity-2)
+ --uitk-opacity-1: 0.15
+ --uitk-opacity-2: 0.25
+ --uitk-opacity-3: 0.4
+ --uitk-opacity-4: 0.7
+ --uitk-opacity-5: 0.8
+ --uitk-palette-opacity-background: var(--uitk-opacity-3)
+ --uitk-palette-opacity-border: var(--uitk-opacity-3)
+ --uitk-palette-opacity-border-readonly: var(--uitk-opacity-2)
+ --uitk-palette-opacity-fill: var(--uitk-opacity-3)
+ --uitk-palette-opacity-foreground: var(--uitk-opacity-4)
+ --uitk-palette-opacity-scrim-low: var(--uitk-opacity-5)
+ --uitk-palette-opacity-stroke: var(--uitk-opacity-3)
+ --uitk-palette-opacity-primary-border: var(--uitk-opacity-3)
+ --uitk-palette-opacity-secondary-border: var(--uitk-opacity-2)
+ --uitk-palette-opacity-tertiary-border: var(--uitk-opacity-1)
```

Redo separable characteristic

```diff
- --uitk-separable-primary-background
- --uitk-separable-primary-background-hover
- --uitk-separable-primary-background-active
- --uitk-separable-primary-foreground
- --uitk-separable-primary-foreground-active
- --uitk-separable-primary-foreground-hover
- --uitk-separable-primary-borderColor: var(--uitk-palette-neutral-border-high)
- --uitk-separable-secondary-borderColor: var(--uitk-palette-neutral-border-medium)
- --uitk-separable-tertiary-borderColor: var(--uitk-palette-neutral-border-low)
- --uitk-palette-neutral-cta-border
- --uitk-palette-neutral-primary-border
- --uitk-palette-neutral-secondary-border
- --uitk-palette-neutral-border-low
- --uitk-palette-neutral-border-disabled-low
+ --uitk-separable-primary-borderColor: var(--uitk-palette-neutral-primary-separator)
+ --uitk-separable-secondary-borderColor: var(--uitk-palette-neutral-secondary-separator)
+ --uitk-separable-tertiary-borderColor: var(--uitk-palette-neutral-tertiary-separator)
+ --uitk-color-white-fade-separatorOpacity-primary
+ --uitk-color-white-fade-separatorOpacity-secondary
+ --uitk-color-white-fade-separatorOpacity-tertiary
+ --uitk-color-black-fade-separatorOpacity-primary
+ --uitk-color-black-fade-separatorOpacity-secondary
+ --uitk-color-black-fade-separatorOpacity-tertiary
+ --uitk-palette-neutral-primary-separator
+ --uitk-palette-neutral-secondary-separator
+ --uitk-palette-neutral-tertiary-separator
```
