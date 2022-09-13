# @jpmorganchase/uitk-lab

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
