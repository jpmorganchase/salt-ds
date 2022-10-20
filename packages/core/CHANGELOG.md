# @jpmorganchase/uitk-core

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
