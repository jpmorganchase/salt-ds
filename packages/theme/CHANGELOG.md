# @jpmorganchase/uitk-theme

## 0.8.0

### Minor Changes

- 171927c8: Remove default and disabled selectable foreground tokens, replace usages with text primary foreground

  ```diff
  - --uitk-selectable-foreground
  - --uitk-selectable-foreground-disabled
  ```

- 54e0bf2e: Change to Scrim styling; remove variant prop from Scrim component

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

- 0a0d3a2d: Add accent line height `--uitk-accent-lineHeight` per density

## 0.7.0

### Minor Changes

- b5881e50: Correction of line height values

  TD

  ```diff
  - --uitk-text-lineHeight: 22px;
  - --uitk-text-h1-lineHeight: auto;
  - --uitk-text-h2-lineHeight: 36px;
  - --uitk-text-h3-lineHeight: 26px;
  - --uitk-text-h4-lineHeight: 22px;
  + --uitk-text-lineHeight: 20px;
  + --uitk-text-h1-lineHeight: 54px;
  + --uitk-text-h2-lineHeight: 42px;
  + --uitk-text-h3-lineHeight: 32px;
  + --uitk-text-h4-lineHeight: 20px;
  ```

  LD

  ```diff
  - --uitk-text-h3-lineHeight: 26px;
  + --uitk-text-h3-lineHeight: 24px;
  ```

  MD

  ```diff
  - --uitk-text-h1-lineHeight: 31px;
  - --uitk-text-h3-lineHeight: 22px;
  + --uitk-text-h1-lineHeight: 32px;
  + --uitk-text-h3-lineHeight: 18px;
  ```

- fc1a5b8e: Tweak palette disabled token used in editable

  ```diff
  - --uitk-editable-background-disabled-low: var(--uitk-palette-interact-background-low)
  + --uitk-palette-interact-tertiary-background-disabled
  + --uitk-editable-tertiary-background-disabled: var(--uitk-palette-neutral-tertiary-background-disabled)
  ```

- da7065c1: Merge `-caption` and `-help` tokens to single `-label` token
  Remove `--uitk-text-help-fontWeight`, `--uitk-text-caption-fontStyle`
  Move `--uitk-text-help-fontStyle` to become `--uitk-editable-help-fontStyle`

  ```diff
  -  --uitk-text-caption-fontStyle
  -  --uitk-text-caption-fontWeight
  -  --uitk-text-caption-fontWeight-strong
  -  --uitk-text-caption-fontSize
  -  --uitk-text-caption-minHeight
  -  --uitk-text-help-fontWeight
  -  --uitk-text-help-fontSize
  -  --uitk-text-help-minHeight
  -  --uitk-text-help-fontStyle
  +  --uitk-text-label-fontWeight
  +  --uitk-text-label-fontWeight-strong
  +  --uitk-text-label-fontSize
  +  --uitk-editable-help-fontStyle
  ```

  Correct line height values

  TD

  ```diff
  -  --uitk-text-caption-lineHeight: 16px;
  -  --uitk-text-help-lineHeight: 16px;
  +  --uitk-text-label-lineHeight: 18px;
  ```

  LD

  ```diff
  -  --uitk-text-caption-lineHeight: 14px;
  -  --uitk-text-help-lineHeight: 14px;
  +  --uitk-text-label-lineHeight: 16px;
  ```

  MD

  ```diff
  -  --uitk-text-caption-lineHeight: 14px;
  -  --uitk-text-help-lineHeight: 14px;
  +  --uitk-text-label-lineHeight: 14px;
  ```

  HD

  ```diff
  -  --uitk-text-caption-lineHeight: 14px;
  -  --uitk-text-help-lineHeight: 14px;
  +  --uitk-text-label-lineHeight: 13px;
  ```

- da141cda: Change palette-interact values

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
  + --uitk-palette-opacity-tertiary-scrim: var(--uitk-opacity-5)
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
  - --uitk-palette-neutral-tertiary-border-low
  - --uitk-palette-neutral-tertiary-border-disabled-low
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

- 3e2263ba: Change `--uitk-palette-navigate-indicator-activeDisabled` to orange

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

- 81d6999b: Updates to text fontWeight

  ```diff
  - --uitk-text-h1-fontWeight-small: var(--uitk-typography-fontWeight-light);
  - --uitk-text-h2-fontWeight-strong: var(--uitk-typography-fontWeight-extraBold);
  - --uitk-text-h3-fontWeight-strong: var(--uitk-typography-fontWeight-extraBold);
  - --uitk-text-h4-fontWeight-strong: var(--uitk-typography-fontWeight-extraBold);
  + --uitk-text-h1-fontWeight-small: var(--uitk-typography-fontWeight-medium);
  + --uitk-text-h2-fontWeight-strong: var(--uitk-typography-fontWeight-bold);
  + --uitk-text-h3-fontWeight-strong: var(--uitk-typography-fontWeight-bold);
  + --uitk-text-h4-fontWeight-strong: var(--uitk-typography-fontWeight-bold);
  ```

- feefd8b0: Change `-figure` text tokens to `display`, updated values and font weights

  ```diff
  - --uitk-text-figure1-fontSize
  - --uitk-text-figure1-fontWeight
  - --uitk-text-figure2-fontSize
  - --uitk-text-figure2-fontWeight
  - --uitk-text-figure3-fontSize
  - --uitk-text-figure3-fontWeight
  - --uitk-text-figure1-lineHeight: 72px;
  - --uitk-text-figure2-lineHeight: 48px;
  - --uitk-text-figure3-lineHeight: 24px;
  + --uitk-text-display1-fontWeight
  + --uitk-text-display1-fontWeight-strong
  + --uitk-text-display1-fontWeight-small
  + --uitk-text-display2-fontWeight
  + --uitk-text-display2-fontWeight-strong
  + --uitk-text-display2-fontWeight-small
  + --uitk-text-display3-fontWeight
  + --uitk-text-display3-fontWeight-strong
  + --uitk-text-display3-fontWeight-small
  ```

  Add line heights

  HD

  ```diff
  + --uitk-text-display1-lineHeight: 54px;
  + --uitk-text-display2-lineHeight: 36px;
  + --uitk-text-display3-lineHeight: 24px;
  ```

  MD

  ```diff
  + --uitk-text-display1-lineHeight: 70px;
  + --uitk-text-display2-lineHeight: 47px;
  + --uitk-text-display3-lineHeight: 32px;
  ```

  LD

  ```diff
  + --uitk-text-display1-lineHeight: 88px;
  + --uitk-text-display2-lineHeight: 60px;
  + --uitk-text-display3-lineHeight: 42px;
  ```

  TD

  ```diff
  + --uitk-text-display1-lineHeight: 109px;
  + --uitk-text-display2-lineHeight: 76px;
  + --uitk-text-display3-lineHeight: 54px;
  ```

- 2f508979: Add palette token for focused outline

  Light mode

  ```diff
  + --uitk-palette-interact-outline: var(--uitk-color-blue-600)
  ```

  Dark mode

  ```diff
  + --uitk-palette-interact-outline: var(--uitk-color-blue-100)
  ```

- 9e999d50: Rename zIndex tokens, respectively:

  ```diff
  - --uitk-zIndex-appheader
  - --uitk-zIndex-dragobject
  - --uitk-zIndex-contextmenu
  - --uitk-zIndex-tooltip
  + --uitk-zIndex-appHeader
  + --uitk-zIndex-dragObject
  + --uitk-zIndex-contextMenu
  + --uitk-zIndex-flyover
  ```

- 991a408c: Make theme global font size `--uitk-text-fontSize` instead of 14px, and move to global.css from typography.css
  Give global values for font-size, font-family, color, line-height, letter-spacing

  Remove base 1.3 line height, and replace with appropriate line height variant throughout the code
  Remove text background on default and hover state tokens

  ```diff
  - --uitk-text-base-lineHeight
  - --uitk-typography-lineHeight
  - --uitk-text-background
  - --uitk-text-background-hover
  ```

- e64146d7: Navigate tokens for links

  ```diff
  - --uitk-palette-navigate-foreground
  + --uitk-palette-navigate-foreground-hover
  + --uitk-palette-navigate-foreground-active
  + --uitk-palette-navigate-foreground-visited
  + --uitk-text-link-foreground-active: var(--uitk-palette-navigate-foreground-active)
  + --uitk-text-link-foreground-visited: var(--uitk-palette-navigate-foreground-visited)
  ```

- 6338ff71: Add new size token

  ```diff
  + --uitk-size-detail
  ```

- eeff5bb6: Change to `--uitk-palette-neutral-secondary-background` in dark mode:

  ```diff
  - --uitk-palette-neutral-secondary-background: var(--uitk-color-gray-700)
  - --uitk-palette-neutral-secondary-background-disabled: var(--uitk-fade-gray-700-opacity-background)
  - --uitk-palette-neutral-secondary-background-readonly: var(--uitk-fade-gray-700-opacity-background-readonly)
  + --uitk-palette-neutral-secondary-background: var(--uitk-color-gray-600)
  + --uitk-palette-neutral-secondary-background-disabled: var(--uitk-fade-gray-600-opacity-background)
  + --uitk-palette-neutral-secondary-background-readonly: var(--uitk-fade-gray-600-opacity-background-readonly)
  ```

- 42ed0026: Rename palette -icon tokens to -foreground

  ```diff
  - --uitk-palette-info-icon
  - --uitk-palette-error-icon
  - --uitk-palette-success-icon
  - --uitk-palette-warning-icon
  + --uitk-palette-info-foreground
  + --uitk-palette-error-foreground
  + --uitk-palette-success-foreground
  + --uitk-palette-warning-foreground
  ```

- 7aef81aa: Replace 1px borders with size token and remove `--uitk-size-bottomBorder` as it's component specific.

  ```diff
  - --uitk-size-bottomBorder
  - --uitk-container-borderWidth
  - --uitk-editable-borderWidth
  - --uitk-editable-borderWidth-hover
  - --uitk-editable-borderWidth-disabled
  - --uitk-editable-borderWidth-readonly
  - --uitk-selectable-borderWidth
  - --uitk-selectable-borderWidth-hover
  - --uitk-selectable-borderWidth-selected
  - --uitk-selectable-borderWidth-blurSelected
  - --uitk-separable-borderWidth
  - --uitk-target-borderWidth
  - --uitk-target-borderWidth-hover
  - --uitk-target-borderWidth-disabled
  + --uitk-size-border: 1px
  + --uitk-measured-borderWidth-active: 2px
  + --uitk-measured-borderWidth-complete: 2px
  + --uitk-measured-borderWidth-incomplete: 2px
  ```

- b7e456b3: Remove `-hover` and `-selected` text foreground styles

  ```diff
  - --uitk-text-primary-foreground-hover
  - --uitk-text-primary-foreground-selected
  - --uitk-text-secondary-foreground-hover
  - --uitk-text-secondary-foreground-selected
  ```

- 3d94d560: Remove .uitkEmphasisHigh, .uitkEmphasisLow, .uitkEmphasisMedium classes from components

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

- ccff8af8: Remove container border color variants; replace usage with respective emphasis token

  ```diff
  - --uitk-container-cta-borderColor
  - --uitk-container-primary-borderColor
  - --uitk-container-secondary-borderColor
  ```

- e7530f8b: **BREAKING CHANGE:**

  uitk-sans has been removed. The default font family is now Open Sans.
  Fonts are no longer bundled with the components.

  You may add it to your project with a npm package e.g. [Fontsource](https://fontsource.org/), or with the [Google Fonts CDN](https://fonts.google.com/).

  For example, using fontsource:

  ```js
  import "@fontsource/open-sans/300.css";
  import "@fontsource/open-sans/300-italic.css";
  import "@fontsource/open-sans/400.css";
  import "@fontsource/open-sans/400-italic.css";
  import "@fontsource/open-sans/500.css";
  import "@fontsource/open-sans/500-italic.css";
  import "@fontsource/open-sans/600.css";
  import "@fontsource/open-sans/600-italic.css";
  import "@fontsource/open-sans/700.css";
  import "@fontsource/open-sans/700-italic.css";
  import "@fontsource/open-sans/800.css";
  import "@fontsource/open-sans/800-italic.css";
  ```

- 8c075106: Use American English 'gray' throughout code

## 0.6.0

### Minor Changes

- 29b3478e: Alignment with Figma characteristics

  Added:
  --uitk-accent-fontWeight
  --uitk-draggable-horizontal-cursor-active
  --uitk-navigable-indicator-activeDisabled
  --uitk-color-gray-90-fade-foreground
  --uitk-palette-navigate-indicator-disabled

  Removed:
  --uitk-actionable-primary-fontWeight-hover
  --uitk-actionable-cta-fontWeight-hover
  --uitk-actionable-secondary-fontWeight-hover
  --uitk-actionable-primary-fontWeight-active
  --uitk-actionable-cta-fontWeight-active
  --uitk-actionable-secondary-fontWeight-active
  --uitk-container-textAlign

- f259b693: Remove ratable characteristic

  ```diff
  - --uitk-ratable-cursor-hover
  - --uitk-ratable-cursor-active
  - --uitk-ratable-cursor-undo
  - --uitk-ratable-cursor-disabled
  - --uitk-ratable-borderWidth
  - --uitk-ratable-borderWidth-undo
  - --uitk-ratable-borderStyle
  - --uitk-ratable-borderStyle-undo
  - --uitk-ratable-background
  - --uitk-ratable-background-active
  - --uitk-ratable-background-activeDisabled
  - --uitk-ratable-background-hover
  - --uitk-ratable-background-undo
  - --uitk-ratable-borderColor
  - --uitk-ratable-borderColor-active
  - --uitk-ratable-borderColor-disabled
  - --uitk-ratable-borderColor-hover
  - --uitk-ratable-borderColor-undo
  ```

  Remove rate tokens from palette:

  ```diff
  - --uitk-palette-rate-background
  - --uitk-palette-rate-background-active
  - --uitk-palette-rate-background-activeDisabled
  - --uitk-palette-rate-background-hover
  - --uitk-palette-rate-background-undo
  - --uitk-palette-rate-border
  - --uitk-palette-rate-border-active
  - --uitk-palette-rate-border-disabled
  - --uitk-palette-rate-border-hover
  - --uitk-palette-rate-border-undo
  ```

  Add new tokens to measured characteristic:

  ```diff
  + --uitk-measured-foreground-hover
  + --uitk-measured-foreground-active
  + --uitk-measured-foreground-undo
  + --uitk-measured-foreground-activeDisabled
  + --uitk-palette-measured-foreground-active
  + --uitk-palette-measured-foreground-activeDisabled
  ```

- 2a3403c6: Rename Drop Target characteristic to Target

  ```diff
  - --uitk-dropTarget-background-hover
  - --uitk-dropTarget-borderStyle
  - --uitk-dropTarget-borderStyle-hover: dashed
  - --uitk-dropTarget-borderStyle-disabled
  - --uitk-dropTarget-borderWidth
  - --uitk-dropTarget-borderWidth-hover
  - --uitk-dropTarget-borderWidth-disabled
  - --uitk-dropTarget-cursor-disabled
  + --uitk-target-background-hover
  + --uitk-target-borderStyle
  + --uitk-target-borderStyle-hover: solid
  + --uitk-target-borderStyle-disabled
  + --uitk-target-borderWidth
  + --uitk-target-borderWidth-hover
  + --uitk-target-borderWidth-disabled
  + --uitk-target-cursor-disabled
  + --uitk-target-borderColor-hover: var(--uitk-palette-interact-border-hover)
  ```

- 38c46088: Remove backwards compatibility functionality
- 99ac5660: Add density aware fontSize token to Accent characteristic; remove old design S/M/L tokens

  ```diff
  - --uitk-accent-fontSize-small
  - --uitk-accent-fontSize-medium
  - --uitk-accent-fontSize-large
  + --uitk-accent-fontSize
  ```

- f7e835b3: Remove old typography sizes from theme:

  - uitk-typography-size-10
  - uitk-typography-size-30
  - uitk-typography-size-40
  - uitk-typography-size-50
  - uitk-typography-size-60
  - uitk-typography-size-70
  - uitk-typography-size-80
  - uitk-typography-size-90
  - uitk-typography-size-100
  - uitk-typography-size-110
  - uitk-typography-size-120
  - uitk-typography-size-125
  - uitk-typography-size-130
  - uitk-typography-size-140
  - uitk-typography-size-150
  - uitk-typography-size-170
  - uitk-typography-size-180
  - uitk-typography-size-210
  - uitk-typography-size-240

  Move base line height to foundation

- 42f79714: Remove container, selectable and editable -borderRadius tokens; replace with 0 where container-borderRadius was already being used
- 2dc914c6: Change palette -measure token to -measured
- 993029f3: - --uitk-palette-opacity-background changed to opacity-2

  - Size tokens updated to use unit calculations where density aware

  - The following size tokens moved to become density invariant:

  --uitk-size-divider-strokeWidth: 1px;
  --uitk-size-bottomBorder: 2px;
  --uitk-size-brandBar: 4px;

  - Pill, Switch, AppHeader, Logo and ToggleGroupButton size tokens moved to respective components

  ```diff
  - --uitk-size-adornment
  - --uitk-size-appHeader
  - --uitk-size-pill
  - --uitk-size-switch
  - --uitk-size-logo
  - --uitk-size-toggleGroupButton
  - --uitk-size-formField-top
  ```

- 6952b3e3: Remove following measured characteristics from theme:

  - uitk-measured-fontSize-high
  - uitk-measured-fontSize-medium
  - uitk-measured-fontSize-low

  Update following measured characteristics in theme:

  - uitk-measured-borderColor
  - uitk-measured-borderWidth 1px -> 2px

  Add following measured characteristics in theme:

  - uitk-measured-borderStyle-active
  - uitk-measured-borderStyle-complete
  - uitk-measured-borderStyle-incomplete
  - uitk-measured-textAlign
  - uitk-measured-background-disabled
  - uitk-measured-borderColor
  - uitk-measured-borderColor-disabled
  - uitk-measured-foreground
  - uitk-measured-foreground-disabled

- b8b7a556: - Publish sub-parts of `index.css` file (theme, global, font) to be used individually
- 172fd5a8: Updated the `<Icon />` component.

  - It now only accepts SVG elements as children and should be used as follows:

  ```jsx
  <Icon aria-label="add" viewBox="0 0 12 12" size={1}>
    <path d="M7 0H5v5H0v2h5v5h2V7h5V5H7V0z" />
  </Icon>
  ```

  - Wrapping span elements have been removed so the root element is the `<svg>` itself. The Icon ref is now type `SVGSVGElement` instead of a `<span>`.

  - The size prop has been updated to be a number which is a multiplier of the base value instead of a named size. At high density the following would apply:

  ```jsx
  <AddIcon size="small" />
  <AddIcon size="medium" />
  <AddIcon size="large" />
  ```

  becomes

  ```jsx
  <AddIcon size={1} />
  <AddIcon size={2} />
  <AddIcon size={4} />
  ```

  - The size of the Icon will now scale with density.
  - **Note:** Previously Icon could be set to a specific size by passing a number to the `size` prop. This has been removed so Icons will scale with the rest of the design system. You can still set a specific size using the css variable `--icon-size` but it is not recommended as your component won't scale with density.
  - Built in Icon components e.g. `<AddIcon />` have been regenerated to use the new Icon component so their html and API have changed accordingly.
  - UITK components which had Icon or a built-in Icon as a dependancy have also been updated.
  - A new size css variable `--uitk-size-icon-base` has been added to the theme for each density.
  - The `createIcon` utitlity function has been removed. Instead you should just use the `<Icon />` component to create a custom Icon as follows:

```jsx
import { createIcon } from "@jpmorganchase/uitk-icons";

export const AddIcon = createIcon(
  <svg viewBox="0 0 12 12" data-testid="AddIcon">
    <path d="M7 0H5v5H0v2h5v5h2V7h5V5H7V0z" />
  </svg>,
  "Add",
  "add"
);
```

becomes

```jsx
import { forwardRef } from "react";
import { Icon, IconProps } from "@jpmorganchase/uitk-icons";

export const AddIcon = forwardRef<SVGSVGElement, IconProps>(function AddIcon(
  props: AddIconProps,
  ref
) {
  return (
    <Icon
      data-testid="AddIcon"
      aria-label="add"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M7 0H5v5H0v2h5v5h2V7h5V5H7V0z" />
    </Icon>
  );
});

```

- ce4756a1: Remove uitk-theme custom element and replace it with div element. The custom element may cause confusion.
- e4ce788e: `color-scheme` is added to `.uitk-light` and `.uitk-dark` to `global.css`, so that Browser default color efffects can be taken into account.
- c8afdd35: Change -typography-weight tokens to -typography-fontWeight

## 0.5.0

### Minor Changes

- 3aac68ac: Ensure component tokens start with their full name, as well as for any subcomponents, in all private and public tokens. Examples: --uitkCheckboxIcon- -> --uitkCheckbox-icon-, --uitkAccordionSummary- -> --uitkAccordion-summary-, --formHelperText -> --formField-helperText

## 0.4.0

### Minor Changes

- 58adde30: Ensure CSS attributes in all private and public tokens are always kebab case, e.g.:
  --uitkDialog-border-color -> --uitkDialog-borderColor
  --accordion-summary-padding-left -> --accordion-summary-paddingLeft
  --grid-item-grid-row-end -> --grid-item-gridRowEnd
- 6259041e: Changes to text characteristic fontSize tokens

  TD:
  H1 36px -> 42px
  H2 28px -> 32px
  H3 18px -> 24px
  Caption 12px -> 14px
  Help 12px -> 14px

  LD:
  Caption 11px -> 12px
  Help 11px -> 12px

- 1269d30f: Gradient from palette and measured characteristic fill values replaced with solid blue color in line with design change; backwards compatibility classes added to CircularProgress and Spinner
- dd8c7646: Add global css box-sizing as border-box, and remove from components

## 0.3.1

### Patch Changes

- 765fed67: Theme
  small additions to text characteristic

  Lab
  Breadcrumb, ContactDetails, ContentStatus, Metric, Text: apply new naming conventions for CSS variables, add backwardsCompat styling
  Enhance QA stories

  Docs
  add functionality to QAContainer

- d3ee2063: - Remove text minimum height token.
  - Add backwards compatibility for text line height
  - Make sure text line height is declared for all densities

## 0.3.0

### Minor Changes

- 50dcb9a: Pill style uses characteristics
- 0093d6e: Characteristic changes - text characteristic, no direct usage of typography and opacty, rename tokens to use camel case
- fe868ab: Add layer layout component to lab

## 0.2.0

### Minor Changes

- 008074c: Switch css/api and new tokens for switch
- 54d5442: Introduce Draggable and Drop Target characteristics
- 550a668: - fix: blue 800 and 900 values #106
- feat: new characteristics token structure introduced #118 #46
- docs: auto gen characteristics table for component docs #134 #139
- fix: allow @types/react@18 peer dependency #131
- docs: allow all renderer and doc grid to be controlled #137
- chore: enable Chromatic #130 #133 #135 #136
- build: bump @floating-ui/react-dom-interactions to v0.5.0 #100
- chore: bump modular-scripts to v3.0.0 #97

## 0.1.0

### Minor Changes

- f509a9d: Release the theme package.
