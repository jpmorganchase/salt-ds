# @salt-ds/data-grid

## 1.0.16

### Patch Changes

- Updated dependencies [2bdfbfb]
- Updated dependencies [78eaee3]
- Updated dependencies [20abfb6]
- Updated dependencies [c59472d]
- Updated dependencies [2bdfbfb]
- Updated dependencies [0073384]
- Updated dependencies [78eaee3]
- Updated dependencies [ef8f30a]
  - @salt-ds/lab@1.0.0-alpha.64
  - @salt-ds/core@1.43.0

## 1.0.15

### Patch Changes

- Updated dependencies [5639e94]
- Updated dependencies [4731908]
- Updated dependencies [9287b09]
- Updated dependencies [a1c89e2]
- Updated dependencies [e93ee6f]
  - @salt-ds/lab@1.0.0-alpha.63

## 1.0.14

### Patch Changes

- Updated dependencies [38da566]
- Updated dependencies [076dedd]
- Updated dependencies [32de853]
- Updated dependencies [aac1500]
- Updated dependencies [f459825]
- Updated dependencies [803d0c0]
- Updated dependencies [7a84d72]
- Updated dependencies [d078641]
- Updated dependencies [99f7506]
- Updated dependencies [b619a9d]
- Updated dependencies [e783dd5]
- Updated dependencies [c30b6a4]
  - @salt-ds/core@1.42.0
  - @salt-ds/lab@1.0.0-alpha.62

## 1.0.13

### Patch Changes

- Updated dependencies [90b85d4]
- Updated dependencies [98d3aac]
- Updated dependencies [90b85d4]
- Updated dependencies [fd86394]
- Updated dependencies [56a997c]
- Updated dependencies [9a75603]
- Updated dependencies [021e90d]
- Updated dependencies [7510f56]
- Updated dependencies [98d3aac]
- Updated dependencies [ea5fc00]
- Updated dependencies [ba0f436]
  - @salt-ds/core@1.41.0
  - @salt-ds/lab@1.0.0-alpha.61
  - @salt-ds/icons@1.13.2

## 1.0.12

### Patch Changes

- Updated dependencies [6a0db8d]
- Updated dependencies [45961dd]
- Updated dependencies [3b1c265]
- Updated dependencies [1436b36]
- Updated dependencies [39bd967]
- Updated dependencies [efb37a0]
  - @salt-ds/core@1.40.0
  - @salt-ds/lab@1.0.0-alpha.60

## 1.0.11

### Patch Changes

- Updated dependencies [e6c54b7]
- Updated dependencies [373717d]
- Updated dependencies [373717d]
- Updated dependencies [eed82f8]
- Updated dependencies [225a61b]
- Updated dependencies [df7760d]
- Updated dependencies [c5d61e2]
  - @salt-ds/lab@1.0.0-alpha.59
  - @salt-ds/core@1.39.0

## 1.0.10

### Patch Changes

- Updated dependencies [0302830]
- Updated dependencies [86d2a28]
- Updated dependencies [dedbade]
- Updated dependencies [0a5b68b]
- Updated dependencies [cd98ba5]
- Updated dependencies [bfea9b3]
- Updated dependencies [a9edf03]
- Updated dependencies [86d2a28]
  - @salt-ds/lab@1.0.0-alpha.58
  - @salt-ds/core@1.38.0
  - @salt-ds/icons@1.13.1

## 1.0.9

### Patch Changes

- Updated dependencies [f3ae565]
  - @salt-ds/lab@1.0.0-alpha.57

## 1.0.8

### Patch Changes

- Updated dependencies [5cf214c]
- Updated dependencies [bae6882]
- Updated dependencies [b272497]
- Updated dependencies [33c8da5]
- Updated dependencies [e7b0406]
  - @salt-ds/core@1.37.3
  - @salt-ds/lab@1.0.0-alpha.56

## 1.0.7

### Patch Changes

- Updated dependencies [ae6e5c9]
- Updated dependencies [b395246]
- Updated dependencies [3cf8d99]
- Updated dependencies [aced985]
- Updated dependencies [7432f62]
- Updated dependencies [0730eb0]
- Updated dependencies [91973ac]
- Updated dependencies [1a29b4e]
- Updated dependencies [6b1f109]
- Updated dependencies [26bf747]
- Updated dependencies [6a08b82]
- Updated dependencies [dc5b3b3]
  - @salt-ds/core@1.37.2
  - @salt-ds/lab@1.0.0-alpha.55
  - @salt-ds/icons@1.13.0

## 1.0.6

### Patch Changes

- bfe0f84: Cleaned up TypeScript types in multiple components.

## 1.0.5

### Patch Changes

- 4b35339: Exported `EditorContext` and `CellFrame` to create custom cell and cell editors

## 1.0.4-alpha.10

### Patch Changes

- 8ebd9138: Fixed deprecated `--salt-size-accent` references to `--salt-size-bar`. Fixed deprecated `--salt-size-unit` references to `--salt-spacing-100`.

## 1.0.4-alpha.9

### Patch Changes

- 51a1e9e7: Fixed text properties not set to use values from Salt theme

## 1.0.4-alpha.8

### Patch Changes

- f7fcbd11: Fixed issue where components are not injecting their styles.

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
