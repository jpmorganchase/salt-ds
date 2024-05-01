# @salt-ds/lab

## 1.0.0-alpha.42

### Minor Changes

- 059f6f7d: Submenu's now persist when the cursor moves from the menu to the body. This makes it easier to interact with submenus.
  Added `getVirtualElement` to Menu. To allow positioning Menu's relative to a custom reference area. This can be used to create a context menu.

  ```tsx
  <Menu
    getVirtualElement={() => ({
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }),
    })}
  >
    <MenuPanel>
      <MenuItem>Copy</MenuItem>
      <MenuItem>Move</MenuItem>
      <MenuItem>Delete</MenuItem>
    </MenuPanel>
  </Menu>
  ```

## 1.0.0-alpha.41

### Minor Changes

- 884ce037: Removed `ParentChildLayout` from labs and promote to core.

## 1.0.0-alpha.40

### Minor Changes

- ae971d21: Remove `Overlay`, `OverlayTrigger`, `OverlayPanel`, `OverlayPanelCloseButton`, and `OverlayPanelContent` from labs and promote to core.
- ed32f6e0: Refactor of `ParentChildLayout`:

  - removes parentPosition and disableAnimation props
  - collapsedViewElement renamed to visibleView
  - reduced motion animation changed to fade in

### Patch Changes

- 0fe48b4f: Added `type="button"` to button elements to prevent some components submitting forms.
- a1dace8d: CarouselSlide's ButtonBar prop is now less strict and accepts more components

## 1.0.0-alpha.39

### Minor Changes

- 96c2ca62: Removed `SegmentedButtonGroup` from labs and promoted to core.
- 8ed621bc: Removed the `onClose` prop from `Overlay`, `onOpenChange` is now called for events that open/close the overlay.

  ```tsx
  export const ControlledOverlay = () => {
    const [open, setOpen] = useState(false);
    const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

    return (
      <Overlay open={open} onOpenChange={onOpenChange}>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel>Overlay Content</OverlayPanel>
      </Overlay>
    );
  };
  ```

- ebe59171: Added `OverlayPanelCloseButton` and `OverlayPanelContent` components as children of `OverlayPanel`

  ```tsx
  export const OverlayWithCloseButton = ({ onOpenChange }: OverlayProps) => {
    const [open, setOpen] = useState(false);

    const onChange = (newOpen: boolean) => {
      setOpen(newOpen);
    };

    const handleClose = () => setOpen(false);

    return (
      <Overlay open={open} onOpenChange={onChange}>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel>
          <OverlayPanelCloseButton onClick={handleClose} />
          <OverlayPanelContent>Overlay Content</OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    );
  };
  ```

### Patch Changes

- f6202615: Visual updates to Calendar's "today" indicator and Tab's active indicator due to `--salt-size-indicator` being updated.

## 1.0.0-alpha.38

### Patch Changes

- 4adacc6b: Fix SegmentedButtonGroup's display name.
  Fix SegmentedButtonGroup's ref being applied incorrectly.

## 1.0.0-alpha.37

### Minor Changes

- 53a7f22c: Removed `DropdownNext`, `Option`, `OptionGroup` and `ComboBoxNext` from labs and promoted to core.
- 6cdfe94e: Add `SegmentedButtonGroup` to labs
  `SegmentedButtonGroup` should be used to display a list of actionable buttons, flush with separators

  ```tsx
  const SegmentedButtonGroup = () => (
    <SegmentedButtonGroup>
      <Button> Button </Button>
      <Button> Button </Button>
      <Button> Button </Button>
    </SegmentedButtonGroup>
  );
  ```

### Patch Changes

- 91074aa2: - Fixed tabs container height to fit its contents and display as block so it can take 100% width without an extra wrapper.

## 1.0.0-alpha.36

### Minor Changes

- 7d9436e0: Added pills to multi-select ComboBoxNext.
  Added `truncate` to ComboBoxNext which collapsing the ComboBoxNext to one line.

### Patch Changes

- 7d9436e0: Fixed DropdownNext and ComboBoxNext's list design.

## 1.0.0-alpha.35

### Minor Changes

- ff69de19: Remove `Dialog`, `DialogHeader`, `DialogContent`, `DialogActions`, and `DialogCloseButton` from labs and promote to core

### Patch Changes

- 517ce28b: Optional prop `id` is no longer passed down from `Overlay` to aria-labelledby in `OverlayPanel`
  aria-labelledBy should be passed down directly to the `OverlayPanel` via and id attached to the title element

  ```tsx
  export const Default = (): ReactElement => {
    const id = useId();
    return (
      <Overlay>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel aria-labelledby={id}>
          <h3 className={styles.contentHeading} id={id}>
            Title
          </h3>
          <div>
            Content of Overlay
            <Tooltip content={"im a tooltip"}>
              <Button>hover me</Button>
            </Tooltip>
          </div>
        </OverlayPanel>
      </Overlay>
    );
  };
  ```

- 0c4d186d: Fix tabstrip not collapsing when sharing parent with other items
- 54b8e1a9: Fixed Tab being deleted whilst editing Tab label and pressing backspace or delete

## 1.0.0-alpha.34

### Minor Changes

- f27ecfa7: Implemented corner radius for relevant components when used with theme next. Refer to [documentation](https://storybook.saltdesignsystem.com/?path=/docs/experimental-theme-next--docs) for more information.
- cba9f9b9: - Rename `DialogTitle` to `DialogHeader`
  - Change `DialogHeader` optional props `title` and `subtitle` to `header` and `preheader`
- 245301a9: Added `LinkCard` to lab.

  Use a Link card when the entire card should be clickable and navigate the user.

  ```tsx
  <LinkCard href="https://www.saltdesignsystem.com" target="_blank"></LinkCard>
  ```

- 8610999f: Remove `Drawer` and `DrawerCloseButton` from labs and promote to core
- cbe6c522: Removed `LinkCard` from lab and promoted to core.
- df15ac98: - Added `valueToString` to `DropdownNext` and `ComboBoxNext`. This replaces the `textValue` prop on `Option`s. This is needed when the value is different to the display value, or the value is not a string.
  - Removed `defaultValue` from `DropdownNext`.
  - Mousing over options will now set them to active.
  - Clearing the input will clear the list of active items.
  - `Option` will now use the value or the result from `valueToString` as its default children.

### Patch Changes

- 543c9ff2: Updates to calendar

  - Removed animations.
  - Visual updates to the component.
  - Updated the delay time for day tooltips.
  - Added `highlighted` days - characterized by a triangle in the top right corner that attributes an event to that day.
  - Added `disabled` days and made `unselectable` days focusable.

## 1.0.0-alpha.33

### Patch Changes

- 9d23fdce: Added `box-sizing: border-box` to:

  - `Dialog`
  - `DialogTitle`
  - `Drawer`
  - `FormLabel`
  - `InputLegacy`
  - `LayerLayout`
  - `List`
  - `Option`
  - `OptionList`
  - `TabNext`
  - `TabstripNext`
  - `TokenizedInputNext`
  - `TokenizedInput`

## 1.0.0-alpha.32

### Minor Changes

- 2771c6de: - Convert `Dialog Title` to accept props instead of a composable api

  - Optional Props `title` and `subtitle` added to `Dialog Title`
  - `Dialog Title` no longer accepts children
  - Optional `id` prop added to `Dialog` to announce the `title` and `subtitle` when using a screen reader

  ```tsx
  export const Default = (): ReactElement => {
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
        <Button onClick={handleRequestOpen}>
          Open default dialog
        </Button>
        <Dialog open={open} onOpenChange={onOpenChange} id={id}>
          <DialogTitle title="Terms and conditions" />
          <DialogContent>
            Dialog Content
            </StackLayout>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="cta" onClick={handleClose}>
              Accept
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
  ```

- fc915775: - Refactored `Drawer` to use floating-ui and Salt's `Scrim`.

  - Fixced open prop to be false by default
  - Fixed `Floating Components` implementation of focus manager props from Floating UI
  - Added optional `DrawerCloseButton`.
  - Added optional props `disableScrim` and `diableDismiss`

  ```tsx
  export const DrawerTemplate = (): ReactElement => {
    const [open, setOpen] = useState(false);

    const handleRequestOpen = () => {
      setOpen(true);
    };

    const onOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
    };

    const handleClose = () => {
      setOpen(false);
    };

    return (
      <>
        <Button onClick={handleRequestOpen}>Open Drawer</Button>
        <Drawer open={open} onOpenChange={onOpenChange} style={{ width: 300 }}>
          <DrawerCloseButton onClick={handleClose} />
          <H2>Title</H2>
          <Text>Content of drawer</Text>
        </Drawer>
      </>
    );
  };
  ```

- 4ab245a7: - Add `disableScrim` as an optional prop preventing the Scrim from being rendered. Use case is for Desktop Environments

### Patch Changes

- 2e36ad0b: `TabstripNext`, `TabNext` and `AppHeader` have bene updated to use separable tokens.
- d9eaf511: Fixed DropdownNext and ComboBoxNext not working in desktop environemnts.
  Fixed DropdownNext not showing a placeholder when it's value was an empty string.
  Fixed DropdownNext and ComboBoxNext's lists not showing over Dialogs.

## 1.0.0-alpha.31

### Minor Changes

- de68031a: - Added `min` and `hideLabel` to LinearProgress and CircularProgress.
  - Removed `unit` from LinearProgress.
- 0e031a5c: Removed `CircularProgress` and `LinearProgress` from lab and promoted to core.
- 9d0b2a40: - Refactored `Dialog` to use floating-ui and Salt's `Scrim`.

  - Implement FloatingComponent for Desktop support
  - Added optional `disableDismiss` prop to prevent a click away dismissing the dialog.
  - Added a `size` prop which takes `small`, `medium` and `large`.

  ```tsx
  const AlertDialog = () => {
    const [open, setOpen] = useState(openProp);

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
          Click to open dialog
        </Button>
        <Dialog
          size={"small"}
          role="alertdialog"
          status={"error"}
          open={open}
          onOpenChange={onOpenChange}
          initialFocus={1}
          disableDismiss
        >
          <DialogTitle>Delete Transaction</DialogTitle>
          <DialogContent>
            Are you sure you want to permanently delete this transaction
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="cta" onClick={handleClose}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
  ```

- 604a7314: Add support for complex value options to ComboBoxNext and DropdownNext.

### Patch Changes

- bef0d509: Undeprecated `--salt-track-borderColor`, which was incorrectly deprecated in feb80146.
- 56af744e: Parent Child Layout

  Removed `parent-child-item` component. Replaced by `FlexItem`
  Renamed `stackedAtBreakpoint` prop to `collapseAtBreakpoint`
  Renamed `stackedViewElement` prop to `collapsedViewElement`
  Removed `orientation` prop
  Added `parentPosition` and `onCollapseChange` props

## 1.0.0-alpha.30

### Patch Changes

- b2b8dedb: Add vertical orientation for SteppedTracker

## 1.0.0-alpha.29

### Minor Changes

- f8fec5ab: Update Overlay to use floating-ui. Supports placement on top (default), right, bottom, and left.

  ```tsx
  const OverlayTemplate = (props: OverlayProps) => {
    const { style, ...rest } = props;
    const id = "salt-overlay";

    return (
      <Overlay id={id} {...rest}>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel style={style}>
          <h3 id={`${id}-header`}>Title</h3>
          <div id={`${id}-content`}>Content of Overlay</div>
        </OverlayPanel>
      </Overlay>
    );
  };
  ```

- 8f0012b7: Removed `FileDropZone` from lab and promoted it to core.

## 1.0.0-alpha.28

### Minor Changes

- 69549229: Removed `Scrim` from Lab and moved it to Core.
- 907397e2: Removed NavigationItem from lab and promoted it to core
- b2dd61d7: Removed Pagination from lab

## 1.0.0-alpha.27

### Minor Changes

- ebe9feca: - Focus trap behavior is no longer managed by Scrim. Props related to this behavior such as `autoFocusRef`, `disableAutoFocus`, `disableFocusTrap`, `disableReturnFocus`, `fallbackFocusRef`, `returnFocusOptions` an `tabEnabledSelectors`, have been removed.
  - Removed `onBackDropClick` prop. Use `onClick` instead.
  - Removed `closeWithEscape` and `onClose` props. You can handle this outside of the scrim.
  - Removed `enableContainerMode` and `containerRef` props and added `fixed` prop. The default behavior is now for the scrim to fill its container, and you can use the `fixed` prop to fill the viewport.
  - Removed `zIndex` prop. You can change the `zIndex` using CSS.
  - Removed `ScrimContext`.
- 18576480: Refactor Combo Box Next and Dropdown Next to use compositional APIs.

  ## Dropdown Next

  ```tsx
  <DropdownNext>
    {colors.map((color) => (
      <Option value={color} key={color}>
        {color}
      </Option>
    ))}
  </DropdownNext>
  ```

  ## Combo Box Next

  ```tsx
  <ComboBoxNext>
    {colors.map((color) => (
      <Option value={color} key={color}>
        {color}
      </Option>
    ))}
  </ComboBoxNext>
  ```

- 91d22148: Removed `pillNext` from Lab and promoted it to Core.

### Patch Changes

- d9ce0737: Replaced incorrect usage of nullish operators.
- bbc4ccb1: Added TokenizedInputNext to lab.

  Tokenized input provides an input field for text that’s converted into a pill within the field, or tokenized, when the user enters a delimiting character.

  ```tsx
  <TokenizedInputNext />
  ```

- e668b2d6: Navigation Item

  - Updated the logic to make Navigation Item act like a button when `href` isn't passed.
  - Fixed styles.

## 1.0.0-alpha.26

### Minor Changes

- 641197da: - Removed `onClose` prop from `Pill`. Pill has been updated to support only one action. The `onClick`prop can be used instead.
  - Remove `icon` prop from `Pill`. An icon can be added as a children instead.

### Patch Changes

- 70fad5a1: Updated @floating-ui/react to 0.26.5.
- c49c246e: Removed redundant Icon color overrides.
- 61072b78: Changes to Pagination:

  - Removed `compact` prop from `Pagination` component. Replaced by new `CompactPaginator` composition component
  - Removed `showPreviousNext` and `FormFieldProps` from `Paginator` component.
  - Added `CompactPaginator` for the compact version of pagination.
  - Removed `FormFieldProps` from `GoToInput` component and added `inputRef` and `inputVariant`

## 1.0.0-alpha.25

### Minor Changes

- 1d292f2e: Refactored FileDropZone.

  - FileDropZone has been split into three composible pieces: FileDropZone, FileDropZoneIcon and FileDropZoneTrigger.
  - Validation is handled outside of the component. `onFilesAccepted`, `onFilesRejected` and `validate` have been replaced with `onDrop` and `status`.
  - Aligned styling to Salt.

### Patch Changes

- f7fcbd11: Fixed issue where components are not injecting their styles.

## 1.0.0-alpha.24

### Patch Changes

- d9794a06: Fix global css clashing issues by replacing un-prefixed classes .root and .rootDisabledAlpha in ColorPicker with prefixed (.saltColorChooserPicker-root and .saltColorChooserPicker-rootDisabledAlpha)
- 7e352933: Removed left and right padding from TabstripNext for the inline variant.

## 1.0.0-alpha.23

### Patch Changes

- 2fd8c03c: Pill's `className` prop is now forwarded to its wrapper instead of the nested button.

## 1.0.0-alpha.22

### Minor Changes

- 966c362f: Expose a CSS file that allows Salt to be used without runtime CSS injection.

```tsx
import "@salt-ds/lab/css/salt-lab.css";
```

- 01fa27ad: Removed Badge from Lab and promoted it to Core.
- feb80146: **_Theming and CSS updates_** with visual change to Salt components.

  1. `Drawer`, `Dialog`, and `Scrim` components overlay colour updated from black to white in light mode.

  2. `Badge` component line height in HD updated from 11px to 10px.

  **_Theming and CSS updates_** with no visual change to `Pill` component. `Pill` CSS tokens have been updated to match design specs.

### Patch Changes

- 7023034a: Fix Combobox input's `onChange` and `onKeyDown` not being invoked.
- 0ddc1e42: Removed default min width styling in `Pill`. Smaller Pills should look cleaner.
- 9dbe7f4c: Fixed component text properties (`font-weight`, `font-family`, `font-size`, `line-height`) incorrectly inheriting external global styles, which should follow the text characteristic from the Salt theme.

  - Content Status
  - Dialog
  - Form Field Legacy
  - List
  - List Next
  - Tab
  - Tab Next
  - Toolbar

## 1.0.0-alpha.21

### Patch Changes

- f3143bb9: Fixed Badge occupying space when it is anchored to a child component.
- c5aede9b: Fix Combo Box Next `onChange` using stale values
- 26cc1b2a: Aligned height of inline tab to design

## 1.0.0-alpha.20

### Minor Changes

- 363a00a4: Removed Switch from Lab and promoted it to Core.
- bbd411a7: Added support for closable pills. Pills can now contain a close button that when triggered will call a function passed to the `onClose` prop.

  ```
  const handleClose = () => {
    console.log("closed");
  };

  <Pill onClose={handleClose}>Closable Pill</Pill>
  ```

### Patch Changes

- c9ee2c5d: Fixed Dropdown losing focus when clicking on the scrollbar or when selecting options.
  Focusing the Combo Box will not open the list automatically. This complies with [WCAG SC 3.2.1](https://www.w3.org/WAI/WCAG21/Understanding/on-focus.html).
- 0b8bfac6: Fixed Switch's label being misaligned.
- dba77589: Fixed Combo Box Next not applying a ref to its `DefaultListItem`.

## 1.0.0-alpha.19

### Minor Changes

- 01f3a2b3: - Remove `showInfo` prop in both `LinearProgress` and `CircularProgress` components
  - Update Progress component dimensions, track and bar size, progress value font size
  - Align Progress CSS tokens with latest design tokens

### Patch Changes

- 7e143979: Tabs Next

  - Add `activeColor`, `isActive`, `activate` and `variant` props to TabNext
  - Add `activeColor`, `isActive`, `activate` and `variant` values to TabNext context
  - Update TabNext and TabstripNext styles to match specs
  - Add `activeColor`, `align`, `value`, `defaultValue` and `variant` props to TabstripNext

- 191f1ff9: - Amend Navigation Item class names
  - Tweak Navigation item styles to match new specs

## 1.0.0-alpha.18

### Patch Changes

- 49614c3a: - Fixed Swatch not injecting CSS.
  - Fixed Swatch not showing a border for gray and white swatches.
  - Fixed Contact Metadata Item's font color.
  - Fixed Metric Header subtitle's font color.
  - Fixed Pill's style issues caused by CSS specificity.
  - Fixed the margin of Stepper Input's decrement button.
  - Fixed the size of Tokenized Input's expand button.
- 9dd3160b: Removes small close icon in closeable Tab
- 4aa50dd1: Adjust spacing in `NavigationItem`

## 1.0.0-alpha.17

### Minor Changes

- da568ca4: Added `onSelect` to `Dropdown`
- 23abebe7: Changes to Combo Box

  - Fix controlled implementation.
  - Removed `InputProps`.
  - Added `onListChange` and controlled props `inputValue` `defaultInputValue`.
  - Exposed `onSelect` in `ComboBox`.
  - Added `inputValue` and `defaultInputValue` to `useComboBox`.

- 05275590: Changes to `ListNext`

  - Added `onSelect` to `ListNext` and `useList`
  - Fixed onChange implementation in `useList`

### Patch Changes

- 3602f2fa: Add SaltProvider to drawer
- 99fafaee: - Change `NavigationItem` flex alignment so it works well with longer labels
  - Rename `blurSelected` prop to `blurActive`
  - Update description on `blurSelected` prop
  - Move `ConditionalWrapper` into separate file
- f6a06c7c: Add SaltProvider to Dialog
- 5247b7bd: - Make combo box controlled prop inputValue optional
  - Add z-index to combobox list
  - Increase specificity for list css
- 402e13f7: Browser compatibility CSS changes.

  Added missing prefix to `appearance` and revert `padding-inline`, `padding-block` and `margin-block` to improve browser compatibility with Chrome 79

- e356a06d: - Add z-index to dropdown list
  - Increase specificity for list css

## 1.0.0-alpha.16

### Minor Changes

- 0a07e0cf: Added ComboBox component to labs

  Combo Box helps users select an item from a large list of options without scrolling. The typeahead functionality makes this selection quicker, easier, and reduces errors.
  Users can see a list of available options when they click on the component and filter the list as they type. Once they’ve made their selection, it populates the field and the overlay list closes.

  ```tsx
  const handleChange = (
    event: SyntheticEvent,
    data: {
      value: string;
    }
  ) => {
    console.log("input value changed", data);
  };

  const handleSelect = (event: SyntheticEvent<HTMLInputElement>) => {
    console.log("selected item", event.currentTarget.value);
  };
  return (
    <ComboBoxNext
      onChange={handleChange}
      onSelect={handleSelect}
      source={["Option 1", "Option 2", "Option 3"]}
    />
  );
  ```

- fb7f67f7: Combo box changes

  - changed `itemRenderer` for `ListItem`.
  - Added box shadow `--salt-overlayable-shadow-popout` to internal `List`.

- e067c4ab: DropdownNext

  - Added `DropdownNext` component

  ```tsx
  <DropdownNext source={source} defaultSelected={defaultSelected} {...props} />
  ```

- cbfc1b99: Change Dialog to use floating-ui, add useDialog hook.

  Alert dialog example:

  ```tsx
  <Dialog
    status="warning"
    role="alertdialog"
    open={open}
    onOpenChange={handleOpenChange}
  >
    <DialogTitle>Warning Alert Title</DialogTitle>
    <DialogContent>Alert description</DialogContent>
    <DialogActions>
      <Button>Cancel</Button>
      <Button variant="cta">Ok</Button>
    </DialogActions>
  </Dialog>
  ```

  Content dialog example:

  ```tsx
  <Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogTitle accent>Dialog Title</DialogTitle>
    <DialogContent>Dialog content...</DialogContent>
    <DialogActions>
      <Button
        style={{ marginRight: "auto" }}
        variant="secondary"
        onClick={handleClose}
      >
        Cancel
      </Button>
      <Button onClick={handleClose}>Previous</Button>
      <Button variant="cta" onClick={handleClose}>
        Next
      </Button>
    </DialogActions>
    <DialogCloseButton onClick={() => handleOpenChange(false)} />
  </Dialog>
  ```

### Patch Changes

- a58e83ae: - Rename `NavItem` to `NavigationItem`
  - Change component so it either renders a `Button` or a `Link` depending on whether it has children
  - Rename `ExpansionButton` to `ExpansionIcon` as this is no longer a button
  - Small styling tweaks
- 0930d64a: Fixed Logo Image sometimes being too large and made Logo work better when a separator is omitted.
- 92a5e3ef: Navigation Item

  - Remove `IconComponent` and `BadgeComponent` props (these can be passed as children)
  - Small styling tweaks

## 1.0.0-alpha.15

### Minor Changes

- b2ca1f11: Remove MultilineInput from labs and promote to core
- f353c3ac: Removed `ControlLabel`.
- 8c77cdb2: - Fixed tab in `ListNext` keyboard navigation
  - Exposed `setSelectedItem` and `setHighlightedItem` from useList.
- 894f7e07: Changes to Badge:

  - Renamed `BadgeContent` to `value`
  - Addition of inline styling when no child is passed to the component, enabling the badge to be used in other components e.g App Header
  - Truncation of numerical values > 3 characters or when max value is exceeded
  - Truncation of string values > 4 characters

  With Child:

  ```
  <Badge value={number} max={99}>
  <SettingsIcon/>
  <Badge/>
  ```

  No Child - Inline:

  ```
  <Badge value={string} />
  ```

### Patch Changes

- b0b58a0b: Increased the font-weight of Stepped Tracker labels
- fa6f54b3: Fixed Linear Progress's bar not animating to the beginning on reset
- f9291944: Removed truncation and tooltip behaviour from Stepped Tracker. After re-assessment it was judged that simply wrapping advising against long labels and wrapping text where necessary was preferable.
- 97719a52: Removed unit, renderInfo and disabled props from Circular Progress and Linear Progress.
- f353c3ac: Updated Switch's styling
  Refactored Switch and updated its change handler.

  ```diff
  - const Controlled: StoryFn<typeof Switch> = (args) => {
  -   const [checked, setChecked] = useState(false);
  -
  -   const handleChange = (
  -     _: ChangeEvent<HTMLInputElement>,
  -     isChecked: boolean
  -   ) => {
  -     setChecked(isChecked);
  -   };
  -
  -   return <Switch {...args} checked={checked} onChange={handleChange} />;
  - };
  + const Controlled: StoryFn<typeof Switch> = (args) => {
  +   const [checked, setChecked] = useState(false);
  +
  +   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  +     setChecked(event.target.checked);
  +   };
  +
  +   return <Switch {...args} checked={checked} onChange={handleChange} />;
  + };
  ```

- 52d7284e: Added controlled version of ListNext

  - Added `highlightedItem`, `selected` and `onChange` props to `ListNext` in order to support a controlled list.
  - Removed `selected`, from `ListNextItem` so state only gets controlled by list.
  - Exposed `selectedItem` and `highlightedItem` from useList.
  - Fixed `onChange` not being called on keyboard selection.
  - Fixed focus ring when focusing on disabled `ListNextItem`.

- 4f20e54c: Remove string truncation from Badge.
  Change default max to `999` for Badge.
- 678ec785: NavItem

  - Add nav item props for `blurSelected` state (when a nav item has active children), `IconComponent` and `BadgeComponent`
  - Update component styling to match designs
  - Remove `ChevronDownIcon` from horizontal expansion button as per designs

- bc24788c: Fix spacing imbalance in SteppedTracker
- 00feb5f9: Drawer

  - Replace `Scrim` with `FloatingFocusManager`
  - Remove `disableScrim`, `disableAnimations` and `scrimProps` props
  - Rename prop `isOpen` to `open` and add `onOpenChange` prop to allow component to be dismissed when clicking outside or pressing `Esc`

- 90e4604b: Add ToastGroup

  ```
  <ToastGroup>
    <Toast status="success">
      <ToastContent>
        <Text>
          <strong>Project file upload</strong>
        </Text>
        <div>Project file has successfully uploaded to the shared drive. </div>
      </ToastContent>
      <Button variant="secondary" onClick={closeToast}>
        <CloseIcon />
      </Button>
    </Toast>
    <Toast>
      <ToastContent>
        <Text>
          <strong>File update</strong>
        </Text>
        <div>A new version of this file is available with 37 updates. </div>
      </ToastContent>
      <Button variant="secondary" onClick={closeToast}>
        <CloseIcon />
      </Button>
    </Toast>
  </ToastGroup>
  ```

## 1.0.0-alpha.14

### Minor Changes

- 05c77e70: Add Pill

  ```tsx
  <Pill onClick={handleClick}>
      Pill
  </Pill>


  <Pill icon={<FavoriteIcon/>} onClick={handleClick}>
      Pill With Icon
  </Pill>
  ```

### Patch Changes

- 7857a11d: Added a story to show how character count can be implemented as an adornment.
- 2c6d86dd: Drawer

  - Added `Drawer` component

  ```
  const [open, setOpen] = useState(false);
  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  <>
   <Button onClick={show}>Open Drawer</Button>
   <Drawer isOpen={open}>
    <div>
     <p>Drawer content</p>
     <Button onClick={hide}>Close Drawer</Button>
    </div>
   </Drawer>
  </>
  ```

- a5bb0a41: Remove Toast and ToastContent from lab and promote to core.
- abfc4364: Corrected the minimum supported version of React. It has been updated to 16.14.0 due to the support for the new [JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
- b93d2e4a: Changes to `CircularProgress` and `LinearProgress`:

  - Removed size prop
  - Added max prop for custom max value
  - Removed variant props

  Changes to `StatusIndicator`:

  - Removed use of `size` prop from CircularProgress

- a3ac536a: MultilineInput design update: When there is only a status adornment present, adornment is at the end of the row, inline with the text area. When there is a status adornment along with end adornments, these will take up an entire row below the textarea.
- 722228c6: SteppedTracker

  - Added `SteppedTracker` component
  - Includes the `TrackerStep` and `StepLabel` subcomponents

  Usage:

  ```jsx
  <SteppedTracker activeStep={1}>
    <TrackerStep>
      <StepLabel state="completed">Step 1</StepLabel>
    <TrackerStep>
    <TrackerStep>
      <StepLabel>Step 2</StepLabel>
    <TrackerStep>
    <TrackerStep>
      <StepLabel>Step 3</StepLabel>
    <TrackerStep>
  </SteppedTracker>
  ```

- 6ff7c9a7: Fixed alignment styling of adornments in MultilineInput
  Fixed padding of Multiline when readonly with and without a full border
  Fixed height of textarea fixed to number of rows
  Fixed placeholder styling in MultilineInput
- ea867cd2: Rename `fullBorder` prop in MultilineInput to `bordered`

## 1.0.0-alpha.13

### Minor Changes

- 00f04b17: Remove ToggleButton and ToggleButtonGroup from lab and promote to core.
- 58cf03cf: Remove AccordionGroup, AccordionPanel, Accordion, AccordionHeader from lab and promote to core

### Patch Changes

- ff3eea5d: Add Toast component

  - Add ToastContent component

  ```js
  <Toast {...args}>
    <ToastContent>Toast content</ToastContent>
    <Button variant="secondary">
      <CloseIcon />
    </Button>
  </Toast>
  ```

## 1.0.0-alpha.12

### Minor Changes

- 95188004: Added `MultilineInput` component with fixed number of rows
- 27139c5c0: Realign Accordion to our design language

Before:

```tsx
<Accordion expandedSectionIds={expanded} onChange={handleChange}>
  <AccordionSection id="accordion-0" key="AccordionSection0">
    <AccordionSummary>AccordionSummary0</AccordionSummary>
    <AccordionDetails>AccordionDetails0</AccordionDetails>
  </AccordionSection>
  <AccordionSection id="accordion-1" key="AccordionSection1">
    <AccordionSummary>AccordionSummary1</AccordionSummary>
    <AccordionDetails>AccordionDetails1</AccordionDetails>
  </AccordionSection>
</Accordion>
```

After:

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

- 79e9f4bc: `MultilineInput` is now compatible with `FormField`. `FormFieldLabel` can be styled as a question by using the new `pronounced` prop.
- 4329d8c7: Update Button and Toggle Button to have a fixed gap between icons and text.
- 78ee0b81: Removed unnecessary transition in List Item Next

## 1.0.0-alpha.11

### Minor Changes

- de5ab33b: Added `onSelect` to Dropdown. `onSelect` is called when any selection occurs and differs from `onSelectionChange`, which is only called when the selection changes.
- c2f3e7d8: Add new tabs components: TabstripNext, TabNext

  ```tsx
  <TabstripNext defaultSelected="Home">
    <TabNext value="home">Home</TabNext>
    <TabNext value="transactions">Transactions</TabNext>
    <TabNext value="loans">Loans</TabNext>
  </TabstripNext>
  ```

- 8ff0a974: Refactor ToggleButton to use a new API to simplify its usage.

  ```diff
  - <ToggleButtonGroup onChange={handleChange} selectedIndex={selectedIndex}>
  -  <ToggleButton aria-label="alert" tooltipText="Alert">
  -    <NotificationIcon /> Alert
  -  </ToggleButton>
  -  <ToggleButton aria-label="home" tooltipText="Home">
  -    <HomeIcon /> Home
  -  </ToggleButton>
  -  <ToggleButton aria-label="search" tooltipText="Search">
  -    <SearchIcon /> Search
  -  </ToggleButton>
  -  <ToggleButton aria-label="print" tooltipText="Print">
  -    <PrintIcon /> Print
  -  </ToggleButton>
  -</ToggleButtonGroup>
  +<ToggleButtonGroup onSelectionChange={handleChange} selected={selected}>
  +  <ToggleButton value="alert">
  +    <NotificationIcon aria-hidden /> Alert
  +  </ToggleButton>
  +  <ToggleButton value="home">
  +    <HomeIcon aria-hidden /> Home
  +  </ToggleButton>
  +  <ToggleButton value="search">
  +    <SearchIcon aria-hidden /> Search
  +  </ToggleButton>
  +  <ToggleButton value="print">
  +    <PrintIcon aria-hidden /> Print
  +  </ToggleButton>
  +</ToggleButtonGroup>
  ``

  ```

- 71fc7474: Add new list components: ListNext, ListItemNext

  ```
  <ListNext>
    <ListItemNext value={Alaska}>
      {Alaska}
    </ListItemNext>
  </ListNext>

  ```

### Patch Changes

- de5ab33b: Dropdown will now close when the already selected item is selected.
- f699f26d: Logo

  - Added `LogoImage` and `LogoSeparator` components
  - Removed `LogoTitle` component
  - Removed `compact` prop
  - Logo follows composition API

- 1fefbe74: Fixed issue where the Dialog heading overlapped when wrapped

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

- 8bcc9d04: Deprecated tertiary editable tokens: If needed, use `#00000066` as a replacement for `--salt-editable-tertiary-background-readonly`, and use `transparent` as a replacement for all remaining tokens
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
