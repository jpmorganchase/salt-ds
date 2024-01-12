# @salt-ds/core

## 1.13.4

### Patch Changes

- 70fad5a1: Updated @floating-ui/react to 0.26.5.
- c49c246e: Removed redundant Icon color overrides.
- b4d72c16: Fixed FloatingComponent types
- dbe8571b: Fixed Input placeholder color.

## 1.13.3

### Patch Changes

- f7fcbd11: Fixed issue where components are not injecting their styles.
- bb250947: Fixed `Badge` appearing over `Dialogs` due to an incorrect z-index.

## 1.13.2

### Patch Changes

- 2ca80cb7: Fixed Input and Multiline Input button adornments being clipped if they contain text.
  Fixed nested buttons being affected by overrides applied to Input and Multiline Input button adornments.
  Fixed Multiline Input button adornments being an incorrect size.
- d6e2e2c1: Fixed nested Salt Providers not inheriting a parent provider's `enableStyleInjection` value.

## 1.13.1

### Patch Changes

- 7f58c773: Fixed Tooltip breaking when used inside a Form Field with an invalid value passed to the `validationStatus` prop.

## 1.13.0

### Minor Changes

- c85334b5: `Text` component has two new variants: `TextAction` and `TextNotation`. See [Text component](/salt/components/text) for more information.

  ```tsx
  <Text styleAs="notation" as="span">Lorem ipsum</Text>
  <Text styleAs="action" as="span">Lorem ipsum</Text>
  ```

  ```tsx
  <TextNotation>Lorem ipsum</TextNotation>
  <TextAction>Lorem ipsum</TextAction>
  ```

## 1.12.0

### Minor Changes

- 966c362f: Supports turning off style injection via `SaltProvider`.

  ```tsx
  <SaltProvider enableStyleInjection={false} >
  ```

Expose a CSS file that allows Salt to be used without runtime CSS injection.

```tsx
import "@salt-ds/core/css/salt-core.css";
```

- feb80146: **_Theming and CSS updates_** with visual changes to Salt components:

  1. Minor changes in `Button` component width as font weight gets updated. Font weight for two button variants,`CTA` and `Primary` changed from bold to semi-bold. Expect components containing Salt `Button` to have similar change.

  ```diff
  - --salt-actionable-cta-fontWeight
  - --salt-actionable-primary-fontWeight
  - --salt-actionable-secondary-fontWeight
  + --salt-text-action-fontWeight
  ```

  ![Button before and after](/packages/core/images/buttons-old-and-new.png)

  2. Disabled `InteractableCard` component has default border color updated from blue to grey.

  ```diff
  - --salt-accent-borderColor-disabled
  + --salt-container-primary-borderColor-disabled
  ```

  ![Interactable Card before and after](/packages/core/images/card-old-and-new.png)

  3. `Avatar` component line height in HD updated from `11px` to `10px`.

  4. Small `Spinner` component size in HD updated from `12px` to `10px`.

  **_Theming and CSS updates_** with no visual change to Salt components, useful for teams overriding theme locally:

  - `Avatar` component CSS token name updated

  ```diff
  - --salt-icon-size-base
  + --salt-size-icon
  ```

- 01fa27ad: Added Badge.

  Badge is a numeric or alpha character annotation that represents a number of items. It appears either on the top-right of an element, or inline.

  ```
    <Badge value={9}>
      <Button>
        <NotificationSolidIcon />
      </Button>
    </Badge>
  ```

- c6f5feeb: Added a secondary variant to `Card` and `InteractableCard` via their `variant` prop.

  ```tsx
  <Card variant="secondary" />
  <InteractableCard variant="secondary" />
  ```

### Patch Changes

- 9dbe7f4c: Fixed component text properties (`font-weight`, `font-family`, `font-size`, `line-height`) incorrectly inheriting external global styles, which should follow the text characteristic from the Salt theme.

  - Avatar
  - Badge
  - Banner
  - Card
  - Form Field
  - Panel
  - Switch
  - Text
  - Toast
  - Tooltip

- bb41157b: Fixed alignment for Checkbox and Radio Button. They are now correctly aligned to their labels.
  Fixed alignment for Checkbox Group and Radio Button Group when in a Form Field with label left. The Form Field label is now inline with the groups.

## 1.11.1

### Patch Changes

- 1ae74f49: Fix Tooltip status icon alignment

## 1.11.0

### Minor Changes

- 90fa68a1: Added Switch.

  Switch is a binary control used to toggle between two different states. When interacted with, the thumb of the switch travels along the track to indicate state. Switch is used to control settings, preferences, or actions within an application or system.

  ```tsx
  const [checked, setChecked] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    onChange?.(event);
  };

  return <Switch checked={checked} onChange={handleChange} />;
  ```

- 90abd261: Added `medium` size as an alias for `default` to Spinner component to make it more consistent with other components. `default` will be deprecated and removed in the future.

### Patch Changes

- 4f95aa96: Fixed the Viewport Provider not setting initial viewport measurements.
- e7cdafa4: Fixed Radio Button and Checkbox incorrectly inheriting text styles.

## 1.10.0

### Minor Changes

- 319140a6: Add `small` size to Spinner

### Patch Changes

- 7b8a169a: Added flex-grow to splitLayout so it takes 100% of the container's direction
- 7d846f2f: fix gap multiplier for StackLayout and FlexLayout touch

## 1.9.1

### Patch Changes

- 45eaeeb5: Fix `useId` not found error bundled by Webpack

## 1.9.0

### Minor Changes

- d972ead6: ## Added desktop support for Tooltips

  Advanced Desktop support can now be achieved for floating components such as `<Tooltip>`, `<Dropdown>` and `<Combobox>` by passing a [Floating UI Platform](https://floating-ui.com/docs/platform) via a new `<FloatingPlatformProvider>` component.

  This enables advanced use-cases e.g. on multi-window desktop applications for example where you may want to render a `Tooltip` in an external window, and position it relative to a global coordinate space such as a user's desktop.

  To support this use-case you can also pass a component to be used as the root for floating components such as `<Tooltip>`, overriding the default. This is done using the `<FloatingComponentProvider>`. The component used as the FloatingComponent will receive the Floating UI props used for positioning, as well as `open`, so you can hook into the Tooltip
  s lifecycle e.g. to activate external windows.

### Patch Changes

- 49614c3a: Remove Button's min-height
- d8470fee: Fixes extra padding below a control in Form Field when no helper text provided

## 1.8.2

### Patch Changes

- dfdf4c26: Checkbox and RadioButton readonly states made focusable by default
- 6c2d10d7: Added new internal --statusIndicator-Color css variable for StatusIndicator. Additionally StatusIndicator will now set `color` as well as the `saltIcon-color` css variable
- c7ce7642: Remove extra styling from `Card` and `InteractableCard`. This should make them more generic and easier to use.
- 2b34c155: Fixed bug in GridLayout where `columnGap` and `rowGap` couldn't be set to zero
- 402e13f7: Browser compatibility CSS changes.

  Added missing prefix to `appearance` and revert `padding-inline`, `padding-block` and `margin-block` to improve browser compatibility with Chrome 79

## 1.8.1

### Patch Changes

- fa77a894: Input and MultilineInput readonly states made focusable by default
- 83c537a5: Fix svg centering when used as icon in `Checkbox` and `RadioButton`.

## 1.8.0

### Minor Changes

- b2ca1f11: Add MultilineInput.

  Multiline Input provides an editable text area in which users can enter multiple lines of text and numeric values.

  ```tsx
  <MultilineInput defaultValue="Value" />
  ```

### Patch Changes

- ce0c73b7: Remove selected hover styles from Checkbox and Radio Button.
- 90e4604b: Add scrollIntoView on Toast mount
- 73bb60df: Add margin bottom on Toast
- a1c95484: Fixed spacing between status icon and helper text in Form Field
- e070e76d: Fix alignment of label in Form Field when positioned left or right
- a6f83794: Fix Radio Button read-only icon
- 1f10586c: Fixed spacing between necessity asterisk and label in Form Field
- 8f99ee39: Updated font-weight of strong Label to use --salt-text-label-fontWeight-strong
- 6fcf20a3: Fixed control size in Radio Button to match the shown icon size.
- ecb9893c: Fixed interactable card styles clashing with card styles in the production build
- 4c5fe903: Updated the Accordion styling.

  - Added `status` to the `Accordion` component.
  - Removed the hover styling from the `Accordion` component.
  - Moved the border from the bottom of the accordion to the top.
  - Added a fade animation to the accordion contents.
  - Updated the arrow rotation animation.

## 1.8.0-rc.5

### Minor Changes

- 6c86e078: Add Toast and ToastContent.

  Displays a small pop-up notification that’s usually short-lived and shown in response to a user action or system event unrelated to the user’s current focus.

  ```tsx
  <Toast>
    <ToastContent>Toast content</ToastContent>
    <Button variant="secondary">
      <CloseIcon />
    </Button>
  </Toast>
  ```

### Patch Changes

- 6099c82a: Removed "user-select:none" from Button
- 087496e3: Fixed placeholder styling in Input
  Fixed activation indicator width on readonly variant in Input when active
  Fixed spacing between multiple adornment buttons
  Fixed adornment button height and width
- b5e70f08: Fixed Checkbox Group crashing when a Checkbox was toggled in React 16
- 58a6de9a: The `pronounced` prop has been replaced with the `intent` prop.

  ```diff
  - <FormLabel pronounced />
  + <FormLabel intent="sentence" />
  ```

- abfc4364: Corrected the minimum supported version of React. It has been updated to 16.14.0 due to the support for the new [JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

## 1.8.0-rc.4

### Minor Changes

- 00f04b17: Add ToggleButton and ToggleButtonGroup.

  The Toggle Button Group allows users to make a mutually exclusive selection from a set of related commands—with only one option selected at a time.
  This Toggle Button allows users to enable or disable a single command.

  ```tsx
  <ToggleButtonGroup>
    <ToggleButton value="all">
      <AppSwitcherIcon aria-hidden />
      All
    </ToggleButton>
    <ToggleButton value="active">
      <VisibleIcon aria-hidden />
      Active
    </ToggleButton>
    <ToggleButton disabled value="search">
      <FolderClosedIcon aria-hidden />
      Archived
    </ToggleButton>
  </ToggleButtonGroup>
  ```

- 58cf03cf: Add AccordionGroup, AccordionPanel, Accordion, AccordionHeader.

  A pane containing summary content, which can then be expanded or collapsed to allow the user to show or hide content.

  ```tsx
  <AccordionGroup>
    <Accordion
      expanded={expanded === "accordion-0"}
      value="accordion-0"
      onToggle={onChange}
    >
      <AccordionHeader>AccordionHeader0</AccordionHeader>
      <AccordionPanel>AccordionPanel0</AccordionPanel>
    </Accordion>
    <Accordion
      expanded={expanded === "accordion-1"}
      value="accordion-1"
      onToggle={onChange}
    >
      <AccordionHeader>AccordionHeader1</AccordionHeader>
      <AccordionPanel>AccordionPanel1</AccordionPanel>
    </Accordion>
  </AccordionGroup>
  ```

### Patch Changes

- 89a3da4c: Fixed Checkbox and Radio Button border style incorrectly using `--salt-container-borderStyle`.

## 1.8.0-rc.3

### Minor Changes

- 0a1c9d9d: Refactored Checkbox to align styling.
  Add readOnly support to Checkbox.

  ```tsx
  <CheckboxGroup>
    <Checkbox readOnly label="readonly checkbox" />
    <Checkbox readOnly indeterminate label="readonly indeterminate checkbox" />
    <Checkbox readOnly checked label="readonly checked checkbox" />
  </CheckboxGroup>
  ```

- 21a76576: Refactored Radio Button to align styling.
  Added readOnly support to Radio Button.

  ```tsx
  <RadioButtonGroup readOnly>
    <RadioButton label="Readonly" value="Readonly" />
    <RadioButton label="Checked Readonly" value="Readonly-checked" checked />
  </RadioButtonGroup>
  ```

### Patch Changes

- 4329d8c7: Update Button and Toggle Button to have a fixed gap between icons and text.
- 0a1c9d9d: Fix inputProps overwriting internal Checkbox props
- 21a76576: Fixed inputProps overwriting internal Radio Button props
- 95188004: Alignment of StatusAdornment has been fixed

## 1.8.0-rc.2

### Major Changes

- 67199b0b: Removed `AdornmentButton`. Replace usages with the `Button` component.

  ```diff
  - <Input
  -   defaultValue="Value"
  -   startAdornment={<AdornmentButton>Test</AdornmentButton>}
  -   data-testid="test-id-3"
  - />
  + <Input
  +   defaultValue="Value"
  +   startAdornment={<Button>Test</Button>}
  +   data-testid="test-id-3"
  + />
  ```

  ```diff
  - <Input
  -   disabled
  -   defaultValue="Value"
  -   startAdornment={<AdornmentButton>Test</AdornmentButton>}
  -   data-testid="test-id-3"
  - />
  + <Input
  +   disabled
  +   defaultValue="Value"
  +   startAdornment={<Button disabled>Test</Button>}
  +   data-testid="test-id-3"
  + />
  ```

  **Note:** You will need to pass `disabled` to the `Button` component if the `Input` is disabled.

### Minor Changes

- 9668b500: Fixed invalid ARIA attribute console errors when using Input
- cdec98d2: Added `validationStatus` prop to RadioButton and Checkbox allowing for error and warning status
  Deprecated `error` prop in RadioButton and Checkbox: Use `validationStatus="error"` instead

  Added `validationStatus` prop to RadioButtonGroupContext and CheckboxGroupContext allowing for error and warning status on the group as a whole

- 598be79d: Added `necessity` prop to FormFieldLabel
- b3e511e9: Add support for Checkbox/RadioButton used alone (not in group context) within a Form Field with status

  Disables Checkbox/RadioButton focus ring when parent Form Field is disabled

  `AdornmentValidationStatus` type exposed for status adornments. Type of `validationStatus` changed in Checkbox and RadioButton to `AdornmentValidationStatus`.

- feda4061: **_Significant styling change_**

  Removed disabled error style variant from Checkbox. Error styling will now only show if component is not disabled.

- 3de30c35: Added stories to show Form Field Group as a pattern, with usage of Stack and Grid Layout components and shared props across Form Fields and controls

  Added "right" as an option to `FormFieldLabelPlacement` type used in FormField `labelPlacement` prop

- e851d2ba: Removed the `FormFieldControlWrapper` component and `useControlWrapper` hook.
  To replace usages of the wrapper for Form Fields with multiple children, use the `StackLayout` component with a `gap` of `1` to get the recommended layout and set the `role` to `"group"` or `as` to `"fieldset"` for accessibility. The `variant` on each child should be set directly or with shared props.
- 52c2e1ce: Fixed Form Field label incorrectly inheriting text alignment.
- 82b162d3: `Checkbox` and `RadioButton` updated to use FormFieldContext
  When wrapped within a FormField component, values from Form Field now have precedence in these controls over any directly applied disabled and error validation status
- 3425ea96: **_Significant styling change_**

  Removed disabled error style variant from Radio Button. Error styling will now only show if component is not disabled.

### Patch Changes

- 5b60aa72: Increased spacing between Checkbox/Radio Button and value, and spacing between each when horizontally grouped
- 7ca8c510: Design fix on Form Field

  - Left aligned label on wrapped text: Ensures label stays in line with Input text.
  - Success status adornment color corrected.
  - Spacing changes between adornments.

- 62bb0f8d: - Sort breakpoints in `useResponsiveProps` so it can handle unordered props.
  - Fix flickering bug on breakpoint change when values passed to `useResponsiveProps` are the same.

## 1.8.0-rc.1

### Minor Changes

- 287cb5fa: Form Field supports helper text within a nested Tooltip

  Tooltip uses FormFieldContext which has precedence over any disabled and status given to Tooltip when wrapped within a FormField component

- 2da87f0b: Added `placeholder` prop to Input: Placeholder can be used when no default value is given to promopt user input
- 49fa6ad5: Added `AdornmentButton` component as an interactive adornment to be used within Input
- 8d5a8c9f: Added `startAdornment` and `endAdornment` props to Input: Allows for custom adornments to be used within the Input component

### Patch Changes

- c4df0491: The default Card design has been changed to include a border to enhance visual accessibility.

## 1.8.0-rc.0

### Minor Changes

- 58c6699f: Input: `aria-describedby` is now merged between the value from Form Field context if present and the value from inputProps
- bf5a9441: Updated `RadioButtonGroup` to use renamed token from `FormFieldLegacy`
- 9d68637a: Moved form-field-next and form-field-context-next to core as form-field and form-field-context

  `FormField`: First version of Form Field built with a compositional API by providing the following components alongside:
  `FormFieldHelperText`: Helper text component
  `FormFieldLabel`: Form label component (compatible with left and top placement)
  `FormFieldControlWrapper`: Styling container for controls used within Form Field

  `FormFieldContext`, `useFormFieldProps`: Context and hook for inner controls to respond to disabled, readonly, and validation state on the parent Form Field

- eb3db91c: Removed `startAdornment` and `endAdornment` props from `InputNext`. Props will be added back once adornments come in v2

  Moved input-next to core as input

  `Input`: First version of `InputNext` renamed to Input

  - All tokens prefixed `--saltInputNext-` changed to prefix `--saltInput-`

  Moved status-adornment to core

  `StatusAdornment`: Component to be used for validation status indication

- d78ff537: Refactored all components to use new style injection mechanism provided by `@salt-ds/styles`

### Patch Changes

- 46af9f8c: Move Banner to core

## 1.7.1

### Patch Changes

- 1e9ef1a2: Fix duplicate Salt libraries being installed when multiple libraries are installed

## 1.7.0

### Minor Changes

- d7ed50d5: Remove text decoration of inner text in Card when wrapped in a link

### Patch Changes

- 9f3800d2: Update Tooltip props to account for the new content attribute introduced in @types/react@18.2.4
- 528aa923: Fix Checkbox having incorrect icon style when in the disabled state and hovered over
- 7f83323a: Fix mergeProps not respecting null values

## 1.6.0

### Minor Changes

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
- 47132c22: Added `FormFieldNext` component with associated `FormFieldLabel` and `FormFieldHelperText` components
  Added `FormFieldContextNext`, `useFormFieldPropsNext`
  Added `InputNext` component
- a6ede40d: Render Tooltip in a portal to avoid it being cut off

  Add mergeProps to utils.

  Upgraded @floating-ui//react to v0.23.0

### Patch Changes

- fe818c66: Fix Tooltip having incorrect text styles when being nested in elements with custom text styles.

## 1.5.0

### Minor Changes

- 9bee69f4: Move `Checkbox` from lab to core
- ea010ffa: New `--salt-size-container-spacing` and `--salt-size-adornmentGap` tokens

  ```diff
  +  --salt-size-container-spacing: calc(3 * var(--salt-size-unit));
  +  --salt-size-adornmentGap: calc(0.75 * var(--salt-size-unit));
  ```

- 4a51e4c6: Add Radio Button and Radio Button Group
- 9edfa980: Panel color css attribute changed from `inherit` to `initial`
- 85647494: Move capitalize util from lab to core
- f301f43c: Deprecated `interactable` and `disabled` props in Card
  Created `InteractableCard` component for Cards which can perform an action, e.g. linking to a different page or content

  To migrate from the previous to new implementation:

  ```diff
  -    import { Card } from "@salt-ds/core";
  -
  -    const MyInteractableCard = () => (
  -        <Card interactable />
  -    );

  -    const MyInteractableDisabledCard = () => (
  -        <Card interactable disabled />
  -    );

  +  import { InteractableCard } from "@salt-ds/core";
  +
  +   const MyInteractableCard = () => (
  +       <InteractableCard />
  +   );
  +
  +   const MyInteractableDisabledCard = () => (
  +       <InteractableCard disabled />
  +   );
  ```

- 8d54ce2a: Make hiding icons in external links easier

  ```tsx
  <Link IconComponent={null} href="#root" target="_blank">
    This has no icon
  </Link>
  ```

### Patch Changes

- 0c33a60c: Fix Avatar fallback not working
- 8d29c01f: - Fix Text components missing a font family.
  - Apply new font family variables from `@salt-ds/theme` to Text components

## 1.4.0

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

  - Deprecated the following tokens, use hex value as replacement if needed:

  ```diff
  - --salt-measured-foreground-undo: #2670a9
  - --salt-palette-measured-fill: #2670A9
  - --salt-palette-measured-fill-disabled: #2670A966
  - --salt-palette-measured-foreground-active: #2670A9
  - --salt-palette-measured-foreground-activeDisabled: #2670A966
  - --salt-palette-interact-foreground-partial: #155C93
  - --salt-palette-interact-foreground-partialDisabled: #155C93B3
  ```

- a483ca9b: Added new `basis` prop to FlexItem to control flex-basis

## 1.3.0

### Minor Changes

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

### Patch Changes

- 8b58e28b: Fix AriaAnnouncer not removing announced text from the DOM

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
