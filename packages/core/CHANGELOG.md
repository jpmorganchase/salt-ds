# @jpmorganchase/uitk-core

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
