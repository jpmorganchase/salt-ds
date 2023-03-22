# @salt-ds/theme

## 1.1.0

### Minor Changes

- d460fb7b: Deprecated `--salt-size-detail`; replaced with `--salt-size-compact`
- 5ead0bbf: Deprecated `--salt-size-selection`; replaced with `--salt-size-selectable`
- 2e0fdff0: Deprecated `--salt-size-graphic-small`, `--salt-size-graphic-medium`, `--salt-size-graphic-large`
  Deprecated `--salt-size-divider-height`, `--salt-size-divider-strokeWidth`, replaced with `--salt-size-separator-height`, `--salt-size-separator-strokeWidth`
- 9d3dda91: Theme update: changed the value of `--salt-palette-warning-border` and `--salt-palette-warning-foreground` to `--salt-color-orange-700` in light mode to fix accessibility issues
- 649d5394: Added a new opacity token for readonly backgrounds

  ```diff
  - --salt-color-white-fade-background-readonly: rgba(255, 255, 255, var(--salt-palette-opacity-readonly));
  - --salt-color-gray-20-fade-background-readonly: rgba(234, 237, 239, var(--salt-palette-opacity-readonly));
  - --salt-color-gray-600-fade-background-readonly: rgba(47, 49, 54, var(--salt-palette-opacity-readonly));
  - --salt-color-gray-800-fade-background-readonly: rgba(36, 37, 38, var(--salt-palette-opacity-readonly));
  + --salt-palette-opacity-background-readonly: var(--salt-opacity-1)
  + --salt-color-white-fade-background-readonly: rgba(255, 255, 255, var(--salt-palette-opacity-background-readonly));
  + --salt-color-gray-20-fade-background-readonly: rgba(234, 237, 239, var(--salt-palette-opacity-background-readonly));
  + --salt-color-gray-600-fade-background-readonly: rgba(47, 49, 54, var(--salt-palette-opacity-background-readonly));
  + --salt-color-gray-800-fade-background-readonly: rgba(36, 37, 38, var(--salt-palette-opacity-background-readonly));
  ```

- e33f5610: Theme update: changed the value of `--salt-palette-success-border` and `--salt-palette-success-foreground` to `--salt-color-green-400` in dark mode to fix accessibility issues
- d975171f: Deprecated `--salt-size-brandBar`; replaced with `--salt-size-accent` with new density dependent values
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

- 1f579da6: Added tokens for success, warning, and error backgrounds on selected state

  ```diff
  + --salt-status-success-background-selected
  + --salt-status-warning-background-selected
  + --salt-status-error-background-selected
  + --salt-palette-success-background-selected
  + --salt-palette-warning-background-selected
  + --salt-palette-error-background-selected
  ```

### Patch Changes

- 8e9446bf: Fixed the shadow token value

  ```diff
  - --salt-shadow-5: 0 12px 40px 5px var(--salt-shadow-5-color);
  + --salt-shadow-5: 0 12px 40px 0 var(--salt-shadow-5-color);
  ```

- 1ad02da3: Deprecated `--salt-overlayable-shadow-scroll-color`, use `--salt-shadow-1-color` instead

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
