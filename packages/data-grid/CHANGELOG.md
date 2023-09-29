# @salt-ds/data-grid

## 1.0.4-alpha.7

### Patch Changes

- 3a22eefe: Fixed the Data Grid crashing when a user scrolls to the bottom and uses the pagination to navigate to the last page. #2065

## 1.0.4-alpha.6

### Patch Changes

- 6a95567c: Fixed overscroll behaviour when reaching end of scroll and hovering over the grid

## 1.0.4-alpha.5

### Patch Changes

- abfc4364: Corrected the minimum supported version of React. It has been updated to 16.14.0 due to the support for the new [JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

## 1.0.4-alpha.4

### Minor Changes

- b636a99c: Condition dropdown in data-grid to only render if the array of options is not empty

### Patch Changes

- de5ab33b: Dropdown will now close when the already selected item is selected.
- f3ebfa48: When using the DropdownCellEditor with the Data Grid, hovering a grid row then hovering over a Dropdown list no longer crashes the Data Grid.

## 1.0.4-alpha.3

### Minor Changes

- af22b756: DropdownCellEditor accepts reandonly array

## 1.0.4-alpha.2

### Patch Changes

- 1e9ef1a2: Fix duplicate Salt libraries being installed when multiple libraries are installed

## 1.0.4-alpha.1

### Minor Changes

- c4c9d4f3: Add column sorting to the Data Grid

  ```tsx
  <GridColumn
    sortable
    onSortOrderChange={({ sortOrder }) => {}}
    customSort={({ rowData, sortOrder }) => {}}
  />
  ```

- 3be48882: Add cell validation.

  ```tsx
  <GridColumn
    getValidationStatus={({ row }) => validationStatus[row.index].name}
    validationType="strong"
  >
  ```

  Add row validation.

  ```tsx
  <Grid getRowValidationStatus={(row) => row.data.status}>
    <RowValidationStatusColumn
      id="status"
      aria-label="Row status"
      defaultWidth={30}
    />
  </Grid>
  ```

## 1.0.4-alpha.0

### Minor Changes

- 9bee69f4: Move `Checkbox` from lab to core

### Patch Changes

- 102501cb: Fix a bug where the Data Grid cell editor value is dismissed when the user clicks away
- 3c740de4: Fix a bug where the Data Grid cell editor value is dismissed when the user clicks away
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

## 1.0.3

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

## 1.0.2

### Patch Changes

- 1ad02da3: Deprecated `--salt-overlayable-shadow-scroll-color`, use `--salt-shadow-1-color` instead

## 1.0.1

### Patch Changes

- a0724642: Fix SSR support
- 03a5d0e1: Made Grid dimension measurements more reliable
- 00b53661: Fixed row selection not being announced by screenreaders

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
