# @jpmorganchase/uitk-lab

## 0.8.0

### Minor Changes

- 29b3478e: Alignment with Figma characteristics

  Added:
  --uitk-accent-fontWeight
  --uitk-draggable-horizontal-cursor-active
  --uitk-navigable-indicator-activeDisabled
  --uitk-color-grey-90-fade-foreground
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
