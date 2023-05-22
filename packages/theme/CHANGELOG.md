# @salt-ds/theme

## 1.5.0

### Minor Changes

- b6f304f9: Added size tokens

  ```diff
  + --salt-size-adornment
  + --salt-size-bar
  + --salt-size-selectable
  + --salt-size-icon
  ```

  `--salt-size-base ` changed from a calculation on the basis unit to hardcoded values per density
  `--salt-size-border` defined as 1px per density rather than set globally

- e8b146a5: Add new spacing tokens and a spacing foundation.

  ```css
  --salt-spacing-25
  --salt-spacing-50
  --salt-spacing-75
  --salt-spacing-100
  --salt-spacing-150
  --salt-spacing-200
  --salt-spacing-250
  --salt-spacing-300
  --salt-spacing-350
  --salt-spacing-400
  ```

### Patch Changes

- 1e9ef1a2: Fix duplicate Salt libraries being installed when multiple libraries are installed

## 1.4.0

### Minor Changes

- 8bcc9d04: Deprecated tertiary editable tokens
  Deprecated `tertiary` variant in FormField
- bf66b578: Deprecated -emphasize tokens in status and palette; replaced with default tokens

  `--salt-status-error-background-emphasize` replaced with `--salt-status-error-background`
  `--salt-status-info-background-emphasize` replaced with `--salt-status-info-background`
  `--salt-status-success-background-emphasize` replaced with `--salt-status-success-background`
  `--salt-status-warning-background-emphasize` replaced with `--salt-status-warning-background`

  `--salt-palette-error-background-emphasize` replaced with `--salt-palette-error-background`
  `--salt-palette-info-background-emphasize` replaced with `--salt-palette-info-background`
  `--salt-palette-success-background-emphasize` replaced with `--salt-palette-success-background`
  `--salt-palette-warning-background-emphasize` replaced with `--salt-palette-warning-background`

- ea857f24: Deprecated `--salt-size-icon-base`, replaced with `--salt-icon-size-base`
  Added `--salt-icon-size-status-adornment`

## 1.3.0

### Minor Changes

- 6d2c3a32: Deprecate delay foundation; replace with duration
- ea010ffa: New `--salt-size-container-spacing` and `--salt-size-adornmentGap` tokens

  ```diff
  +  --salt-size-container-spacing: calc(3 * var(--salt-size-unit));
  +  --salt-size-adornmentGap: calc(0.75 * var(--salt-size-unit));
  ```

- d8f8b305: Added `--salt-accent-foreground-disabled`

  ```diff
  + --salt-accent-foreground-disabled: var(--salt-palette-accent-foreground-disabled)
  + --salt-palette-accent-foreground-disabled
  ```

- 7a025091: Bug fix

  ```diff
  - --salt-palette-interact-foreground-disabled: var(--salt-color-90-fade-foreground);
  + --salt-palette-interact-foreground-disabled: var(--salt-color-gray-90-fade-foreground);
  ```

- 91e7cbdf: Added `--salt-accent-borderColor-disabled`

  ```diff
  + --salt-accent-borderColor-disabled: var(--salt-palette-accent-border-disabled);
  + --salt-palette-accent-border-disabled
  ```

### Patch Changes

- 8d29c01f: New font family css variable for all text components which point to `--salt-typography-fontFamily`.

  ```
  --salt-text-display1-fontFamily
  --salt-text-display2-fontFamily
  --salt-text-display3-fontFamily
  --salt-text-h1-fontFamily
  --salt-text-h2-fontFamily
  --salt-text-h3-fontFamily
  --salt-text-h4-fontFamily
  --salt-text-label-fontFamily
  ```

## 1.2.0

### Minor Changes

- 974c92da: - New characteristics introduced in `accent`, new palette token

  ```diff
  + --salt-accent-background-disabled: var(--salt-palette-accent-background-disabled);
  + --salt-palette-accent-background-disabled
  ```

  - New characteristics introduced in `selectable`, new palette tokens

  ```diff
  + --salt-selectable-foreground: var(--salt-palette-interact-foreground);
  + --salt-selectable-foreground-disabled: var(--salt-palette-interact-foreground-disabled);
  + --salt-selectable-foreground-hover: var(--salt-palette-interact-foreground-hover);
  + --salt-selectable-foreground-selected: var(--salt-palette-interact-foreground-active);
  + --salt-selectable-foreground-selectedDisabled: var(--salt-palette-interact-foreground-activeDisabled);
  + --salt-palette-interact-foreground-active
  + --salt-palette-interact-foreground-activeDisabled
  + --salt-palette-interact-foreground-hover
  ```

  Updated values in light mode

  ```diff
  - --salt-palette-interact-foreground: var(--salt-color-gray-900);
  + --salt-palette-interact-foreground: var(--salt-color-gray-200);
  - --salt-palette-interact-foreground-disabled: var(--salt-color-gray-900-fade-foreground);
  + --salt-palette-interact-foreground-disabled: var(--salt-color-gray-200-fade-foreground);
  - --salt-palette-interact-foreground-hover: var(--salt-color-gray-500);
  + --salt-palette-interact-foreground-hover: var(--salt-color-blue-500);
  ```

  Updated values in dark mode

  ```diff
  - --salt-palette-interact-foreground: var(--salt-color-white);
  + --salt-palette-interact-foreground: var(--salt-color-gray-90);
  - --salt-palette-interact-foreground-disabled: var(--salt-color-white-fade-foreground);
  + --salt-palette-interact-foreground-disabled: var(--salt-color-gray-90-fade-foreground);
  - --salt-palette-interact-foreground-hover: var(--salt-color-gray-500);
  + --salt-palette-interact-foreground-hover: var(--salt-color-blue-500);
  ```

  - Deprecated the following `selectable` tokens, use `--salt-text-primary-foreground` and `--salt-text-primary-foreground-disabled` as replacements

  ```diff
  - --salt-selectable-cta-foreground
  - --salt-selectable-cta-foreground-disabled
  - --salt-selectable-primary-foreground
  - --salt-selectable-primary-foreground-disabled
  - --salt-selectable-secondary-foreground
  - --salt-selectable-secondary-foreground-disabled
  - --salt-selectable-foreground-partial
  - --salt-selectable-foreground-partialDisabled
  ```

  - `Measured` characteristic replaced with `Track`

  Deprecated tokens prefixed by `--salt-measured-` and corresponding palette tokens
  New `--salt-track-` tokens and corresponding palette tokens

  The following are a direct replacement mapping:

  ```diff
  - --salt-measured-borderStyle
  - --salt-measured-borderStyle-active
  - --salt-measured-borderStyle-complete
  - --salt-measured-borderStyle-incomplete
  + --salt-track-borderStyle
  + --salt-track-borderStyle-active
  + --salt-track-borderStyle-complete
  + --salt-track-borderStyle-incomplete
  - --salt-measured-borderWidth
  - --salt-measured-borderWidth-active
  - --salt-measured-borderWidth-complete
  - --salt-measured-borderWidth-incomplete
  + --salt-track-borderWidth
  + --salt-track-borderWidth-active
  + --salt-track-borderWidth-complete
  + --salt-track-borderWidth-incomplete
  - --salt-measured-fontWeight
  - --salt-measured-textAlign
  + --salt-track-fontWeight
  + --salt-track-textAlign
  - --salt-measured-background: var(--salt-palette-measured-background);
  - --salt-measured-background-disabled: var(--salt-palette-measured-background-disabled);
  - --salt-measured-borderColor: var(--salt-palette-measured-border);
  + --salt-track-background: var(--salt-palette-track-background);
  + --salt-track-background-disabled: var(--salt-palette-track-background-disabled);
  + --salt-track-borderColor: var(--salt-palette-track-border);
  + --salt-track-borderColor-disabled: var(--salt-palette-track-border-disabled);
  - --salt-palette-measured-background
  - --salt-palette-measured-background-disabled
  - --salt-palette-measured-border
  - --salt-palette-measured-border-disabled
  + --salt-palette-track-background
  + --salt-palette-track-background-disabled
  + --salt-palette-track-border
  + --salt-palette-track-border-disabled
  ```

  The following should be replaced with the corresponding `selectable` tokens:

  ```diff
  - --salt-measured-foreground: var(--salt-palette-measured-foreground);
  - --salt-measured-foreground-disabled: var(--salt-palette-measured-foreground-disabled);
  - --salt-measured-foreground-hover: var(--salt-palette-measured-foreground-active);
  - --salt-measured-foreground-active: var(--salt-palette-measured-foreground-active);
  - --salt-measured-foreground-activeDisabled: var(--salt-palette-measured-foreground-activeDisabled);
  - --salt-measured-borderColor-disabled: var(--salt-palette-measured-border-disabled);
  ```

  The following should be replaced with the corresponding `accent` background tokens:

  ```diff
  - --salt-measured-fill: var(--salt-palette-measured-fill);
  - --salt-measured-fill-disabled: var(--salt-palette-measured-fill-disabled);
  ```

  - Usages of `measured` tokens in core and labs components updated to use appropriate characteristic replacement

  - Deprecated the following tokens, no replacement needed:

  ```diff
  - --salt-measured-foreground-undo
  - --salt-palette-measured-fill
  - --salt-palette-measured-fill-disabled
  - --salt-palette-measured-foreground-active
  - --salt-palette-measured-foreground-activeDisabled
  - --salt-palette-interact-foreground-partial
  - --salt-palette-interact-foreground-partialDisabled
  ```

- d2b983de: New status tokens

  ```diff
  + --salt-status-info-foreground-disabled: var(--salt-palette-info-foreground-disabled);
  + --salt-status-success-foreground-disabled: var(--salt-palette-success-foreground-disabled);
  + --salt-status-warning-foreground-disabled: var(--salt-palette-warning-foreground-disabled);
  + --salt-status-error-foreground-disabled: var(--salt-palette-error-foreground-disabled);
  + --salt-status-static-foreground-disabled: var(--salt-palette-neutral-secondary-foreground-disabled);
  + --salt-status-negative-foreground-disabled: var(--salt-palette-negative-foreground-disabled);
  + --salt-status-positive-foreground-disabled: var(--salt-palette-positive-foreground-disabled);

  + --salt-status-info-borderColor-disabled: var(--salt-palette-info-border-disabled);
  + --salt-status-success-borderColor-disabled: var(--salt-palette-success-border-disabled);
  + --salt-status-warning-borderColor-disabled: var(--salt-palette-warning-border-disabled);
  + --salt-status-error-borderColor-disabled: var(--salt-palette-error-border-disabled);

  + --salt-palette-info-border-disabled
  + --salt-palette-info-foreground-disabled
  + --salt-palette-warning-border-disabled
  + --salt-palette-warning-foreground-disabled
  + --salt-palette-error-border-disabled
  + --salt-palette-error-foreground-disabled
  + --salt-palette-success-foreground-disabled
  + --salt-palette-success-border-disabled
  + --salt-palette-negative-foreground-disabled
  + --salt-palette-positive-foreground-disabled
  ```

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
