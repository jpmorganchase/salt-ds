# @salt-ds/ag-grid-theme

## 2.4.3

### Patch Changes

- 621253b: Refactored components and themes to use the new fixed tokens.
- Updated dependencies [621253b]
- Updated dependencies [621253b]
- Updated dependencies [621253b]
- Updated dependencies [2d58071]
- Updated dependencies [7adcf27]
  - @salt-ds/theme@1.30.0

## 2.4.2

### Patch Changes

- be1b086: - Fixed [zebra variant](https://www.saltdesignsystem.com/salt/components/ag-grid-theme/examples#variants) row selection border color.
  - Fixed row selection border hover color, if `ag-grid.css` is loaded after `salt-ag-theme.css`.
  - Updated code for [HD compact example](https://www.saltdesignsystem.com/salt/components/ag-grid-theme/examples#hd-compact), which caused some styling not correctly applied (#5056).

## 2.4.1

### Patch Changes

- Updated dependencies [4fc024c]
  - @salt-ds/theme@1.29.0

## 2.4.0

### Minor Changes

- 949ffef: Improve overall CSS performance, specially around speed around context menu interaction.

  - Replaced most `div[class*="ag-theme-salt"` wildcard attribute selector to spelled out class selector `"ag-theme-salt-light", "ag-theme-salt-dark", "ag-theme-salt-compact-light", "ag-theme-salt-compact-dark"`
  - Improved selectors around cell focus ring and input placeholder within filter and column select menu.

## 2.3.5

### Patch Changes

- Updated dependencies [faa0334]
- Updated dependencies [aed941a]
  - @salt-ds/theme@1.28.1

## 2.3.4

### Patch Changes

- Updated dependencies [ea8b4e3]
  - @salt-ds/theme@1.28.0

## 2.3.3

### Patch Changes

- Updated dependencies [afd7ae1]
- Updated dependencies [d078641]
- Updated dependencies [aac1500]
- Updated dependencies [09f5144]
- Updated dependencies [803d0c0]
- Updated dependencies [09f5144]
- Updated dependencies [38da566]
  - @salt-ds/theme@1.27.0

## 2.3.2

### Patch Changes

- Updated dependencies [90b85d4]
- Updated dependencies [8ca3b2f]
- Updated dependencies [8ca3b2f]
- Updated dependencies [3764d72]
- Updated dependencies [d22534b]
- Updated dependencies [90b85d4]
- Updated dependencies [8ca3b2f]
  - @salt-ds/theme@1.26.0

## 2.3.1

### Patch Changes

- Updated dependencies [3e474a0]
- Updated dependencies [926316f]
- Updated dependencies [926316f]
- Updated dependencies [926316f]
- Updated dependencies [926316f]
- Updated dependencies [1203a3f]
- Updated dependencies [3e474a0]
- Updated dependencies [926316f]
  - @salt-ds/theme@1.25.0

## 2.3.0

### Minor Changes

- 2719afb: - Added theme support for several built-in ag grid provided editors

  - `agLargeTextCellEditor`
  - `agSelectCellEditor`
  - `agRichSelectCellEditor`
  - `agNumberCellEditor`
  - `agDateStringCellEditor`
  - Fixed `input` padding within `.editable-cell` during editing
  - Fixed long text overflow within `.editable-cell` when focused

  Closes #4144

### Patch Changes

- 0a5b68b: Marked CSS files as having side effects. This fixes Webpack tree-shaking CSS files when `sideEffects: true` is not set on style-loader rules.
- Updated dependencies [a2fc9cf]
- Updated dependencies [0a5b68b]
- Updated dependencies [06ad53b]
- Updated dependencies [06ad53b]
  - @salt-ds/theme@1.24.0

## 2.2.0

### Minor Changes

- b4a7888: Extended support to ag grid v32

  - Added support for new active button in floating filter, with adjusted floating filter focus style. Updated `--ag-icon-font-code-filter` to use outline version of filter icon to accommodate active state using filled version.
  - Fixed apply / reset panel buttons due to attribute change
  - Added "ag-grid-community" as `peerDependencies` to enforce minimum v28 support

### Patch Changes

- Updated dependencies [131dd9a]
- Updated dependencies [f6848dd]
- Updated dependencies [5af2978]
  - @salt-ds/theme@1.23.3

## 2.1.2

### Patch Changes

- c486b75: Refactor ag grid theme CSS into smaller files
- Updated dependencies [2f027e9]
  - @salt-ds/theme@1.23.2

## 2.1.1

### Patch Changes

- 4f3bec9: Fixed `.editable-cell` incorrectly setting text-align. For numeric columns, use both `.edtiable-cell` and `.numeric-cell` for `cellClass`. Fixes #4141.
- Updated dependencies [4ccc245]
  - @salt-ds/theme@1.23.0

## 2.1.0

### Minor Changes

- 285a257: Added support for [range selection](https://www.ag-grid.com/react-data-grid/global-style-customisation-selections/#range-selections) highlight color, mapped to `--salt-overlayable-background-highlight`. Closes #3922.

### Patch Changes

- Updated dependencies [1098fc1]
- Updated dependencies [2263a98]
- Updated dependencies [285a257]
  - @salt-ds/theme@1.22.0

## 2.0.2

### Patch Changes

- ab0215d: Fixed header text and icon color when column menu is open

## 2.0.1

### Patch Changes

- d92fe9e: - Fixed background color for custom editor component.

  - Fixed header text being cropped in HD compact. Closes #3675.
  - Fixed Country Symbol taller than expected in HD compact. This alters `--salt-size-base` token so Salt Button, form controls (Input, Dropdown, Combo Box) will be impacted as well. Closes #3775.
  - Fixed group value not center aligned vertically.
  - Updated ag grid menu styling to match closer to Salt Menu component.
  - Updated floating filter column chooser item styles. Closes #3671.

  Note: We previously made a mistake on `rowHeight` recommendation when configurating AG Grid, which should be 1px more to account for border between row.
  `useAgGridHelpers` example hook is updated to reflect this.

  | Density      | Row height ([`rowHeight`](https://www.ag-grid.com/javascript-data-grid/row-height/)) | Header height ([`headerHeight`](https://www.ag-grid.com/javascript-data-grid/column-headers/#header-height)) |
  | ------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
  | HD (Compact) | 21                                                                                   | 20                                                                                                           |
  | HD           | 25                                                                                   | 24                                                                                                           |
  | MD           | 37                                                                                   | 36                                                                                                           |
  | LD           | 49                                                                                   | 48                                                                                                           |
  | TD           | 61                                                                                   | 60                                                                                                           |

## 2.0.0

### Major Changes

- 5ed8ed88: Ag grid theme is updated to support ag grid version v31, and it's now driven by [AG grid variables](https://ag-grid.com/react-data-grid/global-style-customisation/) with a big reduction in bundle size. Follow below for upgrade instructions:

  1. Update stylesheet import

  ```diff
  - import "ag-grid-community/dist/styles/ag-grid.css";
  + import "ag-grid-community/styles/ag-grid.css";
  ```

  UITK theme is removed, migrate to Salt theme

  ```diff
  - import "@salt-ds/ag-grid-theme/uitk-ag-theme.css";
  + import "@salt-ds/ag-grid-theme/salt-ag-theme.css";
  ```

  2. Update classnames used on the container around `AgGridReact`, which no longer has density portion. If you previously copied `useAgGridHelpers`, you'll need to copy a new version from [here](https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts).

  In light mode:

  ```diff
  - .ag-theme-salt-high-light
  - .ag-theme-salt-medium-light
  - .ag-theme-salt-low-light
  - .ag-theme-salt-touch-light
  + .ag-theme-salt-light
  ```

  ```diff
  - .ag-theme-salt-high-compact-light
  + .ag-theme-salt-compact-light
  ```

  In dark mode:

  ```diff
  - .ag-theme-salt-high-dark
  - .ag-theme-salt-medium-dark
  - .ag-theme-salt-low-dark
  - .ag-theme-salt-touch-dark
  + .ag-theme-salt-dark
  ```

  ```diff
  - .ag-theme-salt-high-compact-dark
  + .ag-theme-salt-compact-dark
  ```

  Closes #2972

### Patch Changes

- Updated dependencies [25e38e48]
- Updated dependencies [eaab9d89]
- Updated dependencies [5ed8ed88]
- Updated dependencies [e1d4aab8]
  - @salt-ds/theme@1.16.0

## 1.4.2

### Patch Changes

- 98d1a03f: Fixed icon not displayed correctly when salt theme class is not applied first on a container (fixes #3351)
- 318515c5: Fixed header background incorrectly referencing palette color (`--salt-container-primary-background`) instead of characterstics (`--salt-container-primary-background`)

## 1.4.1

### Patch Changes

- 0ca29531: Fixed single cell focus ring not visible in range selection mode (Fixed #3290)

## 1.4.0

### Minor Changes

- e53138c2: Updated column header active state to actionable secondary style, to better associate relevant column header with the open menu.
  Aligned menu to selected selectable border color and popout overlayable shadow.
  Fixed filter icon not aligned to secondary content color in the last update.
  Fixed sort indicator position to be next to the menu icon, and its spacing between filter and menu icon.

## 1.3.9

### Patch Changes

- 7bbbab98: Fixed header text color not using correct color token: `--salt-content-secondary-foreground`
- 09080b27: Fixed columns not displaying correctly with `wrapText` and `autoHeight` turned on.

## 1.3.8

### Patch Changes

- f167c14e: Fixed missing padding and focus ring on focused editable cell.
  Fixed wrong background and missing corner flag when editable cell loses focus.

## 1.3.7

### Patch Changes

- 13279948: Update header icon alignment. Adding space between the text and the icon, so the icon will be aligned opposite the text.

## 1.3.6

### Patch Changes

- cdf44770: Fixed border misalignment in range selection on a single column or a single row.

## 1.3.5

### Patch Changes

- 86508404: Cell text from a pinned column no longer overlaps the cell next to it.
- b083861b: Removed a style override for column headers so that header alignment is consistent with column alignment.

## 1.3.4

### Patch Changes

- d200218f: Removed custom CSS styling for wrapping text in header cells when `autoHeaderHeight` is enabled. If you want to wrap text you should use `wrapHeaderText`.
- 6da4d09c: Fixed Tooltip missing a background color.

## 1.3.3

### Patch Changes

- dbea358f: Replaced cell borders with outlines

## 1.3.2

### Patch Changes

- d5fba9c0: Fixes alignment of input text in floating filter
- d0d7db8d: Fixes

  - Status bar value font weight and color
  - Status bar font size
  - Cell range selection improvements
  - Alignment of custom filters in floating filter
  - Scrollbar showing in header cells on wrap
  - Indentation on row groups

## 1.3.1

### Patch Changes

- 7e3a6053: Fixed bugs:

  - Filter icon incorrect color in HD compact theme
  - Vertical alignment of cells
  - Column group cell
  - Alignment of header cell separators with column group cell separators
  - Status bar style enhancements
  - Clipping of sort arrow in header row
  - New floating filter design
  - Pinned right columns styling

- 0d0bdeb4: Fixed invalid CSS being generated for heights
- 0d0bdeb4: Removed extra CSS from the theme.
- 402e13f7: Browser compatibility CSS changes.

  Added missing prefix to `appearance` and revert `padding-inline`, `padding-block` and `margin-block` to improve browser compatibility with Chrome 79

## 1.3.0

### Minor Changes

- 6cc395d0: Use Salt icons in Salt ag-grid theme
- ce2b6d4c: Add color-scheme to Salt AG grid theme to ensure native light and dark mode

### Patch Changes

- c2348ac2: Reduced spacing in context menu styles
- a453cec8: Fixed status bar and floating filter styles

  Added HD compact density styling

- dcd83052: Fixed column separator height and floating filter height

## 1.2.0

### Minor Changes

- 1013b554: Fix button styles in ag grid theme currently showing default HTML buttons by adding salt styles to `.ag-standard-button`.

## 1.1.6

### Patch Changes

- 4bd87710: Fix cell text not truncating in salt ag-grid-theme

## 1.1.5

### Patch Changes

- 123daf60: Fix inconsistent uitk ag-grid theme menu padding across densities

## 1.1.4

### Patch Changes

- f0f5f8e3: Update the icon font
- 1e9ef1a2: Fix duplicate Salt libraries being installed when multiple libraries are installed

## 1.1.3

### Patch Changes

- fb92ab4b: Update the icon mappings
- 09cc1177: Fix broken reference to font

## 1.1.2

### Patch Changes

- 0c478a6b: Fix fonts not being published in the ag-grid-theme

## 1.1.1

### Patch Changes

- 50370dec: Fixed some icons that were overridden incorrectly
- 982da8e2: Fix ag-grid uitk theme floating filter input height in High density

## 1.1.0

### Minor Changes

- f13b23b7: Add two new cell class names in salt ag-grid theme. These can be used instead of `.editable-numeric-cell`

  - `.numeric-cell` used on static cells that contain numeric values
  - `.editable-cell` used on editable cells

### Patch Changes

- 1acc0b03: Fix header focus outline in salt and uitk ag-grid themes
- 4cca8720: Fixed selected row's border color on row hover in salt ag-grid theme.

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
