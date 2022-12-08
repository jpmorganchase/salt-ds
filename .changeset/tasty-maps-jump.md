---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-lab": minor
"@jpmorganchase/uitk-theme": minor
---

Remove .uitkEmphasisHigh, .uitkEmphasisLow, .uitkEmphasisMedium classes from components

- Banner; replaces classes with `emphasize` prop
- Card, FormField, Scrim, Overlay; replaces these classes with `variant` prop
- CalendarDay; replaces these classes with `-unselectableLow`, `-unselectableMedium`

Remove emphasis concept from characteristics; replace with variants (Low -> Tertiary, Medium -> Primary, High -> Secondary)

Container: replace emphasis tokens with new respective variants, add `--uitk-container-tertiary-background`, `--uitk-container-tertiary-background-disabled`

```diff
- --uitk-container-background-medium
+ --uitk-container-primary-background
- --uitk-container-background-high
+ --uitk-container-secondary-background
- --uitk-container-background-low
+ --uitk-container-tertiary-background

- --uitk-container-borderColor-medium
+ --uitk-container-primary-borderColor
- --uitk-container-borderColor-disabled-medium
+ --uitk-container-primary-borderColor-disabled

- --uitk-container-borderColor-low
+ --uitk-container-tertiary-borderColor
- --uitk-container-borderColor-disabled-low
+ --uitk-container-tertiary-borderColor-disabled

- --uitk-container-borderColor-high
+ --uitk-container-secondary-borderColor
- --uitk-container-borderColor-disabled-high
+ --uitk-container-secondary-borderColor-disabled

+ --uitk-container-tertiary-background
+ --uitk-container-tertiary-background-disabled
```

Editable: replace emphasis tokens with new respective variants

```diff
- --uitk-editable-background-medium
+ --uitk-editable-primary-background
- --uitk-editable-background-active-medium
+ --uitk-editable-primary-background-active
- --uitk-editable-background-disabled-medium
+ --uitk-editable-primary-background-disabled
- --uitk-editable-background-hover-medium
+ --uitk-editable-primary-background-hover
- --uitk-editable-background-readonly-medium
+ --uitk-editable-primary-background-readonly

- --uitk-editable-background-high
+ --uitk-editable-secondary-background
- --uitk-editable-background-active-high
+ --uitk-editable-secondary-background-active
- --uitk-editable-background-disabled-high
+ --uitk-editable-secondary-background-disabled
- --uitk-editable-background-hover-high
+ --uitk-editable-secondary-background-hover
- --uitk-editable-background-readonly-high
+ --uitk-editable-secondary-background-readonly

- --uitk-editable-background-low
+ --uitk-editable-tertiary-background
- --uitk-editable-background-active-low
+ --uitk-editable-tertiary-background-active
- --uitk-editable-background-disabled-low
+ --uitk-editable-tertiary-background-disabled
- --uitk-editable-background-hover-low
+ --uitk-editable-tertiary-background-hover
- --uitk-editable-background-readonly-low
+ --uitk-editable-tertiary-background-readonly
```

Navigable: replace emphasis tokens with new respective variants

```diff
- --uitk-navigable-background-medium
+ --uitk-navigable-primary-background
- --uitk-navigable-background-hover-medium
+ --uitk-navigable-primary-background-active
- --uitk-navigable-background-active-medium
+ --uitk-navigable-primary-background-disabled

- --uitk-navigable-background-high
+ --uitk-navigable-secondary-background
- --uitk-navigable-background-hover-high
+ --uitk-navigable-secondary-background-active
- --uitk-navigable-background-active-high
+ --uitk-navigable-secondary-background-disabled

- --uitk-navigable-background-low
+ --uitk-navigable-tertiary-background
- --uitk-navigable-background-hover-low
+ --uitk-navigable-tertiary-background-active
- --uitk-navigable-background-active-low
+ --uitk-navigable-tertiary-background-disabled
```

Overlayable: replace emphasis tokens with new respective variants

```diff
- --uitk-overlayable-background-medium
+ --uitk-overlayable-primary-background

- --uitk-overlayable-background-low
+ --uitk-overlayable-secondary-background
```

Status: replace emphasis tokens with 'emphasize' type

```diff
- --uitk-status-info-background-high
+ --uitk-status-info-background-emphasize
- --uitk-status-succes-background-high
+ --uitk-status-succes-background-emphasize
- --uitk-status-error-background-high
+ --uitk-status-error-background-emphasize
- --uitk-status-warning-background-high
+ --uitk-status-warning-background-emphasize
```

Palette: token renaming emphasis to variants; color is the same where not stated

````diff
- --uitk-palette-opacity-scrim-medium: var(--uitk-opacity-4) // Light mode
+ --uitk-palette-opacity-primary-scrim: var(--uitk-opacity-5) // Light mode
- --uitk-palette-opacity-scrim-medium: var(--uitk-opacity-3) // Dark mode
+ --uitk-palette-opacity-primary-scrim: var(--uitk-opacity-4) // Dark mode
- --uitk-palette-opacity-scrim-low
+ --uitk-palette-opacity-secondary-scrim

- --uitk-palette-interact-background-high
- --uitk-palette-interact-background-disabled-high
- --uitk-palette-interact-background-medium
- --uitk-palette-interact-background-disabled-medium
- --uitk-palette-interact-background-low
- --uitk-palette-interact-background-disabled-low
+ --uitk-palette-interact-background: transparent
+ --uitk-palette-interact-background-disabled: transparent

- --uitk-palette-error-background-high
+ --uitk-palette-error-background-emphasize
- --uitk-palette-info-background-high
+ --uitk-palette-info-background-emphasize
- --uitk-palette-success-background-high
+ --uitk-palette-success-background-emphasize
- --uitk-palette-warning-background-high
+ --uitk-palette-warning-background-emphasize

- --uitk-palette-navigate-background-medium
- --uitk-palette-navigate-background-active-medium
- --uitk-palette-navigate-background-hover-medium
+ --uitk-palette-navigate-primary-background
+ --uitk-palette-navigate-primary-background-active
+ --uitk-palette-navigate-primary-background-hover
- --uitk-palette-navigate-background-high
- --uitk-palette-navigate-background-active-high
- --uitk-palette-navigate-background-hover-high
+ --uitk-palette-navigate-secondary-background
+ --uitk-palette-navigate-secondary-background-active
+ --uitk-palette-navigate-secondary-background-hover
- --uitk-palette-navigate-background-low
- --uitk-palette-navigate-background-active-low
- --uitk-palette-navigate-background-hover-low
+ --uitk-palette-navigate-tertiary-background
+ --uitk-palette-navigate-tertiary-background-active
+ --uitk-palette-navigate-tertiary-background-hover

- --uitk-palette-neutral-scrim-medium: var(--uitk-color-black-fade-scrim-medium) // Light mode
- --uitk-palette-neutral-scrim-medium: var(--uitk-color-gray-800-fade-scrim-medium) // Dark mode
+ --uitk-palette-neutral-primary-scrim: var(--uitk-color-black-fade-scrim-primary) // Light mode
+ --uitk-palette-neutral-primary-scrim: var(--uitk-color-gray-800-fade-scrim-primary) // Dark mode
- --uitk-palette-neutral-scrim-low: var(--uitk-color-white-fade-scrim-low) // Light mode
- --uitk-palette-neutral-scrim-low: var(--uitk-color-black-fade-scrim-medium) // Dark mode
+ --uitk-palette-neutral-secondary-scrim: var(--uitk-color-white-fade-scrim-secondary) // Light mode
+ --uitk-palette-neutral-secondary-scrim: var(--uitk-color-black-fade-scrim-secondary) // Dark mode
- --uitk-palette-neutral-background-medium
+ --uitk-palette-neutral-primary-background
- --uitk-palette-neutral-background-high
+ --uitk-palette-neutral-secondary-background
- --uitk-palette-neutral-background-low
+ --uitk-palette-neutral-tertiary-background
- --uitk-palette-neutral-border-medium
- --uitk-palette-neutral-border-disabled-medium
+ --uitk-palette-neutral-primary-border
+ --uitk-palette-neutral-primary-border-disabled
- --uitk-palette-neutral-border-high
- --uitk-palette-neutral-border-disabled-high
+ --uitk-palette-neutral-secondary-border
+ --uitk-palette-neutral-secondary-border-disabled

+ --uitk-palette-neutral-primary-background-disabled: var(--uitk-color-white-fade-background) // Light mode
+ --uitk-palette-neutral-primary-background-disabled: var(--uitk-color-gray-800-fade-background) // Dark mode
+ --uitk-palette-neutral-secondary-background-disabled: var(--uitk-color-gray-20-fade-background) // Light mode
+ --uitk-palette-neutral-secondary-background-readonly: var(--uitk-color-gray-800-fade-background-readonly) // Dark mode
+ --uitk-palette-neutral-tertiary-background-disabled: transparent
+ --uitk-palette-neutral-tertiary-background-readonly: transparent
+ --uitk-palette-neutral-tertiary-border: transparent
+ --uitk-palette-neutral-tertiary-border-disabled: transparent
```

Add new fade tokens needed for palette; replace emphasis tokens with variants - here, low scrim is changed to secondary variant

```diff
- --uitk-color-black-fade-scrim-medium
+ --uitk-color-black-fade-scrim-primary
- --uitk-color-gray-800-fade-scrim-medium
+ --uitk-color-gray-800-fade-scrim-primary
- --uitk-color-white-fade-scrim-low
+ --uitk-color-black-fade-scrim-secondary
+ --uitk-color-white-fade-scrim-secondary

+ --uitk-color-white-fade-background-readonly
+ --uitk-color-gray-20-fade-background-readonly
+ --uitk-color-gray-600-fade-background-readonly
+ --uitk-color-gray-800-fade-background-readonly
````
