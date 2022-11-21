# @jpmorganchase/uitk-theme

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
