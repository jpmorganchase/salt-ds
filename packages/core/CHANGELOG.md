# @jpmorganchase/uitk-core

## 0.10.0

### Minor Changes

- 6c9f7b1e: - Fix `FlowLayout` types
  - Remove separators prop from `SplitLayout`
  - Rename BorderItem positions to follow border layout conventions
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

- 1925fd4f: Added `"scope"` as an option for `applyClassesTo` prop which causes classes to be applied to a div element created by the `ToolkitProvider`.

  **BREAKING CHANGE:**
  The default value of `applyClassesTo` is now `"root"` for root level `ToolkitProviders` and `"scope"` for nested `ToolkitProviders`.

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

- b7e456b3: Remove `-hover` and `-selected` text foreground styles

  ```diff
  - --uitk-text-primary-foreground-hover
  - --uitk-text-primary-foreground-selected
  - --uitk-text-secondary-foreground-hover
  - --uitk-text-secondary-foreground-selected
  ```

- 9fbcf42a: Add "as" prop to `FlexLayout` and `FlexItem`.
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

- 0f2a3988: ### Button refactor

  - Removed internal `<span/>` from `Button`, children are now direct children of the component.
  - CSS Refactor to remove old browser support.
  - Fix `aria-disabled` to only show when not redundant.
  - Added active visual style to `Button` when either `spacebar` or `enter`.
  - Removed `DivButton`. For lab components that used `DivButton`, it's been replaced by a `Button` (`Tab` and `Dropdown`) or a custom internal `div` (`Pill`).

- 8c075106: Use American English 'gray' throughout code

### Patch Changes

- df205133: Nested ToolkitProviders no longer create multiple ResizeObservers to detect viewport width
- d86de02f: Move Text component from 'lab' to 'core'

## 0.8.0

### Minor Changes

- d636f6a7: Add `tabIndex` and `id` to `DeckItem`
  Add `deckItemProps` prop to `DeckLayout`
- 475f531c: change applyClassesToChild prop to applyClassesTo prop in ToolkitProvider, if this prop is set to "root" on a root level Toolkitprovider, then the provider will apply the theme classes to the html element instead of creating a uitk-theme element. Setting the prop to "child" will make the ToolkitProvider apply the classes to the child element as before
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

- 5478cd2a: Remove separators from FlowLayout and restrain separators in FlexLayout to layouts with wrap = false
- 38c46088: Remove backwards compatibility functionality
- 2cb9429f: Add `role="dialog"` and `aria-modal="true"` to `LayerLayout` when `Scrim` is not being used
- 0088d56a: Add "as" prop to `GridLayout`, `GridItem`, `BorderLayout` and `BorderItem`
- 42f79714: Remove container, selectable and editable -borderRadius tokens; replace with 0 where container-borderRadius was already being used
- b66d2b0c: Refactor Switch CSS to remove `:not` usage.
- 3708f946: Rename component `StatusIcon` to `StatusIndicator`.
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

- ce4756a1: Remove uitk-theme custom element and replace it with div element. The custom element may cause confusion.

### Patch Changes

- f48f7cc2: Fix tooltip doesn't have z-index applied
- 212a2823: Separate ToolkitContext into Density, Theme and Breakpoint contexts. This will prevent any component where useTheme is used from re-rendering if density updates in the context and vice versa.
- e52e83dd: Refactor Tooltip to use StatusIcon
- e52e83dd: Fix StatusIcon fill specificity
- 9a7b6020: Switch: remove console.log from change handler
- 06d86e60: Remove warning and rely on native console

## 0.7.0

### Minor Changes

- 919e3931: Only trigger ParentChildItem animations when a direction is passed
- 63c64c98: - Change characteristics order for consistency
  - Add explanatory text to status prop
  - Change validation name status order for consistency
- ce778adc: Set button's default type attribute to "button" rather than "submit"

### Patch Changes

- fdb9dd63: Fix missing prop "align" in SplitLayout

## 0.6.0

### Minor Changes

- 3aac68ac: Ensure component tokens start with their full name, as well as for any subcomponents, in all private and public tokens. Examples: --uitkCheckboxIcon- -> --uitkCheckbox-icon-, --uitkAccordionSummary- -> --uitkAccordion-summary-, --formHelperText -> --formField-helperText
- 5d8e5c74: Focus visible API removed from components; always use theme characteristics directly for focus visible styling
- affc02c8: Add `enableContainerMode` prop to Scrim to be used in combination with existing containerRef in order to make Scrim have its position fixed to a container element instead of the whole window. This prop was previously removed under the name `containerFix`.
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
- 24a9e758: Change the default wrap value in `FlexLayout` to false so it matches css Flexbox and replace `disableWrap` prop with `wrap`
- 0f69ab38: Rename `StateIcon` component to `StatusIcon`
  Rename `state` prop in `StatusIcon` to `status`
- 563ac7ca: Move `Deck` and `Layer` components from Lab to Core
  Move responsive functions `useResizeObserver` and `useWidth` from Lab to Core
  Move utils function `usePrevious` from Lab to Core
- 5ecaf64c: Add active and interactable disabled styling to Card
- 16624115: Removed the elementType prop from Button, making it non-polymorphic.

### Patch Changes

- ff02377e: Fixes a bug in ToolkitContext which had previously set the default breakpoints to an empty object. Now it is set to a valid Breakpoints object, specifically the default Breakpoints.
- 1f2fc236: Remove import directly from `src` so consumers won't encounter
  TS error if `skipLibCheck` is set to false.
- d208f8b1: Fix circular dependencies warning
- 60728c1c: PillBase moved to root folder of Pill;
  RadioButton subcomponents to begin with component name:
  Radio -> RadioButtonBase
  RadioIcon -> RadioButtonIcon

## 0.5.0

### Minor Changes

- 643d8fd7: Fix Checkbox horizontal group spacing
- 28c01314: Tooltip characteristics and docs update
- 9b4964ae: Change checkbox -solid-color token to -fill
- 58adde30: Ensure CSS attributes in all private and public tokens are always kebab case, e.g.:
  --uitkDialog-border-color -> --uitkDialog-borderColor
  --accordion-summary-padding-left -> --accordion-summary-paddingLeft
  --grid-item-grid-row-end -> --grid-item-gridRowEnd
- 60ec66b7: remove empty stylesheet from `BorderLayout`
  add custom styles to pill used in `BorderLayout` storybook composite example
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

- 23550f22: Replace default value for success aria label in StateIcon
- e6164788: **BREAKING CHANGES:**

  - Move Scrim to core
    `import {Scrim} from "@jpmorganchase/uitk-core";`
  - Refactor `containerFix` and `parentRef` in to a single prop `containerRef`
  - Rename `disableEnforceFocus` prop to `disableFocusTrap`
  - Rename `returnFocus` prop to `returnFocusOptions`

- dd8c7646: Add global css box-sizing as border-box, and remove from components

### Patch Changes

- 690e4aec: Fixed issue where disabled button would still appear to be clickable
- 4aa187b2: Fix theme getCharacteristicValue function.
- 3dff3d3b: Apply
  aria-disabled
  to
  Pill
  when
  it's
  disabled
- 791e8b10: Fix Button `justify-content` invalid css value

## 0.4.0

### Minor Changes

- 4ba8654a: Use React's own useId implementation when available
- 5ca5d9da: Change FlexLayout component to wrap by default
- d5e334e9: Add leading option to debounce util

### Patch Changes

- 34af2268: Fix styling for focused state when FormField has helper text
- e1472d61: Prevent AriaAnnouncer breaking full height layouts
- 68c4493b: Fix click being called by Button when focusWhenDisabled and disabled are true.
- bb99c30b: Add TooltipProps to Pill

## 0.3.0

### Minor Changes

- e306fbb: Move Input to Core
- f60520c: Move RadioButton to Core
- 15128e2: - Move FormField, FormFieldContext to Core
  - Move ValidationState and StateIcon to Core
  - Move `createContext` and `useId` to Core
- b10b5d1: Moved BorderItem, BorderLayout, ParentChildItem, ParentChildLayout and SplitLayout from lab to core
- 0093d6e: Characteristic changes - text characteristic, no direct usage of typography and opacty, rename tokens to use camel case
- c2b610b: Move Switch to Core

### Patch Changes

- 5170737: Add CSS variables to API for button icon
- 59a3da0: Update Layouts documentation, change internal CSS variables for grid layout columnGap and rowGap
- d36c9dd: Fix Flex layout's separators
- 1a6ce3f: Move Checkbox, FormGroup and ControlLabel to Core
- ce84745: Standardize backwards compat classes and QA

## 0.2.0

### Minor Changes

- 5bec4f8: Icon uses text characteristics color
- 64e1d68: modified gap so it increases in intervals of the size unit (1) instead of the default multiplier (3)
- c8a2d13: Moved FlexItem, FlexLayout, FlowLayout, GridItem, GridLayout, and StackLayout components from lab to core
- cd9c8d5: Move Panel from lab to core
- 5d9fdbe: Add storybook examples for existing layout components
- f5facb1: Icon component and createIcon util is move from core to icons package
- a668471: Move Tooltip, Portal and Window from lab to core
- feat: new characteristics token structure introduced #118 #46
- docs: auto gen characteristics table for component docs #134 #139
- fix: allow @types/react@18 peer dependency #131
- docs: allow all renderer and doc grid to be controlled #137
- chore: enable Chromatic #130 #133 #135 #136
- build: bump @floating-ui/react-dom-interactions to v0.5.0 #100
- chore: bump modular-scripts to v3.0.0 #97

### Patch Changes

- 24d030a: Move Card from lab to core

## 0.1.0

### Minor Changes

- f509a9d: Release the core package.
