# @jpmorganchase/uitk-lab

## 0.10.0

### Minor Changes

- 171927c8: Remove default and disabled selectable foreground tokens, replace usages with text primary foreground

  ```diff
  - --uitk-selectable-foreground
  - --uitk-selectable-foreground-disabled
  ```

- b2c3b21d: Moved the following components from Core to Lab:

  - Card
  - Checkbox
  - ControlLabel
  - FormField
  - FormGroup
  - Input
  - Panel
  - Pill
  - Popper
  - Portal
  - RadioButton
  - Scrim
  - Switch
  - Tooltip
  - Window
  - DeckItem
  - DeckLayout
  - LayerLayout
  - ParentChildItem
  - ParentchildLayout
  - SplitLayout

### Patch Changes

- 5c98da3a: Move Link to Core
  Remove 'disabled' prop from Link
- f4795266: Move to global incrementing counter for useId

## 0.9.0

### Minor Changes

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

- 0f2a3988: ### Button refactor

  - Removed internal `<span/>` from `Button`, children are now direct children of the component.
  - CSS Refactor to remove old browser support.
  - Fix `aria-disabled` to only show when not redundant.
  - Added active visual style to `Button` when either `spacebar` or `enter`.
  - Removed `DivButton`. For lab components that used `DivButton`, it's been replaced by a `Button` (`Tab` and `Dropdown`) or a custom internal `div` (`Pill`).

- 8c075106: Use American English 'gray' throughout code

### Patch Changes

- d86de02f: Move Text component from 'lab' to 'core'
- 6158a031: Fix default generic Item type to be `string` for ListProps, DropdownProps and ComboBox

## 0.8.0

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

- b66d2b0c: Refactor Accordion CSS to remove `:not` usage.
  Refactor TokenizedInput CSS to remove `:not` usage.
- 38c46088: Remove backwards compatibility functionality
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
- 03281cb6: Improve types for forwardCallbackProps
  Ensure Dropdown callback props are merged
- 3708f946: Rename component `StatusIcon` to `StatusIndicator`.
- 949feb1e: Allow Dropdown highlighting and selection to be controlled
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

- 2b3fef8b: ToggleButton and ToggleButtonGroup rename prop `ariaLabel` to standard `aria-label`
- d5f5d83e: ToolkitProvider

  The `theme` prop has be renamed to `mode` so terminology is consistent between designers and developers.

  ```diff
  - <ToolkitProvider theme="light" density="medium" />
  + <ToolkitProvider mode="light" density="medium" />
  ```

  The implementation of this has changed from using a class for the mode to a data attribute

  ```diff
  - <div class="uitk-theme uitk-light uitk-density-medium">
  + <div class="uitk-theme uitk-density-medium" data-mode="light">
  ```

  CSS rules which used `uitk-theme-light` and `uitk-theme-dark`, will need to be updated e.g.

  ```diff
  - .uitk-light {}
  + [data-mode="light"] {}

  - .uitk-dark {}
  + [data-mode="dark"] {}
  ```

  The `theme` prop can still be used to provide a custom theme name to help add specificity when creating custom themes.

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

- c8afdd35: Change -typography-weight tokens to -typography-fontWeight

### Patch Changes

- 9a7b6020: Accordion: remove console.log from register handler
- bacf3a95: Hide
  Accordion's
  ChevronRightIcon
  from
  screen
  readers.
- 6ea95948: Simplify Slider handle and fix keyboard interaction when a screen reader is active
- 55329c89: Refactor ContentStatus to use StatusIcon
- 93298a2d: Color chooser: fix active state swatch size
- 06d86e60: Remove warning and rely on native console

## 0.7.1

### Patch Changes

- 91f8c665: use of scrollHeight to detect overflow doesn't work correctly. Fix for horizontal overflow containers

## 0.7.0

### Minor Changes

- 153f23f0: Added Banner component to lab
- 2ae6c9e0: Bug: List should not throw a runtime exception if focused when empty
- 1f70bb7f: Fix onMouseDown prop on Tabstrip being ignored.
  Improve TypeScript types for Tabs

## 0.6.0

### Minor Changes

- 3aac68ac: Ensure component tokens start with their full name, as well as for any subcomponents, in all private and public tokens. Examples: --uitkCheckboxIcon- -> --uitkCheckbox-icon-, --uitkAccordionSummary- -> --uitkAccordion-summary-, --formHelperText -> --formField-helperText
- 5d8e5c74: Focus visible API removed from components; always use theme characteristics directly for focus visible styling
- 320ecdad: - `FormField`
  - Rename `FormFieldValidationState` type to `FormFieldValidationStatus`
  - Rename `validationState` prop to `validationStatus`
    - `FormLabel`
      - Rename `validationState` prop to `validationStatus`
    - `StatusIndicator`
      - Rename `StateIndicatorState` type to `StatusIndicatorStatus`
      - Rename `state` prop to `status`
  - `Tooltip`
    - Rename `TooltipState` type to `TooltipStatus`
    - Rename `state` prop to `status`
    - Rename `getIconForState` file to `getIconForStatus`
  - `Dialog`
    - Rename `state` prop to `status`
      - `DialogContext`
        - Rename `state` context to `status`
- 52c5afe0: Fix Linear Progress font-size css
- 9d50a574: Provides higher specificity for characteristic override on component (Tabs) with uitkFocusVisible class
- 0f69ab38: Rename `StateIcon` component to `StatusIcon`
  Rename `state` prop in `StatusIcon` to `status`
- 563ac7ca: Move `Deck` and `Layer` components from Lab to Core
  Move responsive functions `useResizeObserver` and `useWidth` from Lab to Core
  Move utils function `usePrevious` from Lab to Core
- 36f2b09f: - List ref is forwarded to its container HTML element, use `scrollingApiRef` for scrolling
  - Fix empty source passed to VirtualizedList will throw error
  - Fixes `uitkHighlighted` className applied to VirtualizedList highlighted item, instead of `uitkListItem-highlighted`

### Patch Changes

- 1f2fc236: Remove import directly from `src` so consumers won't encounter
  TS error if `skipLibCheck` is set to false.
- d208f8b1: Fix circular dependencies warning

## 0.5.0

### Minor Changes

- 92f49f0f: Use Icon and Button's public tokens and direct usage of characteristics for ToggleButton styling
- 58adde30: Ensure CSS attributes in all private and public tokens are always kebab case, e.g.:
  --uitkDialog-border-color -> --uitkDialog-borderColor
  --accordion-summary-padding-left -> --accordion-summary-paddingLeft
  --grid-item-grid-row-end -> --grid-item-gridRowEnd
- efb2cf60: List: omit `defaultValue` HTML attribute to avoid confusion
- a5330bf9: - Update the Calendar stories
  - Change the unselectable high emphasis to medium
  - Add tooltip to previous and next month buttons
  - Prevent a month only calendar wrapping to the next or previous year
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

- b07baa66: Fix for class names in selectors causing nesting issues when design tokens are density specific
- 35bb2ca8: Remove border from layer component
  Add fade animations to `LayerLayout`
- 4719e62b: Checkbox:
  -box-size -> -height and -width

  Pagination/Accordion:
  —pagination and —accordion prefixes added

  Tree node:
  —padding-left token changed to padding-left attribute: fixed typo

  Dialog/Toolbar:
  background-color changed to background as standard

  Skip link:
  —skipLink-- (double dash) changed to —skipLink-

- 1269d30f: Gradient from palette and measured characteristic fill values replaced with solid blue color in line with design change; backwards compatibility classes added to CircularProgress and Spinner
- e6164788: **BREAKING CHANGES:**

  - Move Scrim to core
    `import {Scrim} from "@jpmorganchase/uitk-core";`
  - Refactor `containerFix` and `parentRef` in to a single prop `containerRef`
  - Rename `disableEnforceFocus` prop to `disableFocusTrap`
  - Rename `returnFocus` prop to `returnFocusOptions`

- dd8c7646: Add global css box-sizing as border-box, and remove from components

### Patch Changes

- 60a04bce: Fix Dropdown button active text and icon color
- 80eb0078: Fix z-index for ComboBox, Dropdown and LayerLayout due to CSS variable name mismatch
- f21c02c9: Fix OrderedButton applying a right margin incorrectly
- 6a49e142: - Fix Accordion focus ring not appearing
  - Fix Link disabled color
  - Fix Link focus color
  - Fix Link active color
  - Fix Slider track not appearing
  - Fix selected Tab text color
  - Fix Text strong and small font weights
  - Fix ContactDetails favourite toggle color

## 0.4.0

### Minor Changes

- d5e334e9: Fix delay in truncating Text component
- d2ae5583: Update documentation for deck and layer layout components
- 4a769b51: Remove undefined css var from StepperInput
- 26af3070: - Migrate
  from
  dayjs
  to
  @internationalized/date
  in
  Calendar
  - Change
    Calendar
    initialSelectedDate
    to
    defaultSelectedDate
  - Change
    Calendar
    initialVisibleMonth
    to
    defaultVisibleMonth
  - Fix
    Shift+PageUp
    not
    moving
    focus
    properly
    in
    Calendar
    when
    using
    React
    18
- 05d606a8: Add SkipLink component to lab
- 3ac56cc2: Add z-index to dropdown and combobox list root
- fb67b559: Add deck layout component to lab
- 6364a827: Fix issue where the component anatomy sometimes would not display in the docs due to the root element not being rendered straight away

### Patch Changes

- d9fa5e85: List refactor, Dropdown refactor, ComboBox refactor, Tabs refactor, Toolbar refactor, Tree component
- 765fed67: Theme
  small additions to text characteristic

  Lab
  Breadcrumb, ContactDetails, ContentStatus, Metric, Text: apply new naming conventions for CSS variables, add backwardsCompat styling
  Enhance QA stories

  Docs
  add functionality to QAContainer

- d3ee2063: Refactor ContentStatus to use Typography components
- 55d77c1e: Refactor FileDropZone's characteristic usage
- 0ee6a5f6: Add doc for Lab/Avatar

## 0.3.0

### Minor Changes

- e306fbb: Move Input to Core
- f60520c: Move RadioButton to Core
- 15128e2: - Move FormField, FormFieldContext to Core
  - Move ValidationState and StateIcon to Core
  - Move `createContext` and `useId` to Core
- 50dcb9a: Pill style uses characteristics
- 0093d6e: Characteristic changes - text characteristic, no direct usage of typography and opacty, rename tokens to use camel case
- c2b610b: Move Switch to Core
- fe868ab: Add layer layout component to lab
- b71a4d9: StepperInput styling

### Patch Changes

- 4d6abe4: Contact details - add typography
- 1a6ce3f: Move Checkbox, FormGroup and ControlLabel to Core
- f54c332: Breadcrumbs add typography
- 68cfe8c: refactor: remove duplicated `Status` declaration
- ce84745: Standardize backwards compat classes and QA

## 0.2.0

### Minor Changes

- c8a2d13: Added BorderItem, BorderLayout, ParentChildItem, ParentChildLayout and SplitLayout components
- 008074c: Switch css/api and new tokens for switch
- 54d5442: Introduce Draggable and Drop Target characteristics
- ca201b0: Use Overlayable characteristic in CascadingMenu, Tabs, Tooltip and responsive components
- cd9c8d5: Move Panel from lab to core
- 5d9fdbe: Add storybook examples for existing layout components
- a668471: Move Tooltip, Portal and Window from lab to core
- feat: new characteristics token structure introduced #118 #46
- docs: auto gen characteristics table for component docs #134 #139
- fix: allow @types/react@18 peer dependency #131
- docs: allow all renderer and doc grid to be controlled #137
- chore: enable Chromatic #130 #133 #135 #136
- build: bump @floating-ui/react-dom-interactions to v0.5.0 #100
- chore: bump modular-scripts to v3.0.0 #97
- fix: allow `readonly` sources for list based components #107
- feat: Metric uses Text components #79
- docs: add doc for Pill, Switch #111
- feat: update default gap value for layout components #129
- fix: split and flex layout separator size #123
- feat: new `useTruncation` hook #82
- feat: new Parent and child layout component #99 #84
- feat: new Flow and Stack layout components #83
- fix: link uses underline in light theme #105
- feat: update flex default to no wrap and overflow visible #104
- test: more layout tests #101 #109
- fix: flex nowrap property #93

### Patch Changes

- 9f3254c: Checkbox svg use geometricPrecision to fix aliasing
- 5cea168: Control spacing of Split Layout by adding the gap prop.
- 24d030a: Move Card from lab to core
- 316f4d0: CheckboxIcon is component in its own right
- 0d6a74a: Fix package depends on itself
- 9f362f8: Apply `backwardCompat` to FormField QA story, to account for changing line height of helperText. Change implementation of FormActivationIndicator.

## 0.1.0

### Minor Changes

- f509a9d: Release the lab package.
