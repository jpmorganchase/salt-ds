# @salt-ds/core

## 1.2.0

### Minor Changes

- afe57829: Add text background color for highlighted text globally and on Text component
- 1e69cf3b: Move `Tooltip` from lab to core
  Move `useFloatingUI` from lab to core
- b1c5c32e: Move Spinner from lab to core
- 88673e4a: Add `disabled` prop to Text component
- 598991f8: Move `SplitLayout` from lab to core
  Changes in `SplitLayout`

  - Removed `FlexItem` wraps around `SplitLayout` children.
  - `SplitLayout` uses `startItem` and `endItem` props as children to allow for direction.
  - Added `direction` prop to `SplitLayout`.
  - Remove `wrap` since `SplitLayout` has `direction` to control wrap by breakpoints.
  - End Aligned `endItem` so the element is always at the end of the layout.

## 1.1.0

### Minor Changes

- dfecfc12: extending `as` property from `FlexLayout` to `StackLayout` and `FlowLayout` so they can use polymorphic behaviour
- 380bbb91: Remove foundations from 'characteristic' type and add missing characteristic 'differential'

  ```diff
  -  "delay"
  -  "disabled"
  -  "icon"
  -  "shadow"
  -  "size"
  -  "spacing"
  +  "differential"
  ```

- 7e660a8d: More Card from lab to core
- 4a282d10: - Removed `div` wrapper with `display:content` from `FlexLayout` childrens with separators. This allows styles like `.classname > div` to be passed.
  - Add separators to `StackLayout`.
  - Add direction to `StackLayout` to allow horizontal stacks.
- b39e51b3: Move `Panel` from lab to core

### Patch Changes

- 7a0effdb: Fix Link not removing underline on hover or focus.
- a0724642: Fix SSR support
- ed76bb21: Fixed an issue where Text styles would leak into nested text.

## 1.0.0

### Major Changes

- c1bc7479: Salt is the J.P. Morgan design system, an open-source solution for building exceptional products and digital experiences in financial services and other industries. It offers you well-documented, accessible components as well as comprehensive design templates, style libraries and assets.

  With this initial release we're providing:

  - AG Grid Theme
  - Border Layout
  - Button
  - Data Grid
  - Flex Layout
  - Flow Layout
  - Grid Layout
  - Icon
  - Link
  - Salt Provider
  - Stack Layout
  - Status Indicator
  - Text
  - Theme

  And a number of other lab components.
