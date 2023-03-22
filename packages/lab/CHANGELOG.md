# @salt-ds/lab

## 1.0.0-alpha.3

### Minor Changes

- 2e0fdff0: Deprecated `--salt-size-graphic-small`, `--salt-size-graphic-medium`, `--salt-size-graphic-large`
  Deprecated `--salt-size-divider-height`, `--salt-size-divider-strokeWidth`, replaced with `--salt-size-separator-height`, `--salt-size-separator-strokeWidth`
- 242941c9: Move `Avatar` from lab to core
- 9cae606a: Deprecated differential characteristic; replaced tokens with below
  Moved differential tokens to status characteristic
  Added 'static' status variant

  ```diff
  - --salt-differential-positive-foreground
  - --salt-differential-negative-foreground
  + --salt-status-positive-foreground
  + --salt-status-negative-foreground
  + --salt-status-static-foreground
  ```

## 1.0.0-alpha.2

### Minor Changes

- b1c5c32e: Move Spinner from lab to core
- 598991f8: Move `SplitLayout` from lab to core
  Changes in `SplitLayout`

  - Removed `FlexItem` wraps around `SplitLayout` children.
  - `SplitLayout` uses `startItem` and `endItem` props as children to allow for direction.
  - Added `direction` prop to `SplitLayout`.
  - Remove `wrap` since `SplitLayout` has `direction` to control wrap by breakpoints.
  - End Aligned `endItem` so the element is always at the end of the layout.

### Patch Changes

- 94423b3c: Remove the `small` and `medium` size values from `Spinner` and add a `default` size.
- 6c9e0413: Refactor Tooltip to wrap around trigger. This is to simplify the use of Tooltip by not having to use to useTooltip hook to pass the props.
  Remove `render` and `title` props, replaced by `content` prop.
  Use '@floating-ui/react' instead of '@floating-ui/react-dom-interactions', as it's deprecated.
  Remove unused TooltipContext
- f576be1e: Move useFloatingUI from Popper to utils

## 1.0.0-alpha.1

### Minor Changes

- 7e660a8d: More Card from lab to core
- b39e51b3: Move `Panel` from lab to core

### Patch Changes

- a0724642: Fix SSR support

## 1.0.0-alpha.0

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
