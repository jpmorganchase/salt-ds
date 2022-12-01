---
"@jpmorganchase/uitk-lab": minor
"@jpmorganchase/uitk-theme": minor
---

Remove selectable state tokens hover, selected, blurSelected, to be replaced with default

```diff
- --uitk-selectable-foreground-hover
- --uitk-selectable-foreground-selected
- --uitk-selectable-foreground-blurSelected
- --uitk-selectable-foreground-selectedDisabled
- --uitk-palette-interact-foreground-hover
- --uitk-palette-interact-foreground-active
- --uitk-palette-interact-foreground-activeDisabled
- --uitk-palette-interact-foreground-blurSelected
```

Create `-uitk-palette-interact-background` and `-uitk-palette-interact-background-disabled` tokens to be used and complete palette set

```diff
- --uitk-selectable-background: transparent
- --uitk-selectable-background-disabled: transparent
- --uitk-selectable-cta-background: transparent
- --uitk-selectable-cta-background-disabled: transparent
- --uitk-selectable-primary-background: transparent
- --uitk-selectable-primary-background-disabled: transparent
- --uitk-selectable-secondary-background: transparent
- --uitk-selectable-secondary-background-disabled: transparent
+ --uitk-palette-interact-background: transparent
+ --uitk-palette-interact-background-disabled: transparent
+ --uitk-selectable-background: var(--uitk-palette-interact-background)
+ --uitk-selectable-background-disabled: var(--uitk-palette-interact-background-disabled)
+ --uitk-selectable-cta-background: var(--uitk-palette-interact-background)
+ --uitk-selectable-cta-background-disabled: var(--uitk-palette-interact-background-disabled)
+ --uitk-selectable-primary-background: var(--uitk-palette-interact-background)
+ --uitk-selectable-primary-background-disabled: var(--uitk-palette-interact-background-disabled)
+ --uitk-selectable-secondary-background: var(--uitk-palette-interact-background)
+ --uitk-selectable-secondary-background-disabled: var(--uitk-palette-interact-background-disabled)
```

Fix token maps

```diff
- --uitk-selectable-cta-foreground: var(--uitk-palette-interact-primary-foreground)
- --uitk-selectable-cta-foreground-disabled: var(--uitk-palette-interact-primary-foreground-disabled)
- --uitk-selectable-primary-foreground: var(--uitk-palette-interact-primary-foreground)
- --uitk-selectable-primary-foreground-disabled: var(--uitk-palette-interact-primary-foreground-disabled)
- --uitk-selectable-secondary-foreground: var(--uitk-palette-interact-secondary-foreground)
- --uitk-selectable-secondary-foreground-disabled: var(--uitk-palette-interact-secondary-foreground-disabled)
+ --uitk-selectable-cta-foreground: var(--uitk-palette-interact-foreground)
+ --uitk-selectable-cta-foreground-disabled: var(--uitk-palette-interact-foreground-disabled)
+ --uitk-selectable-primary-foreground: var(--uitk-palette-interact-foreground)
+ --uitk-selectable-primary-foreground-disabled: var(--uitk-palette-interact-foreground-disabled)
+ --uitk-selectable-secondary-foreground: var(--uitk-palette-interact-foreground)
+ --uitk-selectable-secondary-foreground-disabled: var(--uitk-palette-interact-foreground-disabled)
```
