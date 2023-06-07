# @salt-ds/lab

## 1.0.0-alpha.10

### Minor Changes

- 9d68637a: Moved form-field-next and form-field-context-next to core as form-field and form-field-context

  `FormField`: First version of Form Field built with a compositional API by providing the following components alongside:
  `FormFieldHelperText`: Helper text component
  `FormFieldLabel`: Form label component (compatible with left and top placement)
  `FormFieldControlWrapper`: Styling container for controls used within Form Field

  `FormFieldContext`, `useFormFieldProps`: Context and hook for inner controls to respond to disabled, readonly, and validation state on the parent Form Field

- 22c626e6: **Breaking change**

  Rename `Input` to `InputLegacy`
  All API tokens with `--saltInput-` prefix changed to `--saltInputLegacy-` prefix

- bf5a9441: **Breaking change**

  Rename `FormField` to `FormFieldLegacy`
  All API tokens with `--saltFormField-` prefix changed to `--saltFormFieldLegacy-` prefix

- eb3db91c: Removed `startAdornment` and `endAdornment` props from `InputNext`. Props will be added back once adornments come in v2

  Moved input-next to core as input

  `Input`: First version of `InputNext` renamed to Input

  - All tokens prefixed `--saltInputNext-` changed to prefix `--saltInput-`

  Moved status-adornment to core

  `StatusAdornment`: Component to be used for validation status indication

- 24f44d8a: Add docs for InputNext
- 3e6441df: **Nav Item**

  Nav Item allows you to compose Navigation patterns.

  ```tsx
  <NavItem active parent expanded href="#" onExpand={(event) => {}}>
    Nav Item
  </NavItem>
  ```

- c82a39ab: `FormFieldNext` tests
  Added back `a11yValueAriaProps` type for `a11yProps` in `FormFieldContextNextValue`
  Added `id={a11yProps?.["aria-describedby"]}` to helper text
  Added `id={a11yProps?.["aria-labelledby"]}` to label
- 95a360b8: `InputNext`: `InputProps` interface changed to extend `Omit<ComponentPropsWithoutRef<"div">,"defaultValue">, Pick<ComponentPropsWithoutRef<"input">, "disabled" | "value" | "defaultValue">`

  `ref` prop moved to target container div: for direct ref on input component, use new `inputRef` prop

- d78ff537: Refactored all components to use new style injection mechanism provided by `@salt-ds/styles`

### Patch Changes

- fef8ef56: Banner changes:

  - Remove `emphasize`, `announcement` and `disableAnnouncer` props
  - Add `variant` prop
  - Replace `BannerCloseButton` component with `BannerActions`

- 46af9f8c: Move Banner to core

## 1.0.0-alpha.9

### Minor Changes

- 4bd407b6: Fix Tabstrip crashing when `activeTabIndex` is set to null
- 3aba7cc0: Fixed id in `FormFieldNext`, and ids in `FormFieldLabel` and `FormFieldHelperText` from useFormFieldPropsNext
  Deleted `a11yValueAriaProps`, replaced `a11yProps` type with `A11yValueProps` in `FormFieldContextNext`
- e7230ade: Added `textAlign` prop to `InputNext` with possible configurations: "left" (default), "right", "center"
- 2d63d305: Changes to Form Field and Input CSS:

  - fixes background color when disabled
  - fixes cursor on helper text
  - fixes activation indicator width on active state
  - usage of `grid-template-areas`

  Removes CSS API variables:

  ```diff
  - --saltInputNext-borderColor-active
  - --saltInputNext-borderColor-hover
  - --saltInputNext-borderColor-focused
  - --saltInputNext-borderWidth
  - --saltInputNext-borderStyle
  - --saltInputNext-borderRadius
  - --saltInputNext-cursor
  ```

### Patch Changes

- 922b1fb8: Updated Banner to use the new spacing foundation

## 1.0.0-alpha.8

### Minor Changes

- 2e04f9bc: Moved `useFormFieldPropsNext` and `FormFieldContextNext` to `./form-field-context-next`
  Move `a11yValueAriaProps`, `A11yValueProps` to `FormFieldContextNext`
- b8ef52a3: Add `emptyReadOnlyMarker` prop to `InputNext`
- c3b945f0: Removed `startAdornment` and `endAdornment` props in InputNext; adornments will come in Input v2

### Patch Changes

- ebf58d26: Banner

  - Remove `render` prop
  - Remove `Link` component from content
  - Create composable components `BannerContent` and `BannerCloseButton`

- 1e9ef1a2: Fix duplicate Salt libraries being installed when multiple libraries are installed

## 1.0.0-alpha.7

### Minor Changes

- 562ddb0c: Added `endAdornment` and `startAdornment` props to `InputNext`
- eeb45421: Switch `FormFieldNext` to use a compositional based API

  ```jsx
  <FormFieldNext {...props}>
    <FormFieldLabel>My label</FormFieldLabel>
    <InputNext defaultValue="Value" />
    <FormFieldHelperText>Helper text</FormFieldHelperText>
  </FormFieldNext>
  ```

  Removed `helperText`, `label` props from `FormFieldNext`

  Removed `FormFieldLabelProps`
  Removed `FormFieldHelperTextProps`

- d0f97318: Added `validationStatus` to `InputNext`, `FormFieldNext`, `FormFieldContextNext`

  Added `StatusAdornment`, `ErrorAdornment`, `SuccessAdornment`, `WarningAdornment` components

  Removed `disabled` prop from `FormFieldHelperText`, `FormFieldLabel`

  Renamed `useA11yValueValue` to `u11yValueAriaProps`
  Removed `disabled` and `readOnly` out of `u11yValueAriaProps` and separated out `disabled`, `readOnly` within `FormFieldContextNext`
  Removed `useA11yValue` hook

  Removed `type`, `onChange` prop from InputNext

## 1.0.0-alpha.6

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

- 47132c22: Added `FormFieldNext` component with associated `FormFieldLabel` and `FormFieldHelperText` components
  Added `FormFieldContextNext`, `useFormFieldPropsNext`
  Added `InputNext` component

## 1.0.0-alpha.5

### Minor Changes

- 9bee69f4: Move `Checkbox` from lab to core
- ea010ffa: New `--salt-size-container-spacing` and `--salt-size-adornmentGap` tokens

  ```diff
  +  --salt-size-container-spacing: calc(3 * var(--salt-size-unit));
  +  --salt-size-adornmentGap: calc(0.75 * var(--salt-size-unit));
  ```

- 4a51e4c6: Remove Radio Button and Radio Button Group
- 85647494: Move capitalize util from lab to core

### Patch Changes

- 139633d5: Improve Tabs alignment in AppHeader
- 3e7a1b0f: Checkbox

  Removed `CheckboxBase` and replaced with `Checkbox`
  Added `error` prop for error state styling.

  CheckboxGroup

  Removed `legend` and `LegendProps` prop; will be implemented by FormField.
  Replaced `row` prop with `direction` prop.
  Added `wrap` prop.

  CheckboxIcon

  Added `error` prop for error state styling.
  Added `disabled` prop for disabled state styling.

- ae3c837e: Fix focus ring doesn't show up when Dropdown is wrapped in Form Field

## 1.0.0-alpha.4

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

- f1b7a60d: - Add `colorName` to `Color`. When `Color` is set to a color in the Salt color palette `colorName` will be set to the color's name.
  - Fix colors with an alpha value of 0 not being correctly recognized by `isTransparent`

### Patch Changes

- b0e390c5: RadioButton

  Removed `RadioButtonBase` and replaced with `RadioButton`
  Removed `icon` prop; icon is not customizable any more.
  Added `inputProps` prop to be passed to the radio input.
  Added `error` prop for error state styling.

  RadioButtonGroup

  Removed `icon` prop; icon is not customizable any more.
  Removed `legend` prop; will be implemented by FormField.
  Removed `radios` prop; should be the users' responsibility to provide the nested RadioButtons as children.
  Replaced `row` prop with `direction` prop.
  Added `wrap` prop.

  RadioButtonIcon

  Added `error` prop for error state styling.
  Added `disabled` prop for disabled state styling.

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
