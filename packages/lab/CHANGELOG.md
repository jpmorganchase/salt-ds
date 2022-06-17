# @jpmorganchase/uitk-lab

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
