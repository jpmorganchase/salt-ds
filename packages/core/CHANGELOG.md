# @salt-ds/core

## 1.48.0

### Minor Changes

- f1dc9fc: Added `VerticalNavigation` and related components.

  `VerticalNavigation` has been introduced to replace the existing `NavigationItem` component for vertical navigation. The new component provides a more structured and flexible way to create vertical navigation. For now you can continue to use the `NavigationItem` component, but we recommend migrating to the new `VerticalNavigation` component as the `NavigationItem` component will be deprecated in a future release and removed in the future major release.

  ```tsx
  <VerticalNavigation aria-label="Basic sidebar" appearance="indicator">
    <VerticalNavigationItem active>
      <VerticalNavigationItemContent>
        <VerticalNavigationItemTrigger>
          <VerticalNavigationItemLabel>Item 1</VerticalNavigationItemLabel>
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  </VerticalNavigation>
  ```

- f1dc9fc: Added `Collapsible` and related components.

  `Collapsible` enables content to be either collapsed (hidden) or expanded (visible). It has two elements: a trigger and a panel whose visibility is controlled by the button.

  ```tsx
  <Collapsible>
    <CollapsibleTrigger>
      <Button>Click</Button>
    </CollapsibleTrigger>
    <CollapsiblePanel>
      <p>Content</p>
    </CollapsiblePanel>
  </Collapsible>
  ```

### Patch Changes

- 9560539: Fixed foreground color not being applied explicitly to Banner.

## 1.47.5

### Patch Changes

- 846d975: Fixed Pagination active border color.
- 8538730: Removed text selection background color override.
- 8261887: Fixed Tooltip showing when content is null.
- e6445dc: Fixed Stepper using incorrect font styles in steps.
- ff646e2: Fixed Dialog having an unnecessary scrollbar.
- 9a25824: Updated `DialogHeader`'s responsive behaviour to meet WCAG 2.1 Reflow success criterion.
- 64ef723: Updated read-only style for RadioButton and Checkbox to meet color contrast requirements.

## 1.47.4

### Patch Changes

- c58279f: Fixed `Step` description's color being incorrect.
- 239d20c: - Fixed MutilineInput's end adornments scrolling off-screen when a max-height is applied.
  - Fixed MultilineInput's start adornments appearing at the top of the field when its width is reduced.
- fe8da62: Fixed `StatusIndicator` crashing if given invalid `status` prop.

## 1.47.3

### Patch Changes

- 55e7bc5: Replaced deprecated success icons with their improved counterparts in Checkbox, Switch and Stepper. These icons should now look more visibily balanced.
- 3481308: Updated target="blank" Link's hidden accessibility text.
- 851e4cb: Updated Dialog to ensure content always spans the full width.

## 1.47.2

### Patch Changes

- cdce628: Fixed FormField having extra bottom padding when it's used without a label or helper text.
- 454686b: Removed invalid styling from ComboBox.
- f25a82b: Fixed Dialog's scroll indicator flickering at certain screen sizes.
- 6bc8e53: Fixed a bug in the ListBox component where clicking an option would temporarily select the first option before releasing the mouse button.

## 1.47.1

### Patch Changes

- 62975de: Fixed Tooltip not working with OverlayTrigger and MenuTrigger.
- b96166e: Fix option's in a Dropdown not being announced correctly by screenreaders.
- 73ccf6b: Updated Tooltip's max-width to from `230px` to `60ch`.
- 95dd874: - Fixed interacting with a loading button submitting forms.
  - Fixed interacting with a disabled and focusableWhenDisabled button submitting forms.
- c93c943: Fixed Dropdown's CSS referring to invalid variables.
- 104d776: Fixed inconsistent deletion when the pills inside a combobox are clicked before the combobox.
- 621253b: Refactored components and themes to use the new fixed tokens.

## 1.47.0

### Minor Changes

- b99afaa: - Updated Pagination styles to include a border on the selected state.
  - Updated Pagination to use default text styles instead of action text.
  - Fixed hover styles overriding selected styles on Pagination.

### Patch Changes

- edcd33d: Fixed clicking on `FormField` labels' not focusing/interacting with the associated form control.
- a3a0608: Fixed the alignment of the status indicator inside FormField's helper text.
- 0c140c0: Fixed `Checkbox`'s checked color styles applying when `Checkbox` is indeterminate.
- Updated dependencies [dd3e21d]
  - @salt-ds/icons@1.14.0

## 1.46.1

### Patch Changes

- f107d63: Fixed some internal import pointing to package name, preventing component loading in certain setup like module federation. Fixes
  #5118.

## 1.46.0

### Minor Changes

- ec1736e: Added `defaultSelected` prop to `ToggleButton` to control default selected state. Updated `ToggleButton` `appearance` JSDoc to be more clear around selected state.

### Patch Changes

- 8b4cbfb: Fixed Step component not working with Tooltip due to missing `forwardRef`.
- bbdf4a6: Removed `onPillRemove` callback from the ComboBox's type definitions. `onPillRemove` has never been supported nor is it intended to be supported. `onSelectionChange` can be used instead to detect the removed pill.

## 1.45.0

### Minor Changes

- c664e97: - Moved `SteppedTracker` component from labs to core, renamed as `Stepper`.

  - `Stepper` visually communicates a user’s progress through a linear process. It gives the user context about where they are, which steps have they completed, how many steps are left and if any errors or warnings have occurred.

  ```tsx
  import { Stepper, Step } from "@salt-ds/core";

  function Example() {
    return (
      <Stepper orientation="horizontal">
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" stage="pending" />
      </Stepper>
    );
  }
  ```

- 06232b0: Added `sentiment`, `appearance` and `readOnly` props to `ToggleButton` and `ToggleButtonGroup`.

  ```tsx
  <ToggleButton sentiment="positive" appearance="bordered">
    Home
  </ToggleButton>
  ```

  ```tsx
  <ToggleButtonGroup sentiment="accented" appearance="bordered">
    <ToggleButton> Home</ToggleButton>
  </ToggleButtonGroup>
  ```

  ```tsx
  <ToggleButtonGroup readOnly={true}>
    <ToggleButton> Home</ToggleButton>
  </ToggleButtonGroup>
  ```

  Added support for visually indicating the selected toggle button within a disabled toggle button group.

## 1.44.1

### Patch Changes

- 851b2eb: Fixed Dropdown and ComboBox throws error when moving focus via `keyDownCapture`, for example used as `cellRenderer` in Ag Grid. Closes #5011.

## 1.44.0

### Minor Changes

- 7fe2106: Promote updated `Slider` and `RangeSlider` components to core. The update includes:

  - Improved accessibility and focus behavior.
  - Enhanced API for slider customization, including options like `marks`, `showTicks`, and `showTooltip`.
  - Fixed touch interactions on mobile to allow dragging of the slider thumb without horizontal screen scrolling.
  - Set the default `max` value of the `Slider` and `RangeSlider` as 100 to be consistent with the HTML specification.

  ```tsx
  <Slider
    min={0}
    max={30}
    defaultValue={15}
    marks={[
      { value: 0, label: "Minimum" },
      { value: 30, label: "Maximum" },
    ]}
    showTicks={true}
  />
  ```

  ```tsx
  <RangeSlider
    min={0}
    max={30}
    defaultValue={15}
    marks={[
      { value: 0, label: "0" },
      { value: 10, label: "10" },
      { value: 15, label: "15" },
      { value: 19, label: "19" },
      { value: 30, label: "30" },
    ]}
    showTicks={true}
    minLabel="Very low"
    maxLabel="Very high"
    restrictToMarks={true}
  />
  ```

## 1.43.0

### Minor Changes

- 78eaee3: Promote updated `DialogHeader` component to core. `DialogHeader`'s update follows our standardized header for container components and app regions, and it can be added to provide a structured header for dialog. The header includes a title and actions that follows our Header Block pattern.

  - Fixed default `initialFocus` to close button (if used) as per accessibility guidance.
  - Updated bottom padding of DialogHeader from `--salt-spacing-300` to `--salt-spacing-100`
  - Updated close button position in `DialogHeader` to horizontally align with header icon using the new `actions` prop.
  - Updated overflow border to be above and below `DialogContent` instead of below `DialogHeader` to make scrolling area more evident.
  - Added `description` to `DialogHeader`. the description text is displayed just below the header.

  ```typescript
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogHeader
      header="Terms and conditions"
      actions={
        <Button
          aria-label="Close overlay"
          appearance="transparent"
          sentiment="neutral"
        >
          <CloseIcon aria-hidden />
        </Button>
      }
    />
    <DialogContent>
        Only Chase Cards that we determine are eligible can be added to the wallet.
    </DialogContent>
  </Dialog>;
  ```

  Prompted `OverlayHeader` component to core.

  - Fixed default `initialFocus` to close button (if used) as per accessibility guidance.
  - Updated close button position in `OverlayHeader` using the new `actions` prop.
  - Added `description` to `OverlayHeader`. the description text is displayed just below the header.

  ```tsx
  <Overlay {...args}>
    <OverlayTrigger>
      <Button>Show Overlay</Button>
    </OverlayTrigger>
    <OverlayPanel aria-labelledby={id}>
      <OverlayHeader
        id={id}
        header="Title"
        actions={
          <Button
            aria-label="Close overlay"
            appearance="transparent"
            sentiment="neutral"
          >
            <CloseIcon aria-hidden />
          </Button>
        }
      />
      <OverlayPanelContent>Content of Overlay</OverlayPanelContent>
    </OverlayPanel>
  </Overlay>
  ```

### Patch Changes

- 20abfb6: Fixed multiselect Option having nested interactive elements, impacted ComboBox, Dropdown and ListBox.

  Fixes #4737.

- c59472d: fix type error when `BorderLayout` has only one child or its conditionally rendered
- 2bdfbfb: Fixed ComboBox and Dropdown status adornment spacing, to align with rest of form controls.

  Closes #4794

- 0073384: Fixed invalid variant prop crashed Button
- ef8f30a: Fixed ComboBox having 2 popup lists due to browser's default `autoComplete` behaviour on `input`.
  You can still enable it via `inputProps={{autoComplete: "on"}}` if needed.

## 1.42.0

### Minor Changes

- 38da566: Added strong and small font weight support to `Text` when `styleAs="action"`.
  `<strong>` and `<small>` work in `Button` as well.
- aac1500: - Added `variant="ghost"` to Card with translucent background.
  - Added default shadow to all Card, Link Card and Interactable Card variants.
- 803d0c0: Added `underline` prop to `Link`. It controls when the underline text decoration is applied to a link.

  ```
  <Link underline="default">Underline default</Link>
  <Link underline="never">Underline never</Link>
  ```

- e783dd5: Added `lockScroll` prop to FloatingComponent that makes the page unscrollable when the floating component is open.

### Patch Changes

- 32de853: Refactored Pagination to simplify page button styling.
- 7a84d72: Fixed Accordion flashing blue when tapped on mobile devices.
- c30b6a4: Revert layout padding and margin defaults removal to avoid margins and paddings being inherited from parent containers.

## 1.41.0

### Minor Changes

- 90b85d4: Added accent colored Links.

  ```tsx
  <Link href="#" color="accent">
    Link text
  </Link>
  ```

- 9a75603: Added `color` prop to `Avatar`. Using `color` will change Avatar's background to one of the 20 categorical colors or accent.

  ```tsx
  <Avatar color="category-1" />
  ```

- 7510f56: Add `padding` and `margin` to `GridLayout`, `GridItem`, `BorderLayout` and `BorderItem`

  ```tsx
  <GridLayout padding={1} margin={1}>
    <GridItem padding={2} margin={2}>
      Item
    </GridItem>
  </GridLayout>
  ```

### Patch Changes

- 90b85d4: When Link is set to `color="inherit"` its hover, active and focus colors will now also be inherited.
  Fixed status colors being included in Link's `color` type. This was accidentally added when status color support was added to Text. If you need to achieve this behaviour you can use `color="inherit"`.
- fd86394: Fix layout paddings and margins beings set by default
- 56a997c: Fixed FormField incorrectly applying `align-self` when `labelPlacement` is `"left"` or `"right"`.
- 98d3aac: Improved screen-reader support for read-only combo boxes.
- ea5fc00: Improve screen reader support for Avatar.
- ba0f436: Added centered vertical alignment to MenuItem
- Updated dependencies [021e90d]
  - @salt-ds/icons@1.13.2

## 1.40.0

### Minor Changes

- 6a0db8d: Added `loading` prop/functionality to the Button component. This prop will display a spinner to indicate that the action is in progress. This is useful for actions that take some time to process, such as submitting a form or loading data.

  Added `loadingAnnouncement` prop/functionality to the Button component. This prop will announce a message to screen readers. Meant to be used in conjunction with the `loading` prop.

- 1436b36: Add `padding` and `margin` to `FlexLayout`, `FlexItem`, `FlowLayout`, `StackLayout` and `SplitLayout`

  ```tsx
  <FlexLayout padding={1} margin={1}>
    <FlexItem padding={2} margin={2}>
      Item
    </FlexItem>
  </FlexLayout>
  ```

- efb37a0: Add `inputRef` prop to `Checkbox` and `RadioButton`. The `inputRef` can be used to access the hidden `<input>` element.

### Patch Changes

- 3b1c265: Fixed standalone ToggleButton's corner radius not aligning to Button.
- 39bd967: Fixed secondary and tertiary InteractableCards having incorrect disabled styling.

## 1.39.0

### Minor Changes

- 373717d: Added `SkipLink`.

  ```tsx
  <body>
  <header>
    <SkipLink targetId="main">Skip to main content</SkipLink>
    <nav>
      {{...}}
    </nav>
  </header>
  <main>
    <h1 id="main">Main Content</h1>
  </main>
  </body>

  ```

- 225a61b: Added `render` prop to `Link`. The `render` prop enables the substitution of the default anchor tag with an alternate link, such as React Router, facilitating integration with routing libraries.

### Patch Changes

- c5d61e2: Fixed Toast icon alignment.

## 1.38.0

### Minor Changes

- 86d2a28: Added `LockedIcon` and `InProgressIcon` to the default icon map in SemanticIconProvider.

### Patch Changes

- dedbade: Fixed Salt Provider in floating ui adding extra attributes to root when mixing styling options.
- 0a5b68b: Marked CSS files as having side effects. This fixes Webpack tree-shaking CSS files when `sideEffects: true` is not set on style-loader rules.
- cd98ba5: Removed the validation status that was showing on the `Dropdown` when it is disabled. Closes #4548.
- bfea9b3: Updated `AccordionHeader`'s background color to `transparent` to align with Figma. Closes #4544.
- Updated dependencies [0a5b68b]
  - @salt-ds/icons@1.13.1

## 1.37.3

### Patch Changes

- 5cf214c: Fixed input alignment issue in form field when more than one item is in a row and some do not have helper text.
- bae6882: Fixed aria-activedescendant not being removed when Dropdown or ComboBox is closed.

## 1.37.2

### Patch Changes

- ae6e5c9: Updated ToggleButton's styling to align to Button's new styling.
- b395246: Fixed `color="secondary"` not working for the Link component.
- aced985: Replaced Button's deprecated `variant` prop with `sentiment` and `appearance` in:

  - ComboBox
  - DialogCloseButton
  - DrawerCloseButton
  - OverlayPanelCloseButton
  - CompactPaginator
  - Paginator
  - Pagination

- 7432f62: Fixed useResponsiveProp not being inclusive when calculating breakpoints e.g. not recognising `600px` as `sm`.
- 0730eb0: Fixed focus rings not appearing on Checkbox or Radio Button.
- 1a29b4e: Fixed disabled MenuItems triggering onClick.
- 6b1f109: Added padding between the content and scrollbar when `OverlayPanelContent` is scrollable.
- 26bf747: Fixed Tooltip to prioritize its `status` prop over the status inherited from a parent FormField.
- 6a08b82: Fixed circular dependencies in code.
- Updated dependencies [dc5b3b3]
  - @salt-ds/icons@1.13.0

## 1.37.1

### Patch Changes

- 62300f3: Fixed aria-multiselectable being incorrectly applied in the ComboBox and Dropdown.

## 1.37.0

### Minor Changes

- 4ccc245: Updated Card, LinkCard and InteractableCard accent bar color, which now stays the same across states.
- 97215f7: Added SemanticIconProvider to provide a mechanism to swap out built-in component icons to custom icons.

  ```tsx
  <SemanticIconProvider iconMap={iconMap}>
    <App />
  </SemanticIconProvider>
  ```

- 60a8d6a: Pill will now go into an active state when it's a menu trigger and has the menu is open. This aligns Pill with Button.

### Patch Changes

- dc9e1bd: Updated Pill's styling to align to Button's new styling.
- 7eac3b2: Fixed text contrast issues in Menu, Dropdown, ComboBox and ListBox.
- b2af86a: Updated MultilineInput so that it is easier to set a max-height.
- 9edf6c4: Added letter-spacing to `Text` for consistency.
- 65bfefb: Improved list based control's performance when lots of items are displayed.

## 1.36.0

### Minor Changes

- 1098fc1: Added `sentiment` (accented, neutral, positive, negative, caution) and `appearance` (solid, bordered, transparent) props for Button.

  _Note:_ Button's `variant` prop is now deprecated and will be removed in the next major version.

  | `variant`   | `appearance`  | `sentiment` |
  | ----------- | ------------- | ----------- |
  | `cta`       | `solid`       | `accented`  |
  | `primary`   | `solid`       | `neutral`   |
  | `secondary` | `transparent` | `neutral`   |

### Patch Changes

- 7a5215a: Fixed data-\* attributes not allowed on pass through props. Closes #3797.

  - `Checkbox.inputProps`
  - `Input.inputProps`
  - `MultilineInput.textAreaProps`
  - `PillInput.inputProps`
  - `RadioButton.inputProps`
  - `Switch.inputProps`

- dccd349: - Fixed bordered form controls' activation indicator and border combining to 3px instead of 2px in:

  - Dropdown
  - ComboBox
  - Input
  - MultilineInput
  - Fixed form controls' activation indicator changing color when an active field is hovered in:

    - Input
    - MultilineInput

  - Updated the token applied to form controls' activation indicator to use `--salt-size-border-strong` instead of `  --salt-editable-borderWidth-active`.

- 7ed6d4d: Fixed Tag's height being incorrect when box-sizing isn't set
- 3e49154: Updated Checkbox and Radio Button to have more robust styling.
- cee2b63: Fixed text inside Panel having the incorrect color when color-scheme is not set or doesn't change the default text color e.g. in Safari.
- f277c02: Updated controlled uncontrolled warning link
- 92299b6: Fixed the alignment of Checkbox and Radio Button when they don't have a label.
- 61e8502: Fixed Dialog's content being collapsed on Safari.

## 1.35.0

### Minor Changes

- b51bdb5: Added dot badge. A dot badge notifies users of changes in state e.g. new messages, notifications, or updates. Also the position of the badge will be at top right center of the Button/Icon.

  ```tsx
  <Badge>
    <Button aria-label="Notifications">
      <NotificationIcon aria-hidden />
    </Button>
  </Badge>
  ```

### Patch Changes

- 222c47a: Fixed the icon inside Navigation Item having the incorrect color when a parent item is also a link.
- 4a1bd04: Fixed the status adornment position in ComboBox where it would always be vertically centered when the field grows.
- 7acd0ed: Fixed multiselect combobox having incorrect pill styles in theme next.
- 16717fc: Fixed focusable when disabled button's having incorrect styling when in a disabled active state.
- c2972a1: - Fixed Checkbox and RadioButton shifting when selected outside of a flex layout.
  - Fixed Checkbox and RadioButton, sometimes having a gap between the border and the selected icon.
- 065d0ca: Fixed Dialog to have correct `z-index` variable assigned (1300).
- 3ff4448: - Fixed ComboBox calling onBlur when an option in the list is clicked.
  - Fixed Dropdown calling onBlur when an option in the list is clicked.
- 77dc32e: Fixed Accordion having status styling when disabled and status is set.
- 3045c38: - Fixed ComboBox breaking when `inputRef` is used.
  - Fixed ComboBox having an incorrect focus ring color when validation is applied.
  - Fixed ComboBox having incorrect active styling.

## 1.34.0

### Minor Changes

- 64be665: Update FormFieldHelperText to have status colors applied when `validationStatus` is applied to FormField.
- fc66238: Added `tertiary` variant to the `variant` prop for Card, LinkCard, InteractableCard and Panel.

  ```tsx
  <Card variant="tertiary">Example of a Tertiary Card</Card>
  <LinkCard variant="tertiary">Example of a Link Card</LinkCard>
  <InteractableCard variant="tertiary">Example of a Interactable Card</InteractableCard>
  <Panel variant="tertiary">Example of a Tertiary Panel</Panel>
  ```

### Patch Changes

- 4823df6: - Fixed the default NavigationItem being considered a parent.
  - Fixed NavigationItem not calling `onClick`.
- 1a0ca7f: Fixed read-only checked radio buttons having the incorrect icon color.
- 9837998: Fixed Pagination button having an incorrect color on hover when theme next is enabled.
- 3913dbb: Fixed list scroll when there is only one item in `ComboBox` and `Dropdown`.
- 5b735d9: Fixed ComboBox having a button when it has nothing to show.
- 31c3702: Fixed ListBox not scrolling to the active item in some circumstances
- 85997dc: Updated AccordionPanel to have less padding.
- e9c1287: Update gap to `--salt-spacing-75` for top aligned labels in `FormField`.
- 0eb21ae: Fixed `Accordion` becoming inaccessible when an id is passed to `AccordionPanel` or `AccordionHeader`.

## 1.33.0

### Minor Changes

- 533b590: - Updated `Listbox`, `Menu`, `ComboBox` and `Dropdown` to use `--salt-palette-corner` when their corners are rounded.
  - Updated `Menu`, `Dropdown` and `ComboBox` to have a 1px visual offset on floating panels.
- 34e8c9c: Added `render` prop to `NavigationItem`. The `render` prop enables the substitution of the default anchor tag with an alternate link, such as React Router, facilitating integration with routing libraries.

### Patch Changes

- bfe0f84: Cleaned up TypeScript types in multiple components.
- 0927a2d: Fixed the `initialFocus` prop not working on Dialog.
- b6070e7: Added JSDoc description to `SaltProviderNext` props.

## 1.32.0

### Minor Changes

- da92421: Added `getRefFromChildren`. This allows reading ref from a child component.
- 8b43adf: Updated `LinearProgress` to display a moving line to represent an unspecified wait time, when `value` is `undefined`.

  `<LinearProgress />`

  _Note_: `value` and `bufferValue` are no longer default to `0`. Previously above code would render a 0% progress bar, which was not a good reflection of intent. You can still achieve it by passing in `value={0}`.

- ce319ee: Added support for multiple themes to be passed to `SaltProvider`, e.g.,

  ```
  <SaltProvider theme="theme-1 theme-2">
  ```

- 9abf267: Marked `SaltProviderNext` being stable.

  If you're using existing type or variable with `UNSTABLE_` prefix, they are now deprecated but will still work.

### Patch Changes

- da92421: Fix warning logged when access a child ref on React 19.
- 7fa6e22: Fixed `Tooltip` not having correct height.

## 1.31.0

### Minor Changes

- 1d4d209: Added `bordered` prop to Dropdown. When set, a full border will be applied.

  ```tsx
  <Dropdown bordered />
  ```

  Dropdown is updated to be an inline element, aligning with other form controls like Input.

- ad6f7b4: - Added `indicatorSide` to `accordion` to allow right alignment.
  - Removed arrow animation in accordion.
  - Changed direction of accordion's arrow to be consistent with salt's expandable components.
    - Changed direction when `expanded=false` from right to down.
    - Changed direction when `expanded=true` from down to up.
- b199888: Added `bordered` prop for `ComboBox`. When set, a full border will be applied.

  ```tsx
  <ComboBox bordered>
    <Option value="Red" />
    <Option value="Blue" />
  </ComboBox>
  ```

  Added corner support for theme next.

### Patch Changes

- b199888: Updated `ComboBox` to show validation status when it's in a read-only state.
- 1d4d209: Updated outline color & background when in focus/active state for validation status `Dropdown` to match the color of the status.

  Updated border color when in hover state for validation status `Dropdown` to match the color of the status.

  Added corner support for theme next for `Dropdown`.

  Updates focus styling for `Dropdown`. Focus ring is shown on focus instead of focus-visible.

- 59da3f3: Fixed invalid HTML structure in AccordionHeader.
- 904ffa1: Fixed file drop zone not allowing the same file to be selected via `onChange` of `FileDropZoneTrigger`.
  Updated first argument event type of `onChange` to `ChangeEvent`, to better align with underlying event.

  Closes #3591.

- db527bc: Fixed Menu showing behind Drawer (#3636).

## 1.30.0

### Minor Changes

- e35a976: Added `Tag` component to core. Tags are non-interactive visual adornments that represent metadata or keywords associated with content, drawing the user's attention to categories without requiring interaction.

  ```typescript
    <Tag>Tag</Tag>
    <Tag bordered>Tag</Tag>
    <Tag variant="secondary">Tag</Tag>
    <Tag category={2}>Tag</Tag>
  ```

- f89189d: Added a new `actionFont` prop to `UNSTABLE_SaltProviderNext` with `"Open Sans"` or `"Amplitude"` option. To try it out, use

  ```
  <UNSTABLE_SaltProviderNext actionFont="Amplitude">
  ```

  Refer to [documentation](https://storybook.saltdesignsystem.com/?path=/docs/experimental-theme-next--docs) for more information.

- 0715454: Added `ListBox` component to core. `ListBox` allows the user to select an item from an array of options. Selected items are visually distinct from nonselected items. To ensure efficient space usage, long lists of items are in a scrolling pane that can provide access to options not immediately visible to the user.

  ```tsx
  <ListBox>
    <Option value="red" />
    <Option value="orange" />
    <Option value="yellow" />
    <Option value="green" />
    <Option value="blue" />
    <Option value="indigo" />
    <Option value="violet" />
  </ListBox>
  ```

- 6cde7ea: Added `Divider`.

  ```tsx
  <Divider />
  <Divider variant={variant} orientation={orientation} />
  ```

### Patch Changes

- 4697c25: Fixed content alignment of Option, OptionGroup, MenuItem and MenuGroup.
- 0486cbc: Added line-height, letter-spacing and font-family to Dropdown, MenuItem, Option and OptionGroup.
- f125982: Fixed Combo Box not picking `defaultValue` when `defaultSelected` is not set. Closes #3579.
- 55e7ced: Fixed combo box can be focused when disabled. Fixes #3369

## 1.29.0

### Minor Changes

- d0b6912: Added `Display4` text.

  ```
  <Display4>text</Display>
  <Text styleAs="display4">text</Text>
  ```

  It will be using different size when used in `SaltProvider` and `UNSTABLE_SaltProviderNext`.

- c36e8a4: Added `icon` prop to Toast to allow for a custom icon

  ```tsx
  <Toast icon={<InfoIcon />} status={"info"}>
    <ToastContent>
      <Text>
        <strong>Info with Custom Icon</strong>
      </Text>
      <div>Filters have been cleared</div>
    </ToastContent>
  </Toast>
  ```

- a0fff18: - Updated Input readonly state so that status adornment will be shown when `validationStatus` is set.

  - Added `bordered` prop for Input. When set, a full border will be applied.

  ```tsx
  <Input bordered />
  ```

  - Updated MultilineInput readonly state so that status adornment will be shown and background color to match status color when `validationStatus` is set.
  - Added rounded corner support for MultilineInput, when used in theme next.

### Patch Changes

- 72debf5: Fixed empty Switch label span being rendered. Closes #3505.
- 3b854ed: Fixed SegmentedButtonGroup incorrectly rounding when theme next is used and `corner="rounded"`.

## 1.28.1

### Patch Changes

- f8de151c: Fixed the chevron alignment for multi-line accordions.
- a5556028: Fixed Text components not applying `className` correctly, including `Code`, `Display1`, `Display2`, `Display3`, `TextAction`, `TextNotation`.

## 1.28.0

### Minor Changes

- 25e38e48: Added status color support to Text.

  ```tsx
      <Text color="info">This is error color of Text</Text>
      <Text color="error">This is error color of Text</Text>
      <Text color="warning">This is warning color of Text</Text>
      <Text color="success">This is success color of Text</Text>
  ```

  - Checkbox will now have the correct border color on focus when it is in an error or warning state.
  - Checkbox now uses `--salt-status-error-foreground-decorative` and `--salt-status-warning-foreground-decorative` instead of `--salt-status-error-foreground` and `--salt-status-warning-foreground`.
  - RadioButton will now have the correct border color on focus when it is in an error or warning state.
  - RadioButton now uses `--salt-status-error-foreground-decorative` and `--salt-status-warning-foreground-decorative` instead of `--salt-status-error-foreground` and `--salt-status-warning-foreground`.
  - StatusAdornment now uses `--salt-status-error-foreground-decorative`, `--salt-status-warning-foreground-decorative` and `--salt-status-success-foreground-decorative` instead of `--salt-status-error-foreground`, `--salt-status-warning-foreground` and `--salt-status-success-foreground`.
  - StatusIndicator now uses `--salt-status-info-foreground-decorative`, `--salt-status-error-foreground-decorative`, `--salt-status-warning-foreground-decorative` and `--salt-status-success-foreground-decorative` instead of `--salt-status-info-foreground`, `--salt-status-error-foreground`, `--salt-status-warning-foreground`, `--salt-status-success-foreground`.

- 5ef28178: Added a new `accent` prop to `UNSTABLE_SaltProviderNext` with `"blue"` or `"teal"` option. To try it out, use

  ```
  <UNSTABLE_SaltProviderNext accent="teal">
  ```

  Refer to [documentation](https://storybook.saltdesignsystem.com/?path=/docs/experimental-theme-next--docs) for more information.

- e1d4aab8: Added a new `headingFont` prop to `UNSTABLE_SaltProviderNext` with `"Open Sans"` or `"Amplitude"` option. To try it out, use

  ```
  <UNSTABLE_SaltProviderNext headingFont="Amplitude">
  ```

  Refer to [documentation](https://storybook.saltdesignsystem.com/?path=/docs/experimental-theme-next--docs) for more information.

### Patch Changes

- 33ffe0ef: Remove padding bottom and padding right from `DialogContent`
- 88711e3b: Fixed `onBlur` and `onFocus` not working with FormField.
- 1cfefb63: Added flex 1 to `DialogContent` so the dialog actions stick to the bottom
- d5b968fd: Fixed dialog border styling was not set correctly
- b266a075: Made `status` prop optional in Toast, allowing for Toast to have no status.
  The default for the `status` prop changed from `"info"` to `undefined`. Toasts intended to have "info" status must refactor as beflow.

  **Note:** This change is a bug fix but a breaking change for Toasts that were intended to have "info" status, but did not explicitly set the `status` prop.

  Before:

  ```tsx
  <Toast>
    <ToastContent>
      A new version of this file is available with 37 updates.
    </ToastContent>
  </Toast>
  ```

  After:

  ```tsx
  <Toast status="info">
    <ToastContent>
      A new version of this file is available with 37 updates.
    </ToastContent>
  </Toast>
  ```

## 1.27.1

### Patch Changes

- 067bc00f: Make `SegmentedButtonGroup` CSS selectors apply divider styles only to `.saltButton`, preventing dividers appearing when using floating-ui components like `Menu`.
- 5ff98b54: Fixed ComboBox logging event errors in React 16.
- 88961433: Changed RadioButton's display to `inline-flex` so the hit area only covers the label.
- d972d206: Fixed `Tooltip` not displaying when the `content` prop value is falsy e.g. 0
- 88961433: Changed Checkbox's display to `inline-flex` so the hit area only covers the label.

## 1.27.0

### Minor Changes

- 542b6228: Added `Menu`, `MenuItem`, `MenuTrigger`, `MenuPanel` and `MenuGroup`.

  ```tsx
  <Menu>
    <MenuTrigger>
      <Button variant="secondary" aria-label="Open Menu">
        <MicroMenuIcon aria-hidden />
      </Button>
    </MenuTrigger>
    <MenuPanel>
      <MenuItem>Copy</MenuItem>
      <MenuItem>Paste</MenuItem>
      <MenuItem>Export</MenuItem>
      <MenuItem>Settings</MenuItem>
    </MenuPanel>
  </Menu>
  ```

### Patch Changes

- 3f9febe3: Fix pills not being removed when they are not in the displayed list in a combo box.
- 04b5e51b: Fixed Tooltip not being fully disabled when `disabled=true`.

## 1.26.0

### Minor Changes

- d885e02d: Added `useBreakpoint` which returns on object containing matchedBreakpoints and `breakpoint`.

  - `matchedBreakpoints` - is an array of all matched breakpoints e.g. when the viewport matches the M breakpoint this array contains M, SM and XS.
  - `breakpoint` - is the current matched breakpoint.

- d885e02d: Added support for passing a string gap values to FlexLayout and GridLayout.

  ```tsx
  <FlexLayout gap="spacing-100" />
  <GridLayout gap="spacing-100" rowGap="spacing-100" columnGap="spacing-100" />
  ```

  Added support for passing a string column and row template to GridLayout.

  ```tsx
  <GridLayout columns="1fr 1fr 2fr" rows="1fr 2fr" />
  ```

### Patch Changes

- 51e164e3: Fixed Combo box and Dropdown options not growing in height with their content.
- f2f88a0d: Fixed Switch's alignment when it's used with a left/right aligned FormFieldLabel.
- 8ebd9138: Fixed deprecated `--salt-size-accent` references to `--salt-size-bar`. Fixed deprecated `--salt-size-unit` references to `--salt-spacing-100`.

## 1.25.0

### Minor Changes

- 884ce037: Promoted `ParentChildLayout` from labs to core.

  ```tsx
  const parent = <div>Parent</div>;

  const child = <di>Child</div>;

  export const Default = (): ReactElement => (
    <ParentChildLayout parent={parent} child={child} />
  );
  ```

### Patch Changes

- afe3d590: Updated Button to use active styles, when a menu or overlay is open.
- bb3b682f: Fixed ComboBox's nested button going into an active state when ComboBox is open.

## 1.24.0

### Minor Changes

- ae971d21: Add `Overlay`, `OverlayTrigger`, `OverlayPanel`, `OverlayPanelCloseButton`, and `OverlayPanelContent` to core.

  ```tsx
  export const DefaultOverlay = (): ReactElement => {
    return (
      <Overlay>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel>
          <OverlayPanelContent>Content of Overlay</OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    );
  };
  ```

### Patch Changes

- 6a9f8a9f: Fixed LinearProgress rendering unwanted 0 in DOM.
- 27536263: - Fixed uncontrolled `CheckboxGroup` throwing an uncontrolled to controlled error.
  - Fixed uncontrolled `RadioButtonGroup` throwing an uncontrolled to controlled error.
- 2b44227a: Updated `InteractableCard` to prevent hover effects from being applied while in a disabled state.
- 2bbdb790: Made `status` prop optional in Tooltip, allowing for Tooltip to have no status.
  The default for the `status` prop changed from `"info"` to `undefined`. Tooltips intended to have "info" status must refactor as below.

  **Note:** This change is a bug fix but a breaking change for Tooltips that were intended to have "info" status, but did not explicitly set the `status` prop.

  Before:

  ```tsx
  <Tooltip>Information</Tooltip>
  ```

  After:

  ```tsx
  <Tooltip status="info">Information</Tooltip>
  ```

- ca48936b: Fixed the gap between Tooltip's label and status icon not being affected by density.
- d3a7a753: Updated InteractableCard and LinkCard to support the new corner palette
- 0fe48b4f: Added `type="button"` to button elements to prevent some components submitting forms.

## 1.23.0

### Minor Changes

- ada5af31: Updates to `InteractableCard`:

  - Added `accent` prop for border positioning, deprecating `accentPlacement`.
  - Added `selected` prop for selected styling.
  - Added `value` prop for selectable use cases.

- ada5af31: Added `InteractableCardGroup` component to support selectable cards in a group. It allows users to select one or multiple values from a set of interactable cards.

  ```tsx
  <InteractableCardGroup multiSelect>
    <InteractableCard value="one">One</InteractableCard>
    <InteractableCard value="two">Two</InteractableCard>
    <InteractableCard value="three">Three</InteractableCard>
  </InteractableCardGroup>
  ```

- 96c2ca62: Added `SegmentedButtonGroup` to core.
  `SegmentedButtonGroup` shows a list of actionable buttons, flush with separators between them.

  ```tsx
  return (
    <SegmentedButtonGroup>
      <Button variant={variant}>Button</Button>
      <Button variant={variant}>Button</Button>
      <Button variant={variant}>Button</Button>
    </SegmentedButtonGroup>
  );
  ```

### Patch Changes

- 3e4e819c: `Card`, `LinkCard` and `InteractableCard` updated to only apply hover effects on non-touch devices.
- f6202615: Visual updates to Navigation item's active indicator due to `--salt-size-indicator` being updated.
- 8ffdfae1: Fixed Dialog children being unmounted twice unexpectedly when closing
- a726afcf: Improved the accessibility of Switch by applying `role="switch"`.

  **Note:** This might affect tests where you are targeting Switch by its role. For example, using React Testing Library-based selectors, tests will have to be updated like the following:

  ```diff
  - getByRole("checkbox")
  + getByRole("switch")
  ```

## 1.22.0

### Minor Changes

- 04743a73: `Text` has a new variant: `Code`. See [Text component](/salt/components/text) for more information.

  ```tsx
  <>
    <Code>Code text</Code>
    <Text as="code">Text styled as code</Text>
    <Text styleAs="code">Text styled as code</Text>
  </>
  ```

### Patch Changes

- 871585ac: Fixed `DialogHeader` not forwarding refs.
- 1b3e393a: Fixed Drawer children being unmounted twice unexpectedly when closing

## 1.21.0

### Minor Changes

- 53a7f22c: Added `Dropdown`, `Option`, `OptionGroup` and `ComboBox`.

  **Note:** These were `DropdownNext` and `ComboBoxNext` in lab.

  ```tsx
  <Dropdown aria-label="Colors">
    <OptionGroup label="Primary">
      <Option value="Red" />
      <Option value="Blue" />
    </OptionGroup>
    <OptionGroup label="Other">
      <Option value="Pink" />
    </OptionGroup>
  </Dropdown>
  ```

  ```tsx
  <ComboBox aria-label="Colors">
    <OptionGroup label="Primary">
      <Option value="Red" />
      <Option value="Blue" />
    </OptionGroup>
    <OptionGroup label="Other">
      <Option value="Pink" />
    </OptionGroup>
  </ComboBox>
  ```

- 9960fe8a: Added `bufferValue` to linear and circular progress.
  Updated linear and circular progress track token to use `--salt-size-bar` in order to improve density scale.

### Patch Changes

- d1e4f78a: Added export for DialogHeaderProps

  ```ts
  import { DialogHeaderProps } from "@salt-ds/core";
  ```

- 53a7f22c: Fix ComboBox and Dropdown's list appearing below other elements.

## 1.20.0

### Minor Changes

- ff69de19: Add `Dialog`, `DialogHeader`, `DialogContent`, `DialogActions`, and `DialogCloseButton` to core

  ```tsx
  export const Dialog = (): ReactElement => {
    const [open, setOpen] = useState(false);
    const id = useId();

    const handleRequestOpen = () => {
      setOpen(true);
    };

    const onOpenChange = (value: boolean) => {
      setOpen(value);
    };

    const handleClose = () => {
      setOpen(false);
    };

    return (
      <>
        <Button data-testid="dialog-button" onClick={handleRequestOpen}>
          Open default dialog
        </Button>
        <Dialog open={open} onOpenChange={onOpenChange} id={id}>
          <DialogHeader header="Terms and conditions" />
          <DialogContent>Dialog Content</DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="cta" onClick={handleClose}>
              Accept
            </Button>
          </DialogActions>
          <DialogCloseButton onClick={handleClose} />
        </Dialog>
      </>
    );
  };
  ```

### Patch Changes

- 6c414eae: Allowed Tooltip to flip to any axis when space is limited. Previously, it was limited to flipping horizontally.
- 2d3fb09e: Add `box-sizing: border-box` to:

  - Multiline input
  - Navigation item
  - Panel

## 1.19.0

### Minor Changes

- f27ecfa7: Added `UNSTABLE_SaltProviderNext` for early adopters to test incoming theme next features. Refer to [documentation](https://storybook.saltdesignsystem.com/?path=/docs/experimental-theme-next--docs) for more information.
  Implemented corner radius for relevant components when used with theme next.
- cbe6c522: Added `LinkCard` to core.

  Use a Link card when the entire card should be clickable and navigate the user.

  ```tsx
  <LinkCard href="https://www.saltdesignsystem.com" target="_blank" />
  ```

- 8610999f: Add `Drawer` and `DrawerCloseButton` to core
  Drawer is an expandable panel that displays content and controls over the application content. It provides temporary access to additional or related content without navigating away from the current screen.

  ```tsx
  export const Default = (): ReactElement => {
    const [openPrimary, setOpenPrimary] = useState(false);

    return (
      <>
        <Button onClick={() => setOpenPrimary(true)}>
          Open Primary Drawer
        </Button>
        <Drawer
          open={openPrimary}
          onOpenChange={(newOpen) => setOpenPrimary(newOpen)}
          style={{ width: 200 }}
        >
          Drawer Content
          <DrawerCloseButton onClick={() => setOpenPrimary(false)} />
        </Drawer>
      </>
    );
  };
  ```

### Patch Changes

- 76351938: Fixed the external icon shown in Links with `target="_blank"` sometimes being misaligned.

## 1.18.1

### Patch Changes

- 9d23fdce: Added `box-sizing: border-box` to:

  - `Badge`
  - `Card`
  - `Checkbox`
  - `FileDropZone`
  - `FlexLayout`
  - `Input`
  - `CircularProgress`
  - `LinearProgress`
  - `RadioButton`
  - `Switch`

## 1.18.0

### Minor Changes

- fb4a0ce7: Updates default padding for Card to `--salt-spacing-200`.

  Added `accent` and `hoverable` props to Card.

  `accent` prop enables positioning of an optional accent.
  `hoverable` prop enables hover styling.

  ```tsx
  <Card accent="top" hoverable>
    {children}
  </Card>
  ```

### Patch Changes

- 55749302: Fixed multiline input not collapsing when the input value resets.
- 511a921e: Fix false positive error when a Salt Provider tries to stop multiple providers being root providers in different windows
- 92d5ebac: Removed auto scrolIntoView from Toast which caused issues for some users.

  If this is a feature you need, pass a ref to Toast like below

  ```
    const toastRef = useRef<HTMLDivElement>();

    useLayoutEffect(() => {
      toastRef.current?.scrollIntoView();
    }, []);

    return (
      <Toast ref={toastRef}>
      // ...
    )
  ```

- b769f3e9: Added CSS API variable `--saltFormField-label-width`, replacing deprecated `--formField-label-width`

  Usage should be changed:

  ```diff
  - style={{ "--formField-label-width": "100px" } as CSSProperties}
  + style={{ "--saltFormField-label-width": "100px" } as CSSProperties}
  ```

## 1.17.0

### Minor Changes

- 0e031a5c: A progress indicator gives the user an understanding of how long a system
  operation will take. You should use it when the operation will take more
  than a second to complete. Two components are available to accommodate
  different layout constraints: `CircularProgress` and `LinearProgress`.

  ```tsx
      <LinearProgress aria-label="Download" value={50}/>
      <CircularProgress aria-label="Download" value={50} />
  ```

- f266b3c5: Added resizing support to `MutilineInput`. `MultilineInput`s will now resize when typing and can be resized manually.

## 1.16.1

### Patch Changes

- 181afaf3: - Updated indeterminate `Checkbox` and `RadioButton` to use the native indeterminate attribute. This ensures screen readers correctly announce the control.
  - Fixed `Checkbox` as `RadioButtonGroup` not being announced as read-only by setting `aria-readonly`.
  - Updated external `Link`'s accessible text to remove the redundant text ("Link").
  - Fixed `Switch`'s thumb being announced when the switch receives focus.
  - Changed standalone `ToggleButton`'s role from checkbox to button and updated the necessary aria attributes.
  - Fixed `Tooltip` being announced as clickable and focusable.

## 1.16.0

### Minor Changes

- 8f0012b7: Added `FileDropZone`, `FileDropZoneIcon` and `FileDropZoneTrigger` to core.

  `FileDropZone` provides a target area for users to drag and drop files, such as documents or images, and automatically uploads them to the web application.

  ```tsx
  <FileDropZone>
    <FileDropZoneIcon />
    <strong>Drop files here or</strong>
    <FileDropZoneTrigger />
  </FileDropZone>
  ```

### Patch Changes

- 455c31dd: Fixed disabled Accordions not showing a disabled cursor.
- 10ea2ca2: Fixed Card and Panel setting text properties by mistake, impacting content within inheriting wrong values.
- cfeeb51d: Fixed Tooltips showing without any content.

## 1.15.0

### Minor Changes

- b2dd61d7: Added Pagination

  Pagination helps users navigate easily between content separated into multiple pages.

  ```tsx
  <Pagination count={5}>
    <Paginator />
  </Pagination>
  ```

- 69549229: Added `Scrim`.

  `Scrim` is a temporary, semi-transparent layer that makes underlying content less prominent.

  ```tsx
  <Scrim open={open} />
  ```

- 907397e2: Added NavigationItem

  NavigationItem allows users to navigate between distinct applications and website pages.

  ```tsx
  <NavigationItem href="#">Label</NavigationItem>
  ```

- 340ff478: Updated `useToggleButtonGroup` to return the orientation of the group.

## 1.14.0

### Minor Changes

- 91d22148: Added `Pill` to Core

  `PillNext` is a small visual element that can contain descriptive text and an icon. You can use pills to label, tag or categorize content. With pills, users can trigger actions, make selections or filter results.

  ```tsx
  <Pill onClick={handleClick}>Clickable Pill</Pill>
  ```

### Patch Changes

- 5f449172: Fixed incorrect aria attributes on `RadioButtonGroup` and `CheckboxGroup`, which caused Screen Readers to incorrectly report the group's label as the radio button or checkbox's accessible name.
- d9ce0737: Replaced incorrect usage of nullish operators.
- 32dbea7e: Update `ToggleButton` props to use `ComponentPropsWithoutRef`.
- 48f6c20c: Fixed Tooltip not honoring `disabled` prop when used in Form Field

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
