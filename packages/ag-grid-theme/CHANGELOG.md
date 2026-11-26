# @salt-ds/ag-grid-theme

## 2.11.0

### Minor Changes

- 415c480: Added cell validation support for non-editable cells. The `.error-cell`, `.warning-cell` and `.success-cell` classes no longer need `.editable-cell`, and show the status background, status adornment and focus ring color on any cell. When used together with `.editable-cell`, the editable border also reflects the validation state.

### Patch Changes

- 415c480: Fixed AG Grid theme styling to align with the Salt Data Grid Figma designs.

  - Default row height now includes the 1px row border (`--salt-size-base` + `--salt-spacing-100` + 1px), so cell content matches the header row height.
  - Cell text is now vertically centered when `--ag-line-height` isn't defined (AG Grid v33+), and wrapped text cells use `--salt-text-lineHeight`.
  - Header column separators are now as tall as `--salt-size-base`, less `--salt-spacing-50` at each end.
  - Dividers between header rows (e.g. below column groups) and below the row group panel now use `--salt-separable-tertiary-borderColor`.
  - The editable cell corner flag now uses `--salt-focused-outlineColor`, and the inline editing background uses `--salt-editable-primary-background`.
  - Header icon buttons now use `--salt-actionable-background-hover` on hover. The hover is drawn as a `--salt-size-base` less `--salt-spacing-100` button with `--salt-palette-corner-weaker`, matching Salt's `Button` in an `Input` adornment. The same applies to floating filter, dialog, tool panel and chart icon buttons.
  - Status bar now matches the row height, uses `--salt-container-subtle-borderColor` for its top border and `--salt-content-primary-foreground` for its labels.
  - Row group indentation now uses `--salt-spacing-100` on each side of the icon.
  - Menu separators now use `--salt-separable-tertiary-borderColor`.
  - Cells now use `--salt-palette-corner-weak` for their corner radius, so focus rings, editable borders, validation backgrounds and the edit flag are rounded when `corner="rounded"`. Multi-cell range selections only round their outer corners. Custom cell backgrounds, such as those set with `cellStyle` or `cellClass`, follow the same corner radius, matching the Figma cell.
  - Editor popups (select, rich select and large text) now use `--salt-palette-corner` for their corner radius, matching `OptionList`, and their shadow follows the rounded corners. Select and large text scroll areas are inset from the top and bottom by the corner radius, so scrollbars don't overlap the rounded corners. Rich select keeps its option rows aligned with pointer hit testing.
  - Checkboxes are now drawn like Salt's `Checkbox`, with `--salt-palette-corner-weaker` for their corner radius and the indeterminate bar from `CheckboxIcon`.
  - Floating filters are drawn as a rounded box with a 1px gap between columns, and the filter button is centered where the Figma button sits inside the box. The focus ring and `--salt-editable-primary-background` now cover the whole box, including the filter button. Read-only floating filters, such as the set filter, and columns without a floating filter show no box, and filter values use `--salt-content-secondary-foreground`.
  - Validation status adornments no longer replace the range selection border on cells at the edge of a multi-cell range selection.
  - Floating filter values now use `--salt-text-fontSize` and `--salt-text-fontWeight`, instead of the header label text.
  - Row group expand icons now sit in a transparent button, with `--salt-spacing-100` on each side of the icon and `--salt-palette-corner-weak`, plus a `--salt-spacing-100` gap before the group value. Leaf rows line up with their parent's group value. The button uses `--salt-actionable-subtle-background-hover` and `--salt-actionable-subtle-background-active`, matching a transparent `Button`.
  - Validation cells now leave a `--salt-spacing-100` gap between the cell text and the status adornment.
  - Right-aligned header text now has a `--salt-spacing-100` gap from the menu and filter icons when truncated.
  - Column group headers now show a right chevron when closed and a left chevron when open.
  - Validation cells inside a range selection keep their status background, with the range selection color painted on top. Cells colored with an inline style, such as `cellStyle`, now also show the range selection color on top of their own color, instead of hiding it.
  - Menus now have a 1px gap between items, with separators drawn in the gap, use the Salt chevron for submenus, and show the Salt focus ring on keyboard focus. Pressed menu items match `MenuItem`'s active state, with `--salt-selectable-background-selected` and a `--salt-selectable-borderColor-selected` line above and below.
  - Filter inputs and dropdowns are now bordered, `--salt-size-base` tall and use `--salt-palette-corner-weak`, with the Salt chevron for dropdowns. Filter buttons also use `--salt-palette-corner-weak`.
  - The columns tool panel now uses `--salt-spacing-300` padding and gaps, drop zones are drawn as a dashed box with a bolder message, side bar tabs have a `--salt-spacing-100` gap with a single divider beside them, and the pivot mode toggle matches Salt's `Switch`.
  - The columns tool panel keeps space for the column picker and scrolls when its contents exceed the available height, including when pivot mode adds another drop zone.
  - The pagination panel no longer has a top border, uses `--salt-content-secondary-foreground` with bolder numbers, `--salt-spacing-300` between groups, and transparent buttons around the paging icons.
  - Column drop chips now use `--salt-container-secondary-background` with a border, shadow and transparent remove button, instead of the bold actionable style.
  - Side bar tabs, paging buttons, column drop chips and the column select header now show the Salt focus ring instead of the AG Grid focus box.
  - Dialogs, such as Choose Columns, now match Salt's `Dialog`, with `--salt-palette-corner` and `--salt-container-borderColor`.
  - Filter menu content now lines up with the menu padding, with `--salt-spacing-100` between rows and above the buttons.
  - Buttons now use the same tokens as Salt's `Button` (`--salt-text-action-*`, and the actionable subtle and accented bold colors including borders and active states), instead of hard-coded font weight and text transform.
  - Keyboard focus on list items (set filter, column select, rich select), tabs, tool panel and multi filter group headers, and column group headers now shows the Salt focus ring instead of the AG Grid focus box.
  - The filters tool panel now matches the Figma "Filters panel": a bordered search input, `--salt-size-base` group headers with a bolder title and a chevron indicator, and filters indented to the group title. Filter actions wrap when the panel is too narrow to fit them on one row.
  - Dialog titles now use `--salt-content-primary-foreground` and `--salt-text-fontWeight-bolder`.
  - The editable cell corner flag is now `--salt-size-adornment`, and focus ring offsets use Salt tokens instead of fixed pixel values.
  - Every cell now leaves a 1px gap on its right, matching the Figma column separator slot and the row border between stacked cells. Cell backgrounds, including validation backgrounds and custom backgrounds set with `cellStyle` or `cellClass`, editable borders and focus rings stay inside the gap, so neighboring colored cells no longer merge. The pinned column separator takes the place of the gap on the last left-pinned column, and range selection backgrounds cover the gaps between selected cells, so a range still reads as one area. The gap after the last column of a range stays clear. Custom backgrounds set with the `background` shorthand in `cellStyle` also paint the gap; use `backgroundColor` instead.
  - Range selection borders now cover the gaps between selected cells, preserving the pinned column separators and the clear gap after the last selected column.

## 2.10.2

### Patch Changes

- 825f63d: Renamed the `small` and `strong` font weight tokens to `lighter` and `bolder`, to match the new `fontWeight` prop on `Text`. The old tokens still work as aliases but are deprecated and will be removed in a future major version. Salt components now use the new tokens, so if you override an old token, override the new one instead.

  ```diff
  - font-weight: var(--salt-text-fontWeight-strong);
  + font-weight: var(--salt-text-fontWeight-bolder);
  ```

  | Deprecated token                         | Use instead                               |
  | ---------------------------------------- | ----------------------------------------- |
  | `--salt-text-fontWeight-small`           | `--salt-text-fontWeight-lighter`          |
  | `--salt-text-fontWeight-strong`          | `--salt-text-fontWeight-bolder`           |
  | `--salt-text-action-fontWeight-small`    | `--salt-text-action-fontWeight-lighter`   |
  | `--salt-text-action-fontWeight-strong`   | `--salt-text-action-fontWeight-bolder`    |
  | `--salt-text-display-fontWeight-small`   | `--salt-text-display-fontWeight-lighter`  |
  | `--salt-text-display-fontWeight-strong`  | `--salt-text-display-fontWeight-bolder`   |
  | `--salt-text-heading-fontWeight-small`   | `--salt-text-heading-fontWeight-lighter`  |
  | `--salt-text-heading-fontWeight-strong`  | `--salt-text-heading-fontWeight-bolder`   |
  | `--salt-text-label-fontWeight-small`     | `--salt-text-label-fontWeight-lighter`    |
  | `--salt-text-label-fontWeight-strong`    | `--salt-text-label-fontWeight-bolder`     |
  | `--salt-text-notation-fontWeight-small`  | `--salt-text-notation-fontWeight-lighter` |
  | `--salt-text-notation-fontWeight-strong` | `--salt-text-notation-fontWeight-bolder`  |

  The deprecated `--salt-text-h{1-4}-fontWeight-small`, `--salt-text-h{1-4}-fontWeight-strong`, `--salt-text-display{1-4}-fontWeight-small` and `--salt-text-display{1-4}-fontWeight-strong` tokens now alias the new tokens.

  The `small` and `strong` font weight tokens have been removed from the experimental Salt (Interim) theme without aliases. If you use the interim theme and reference them, switch to the matching `lighter` and `bolder` tokens in the table above.

  See [font weight](https://www.saltdesignsystem.com/salt/foundations/typography#font-weight) for how each text style uses these weights.

- Updated dependencies [c319c14]
- Updated dependencies [825f63d]
- Updated dependencies [825f63d]
- Updated dependencies [825f63d]
- Updated dependencies [825f63d]
  - @salt-ds/theme@1.48.0

## 2.10.1

### Patch Changes

- d578674: Applied typography letter spacing tokens consistently to text-owning components and inherited typography roots, and applied the display text transform token to display text.
- Updated dependencies [d578674]
- Updated dependencies [e990c46]
- Updated dependencies [8e59c5d]
- Updated dependencies [e990c46]
- Updated dependencies [d578674]
- Updated dependencies [8e59c5d]
- Updated dependencies [8e59c5d]
- Updated dependencies [8e59c5d]
- Updated dependencies [d578674]
- Updated dependencies [8e59c5d]
- Updated dependencies [550c4c1]
  - @salt-ds/theme@1.47.0

## 2.10.0

### Minor Changes

- 487e75d: Upgraded support to AG-Grid v36.

  Added Salt `SortAscend` and `SortDescend` glyphs for AG Grid Absolute Sorting (`aasc` / `adesc` icon names).

### Patch Changes

- Updated dependencies [2e1da8e]
- Updated dependencies [be5eb93]
- Updated dependencies [0f92b84]
- Updated dependencies [be5eb93]
  - @salt-ds/theme@1.46.0

## 2.9.0

### Minor Changes

- a5d12be: Added header background modifier classes on the grid wrapper to align AG Grid headers with the Salt `Table` `<THead variant />` API.

  - `ag-theme-salt-header-primary` (default), `ag-theme-salt-header-secondary`, `ag-theme-salt-header-tertiary` — swap the header background between Salt's primary, secondary and tertiary container tokens.

  Add them alongside the mode class on the grid wrapper:

  ```jsx
  <div className="ag-theme-salt-light ag-theme-salt-header-secondary">
    <AgGridReact rowData={rowData} columnDefs={columnDefs} />
  </div>
  ```

### Patch Changes

- a5d12be: Fixed several AG Grid theme styling issues:

  - Row Group Panel pill text and icon now use `--salt-actionable-bold-foreground` (with `-hover` and `-active` variants), and the chip background uses `--salt-actionable-bold-background`, matching the Salt `Pill` component. Previously the pill text inherited `--salt-content-primary-foreground` and the background used `--salt-actionable-primary-background`.
  - Replaced remaining references to legacy actionable token aliases. The theme was still referencing `--salt-actionable-secondary-*` (renamed to `--salt-actionable-subtle-*`) and `--salt-actionable-cta-*` (renamed to `--salt-actionable-accented-bold-*`). Both old names exist only in the legacy theme's deprecated aliases file and are not defined in `themeNext`, so the theme would silently render with undefined values when used with `SaltProviderNext`. No visual change for users of the legacy theme—the aliases resolve to the same values.
  - Scoped helper classes to the Salt theme wrapper. `.error-row`, `.warning-row`, `.success-row`, `.ag-column-drop-cell*` and `.ag-toggle-button-input-wrapper*` rules were previously declared as bare class selectors. They are now scoped to `[class*="ag-theme-salt"]` so they only match elements inside a Salt-themed grid and can no longer collide with consumer classes of the same name elsewhere on the page.

## 2.8.0

### Minor Changes

- feffe8d: - Added tertiary support to the ag grid theme.
  - Added secondary zebra support to the ag grid theme.
  - Added tertiary zebra support to the ag grid theme.

### Patch Changes

- Updated dependencies [23b5f53]
- Updated dependencies [40cdcb4]
- Updated dependencies [fdb9cfc]
- Updated dependencies [23b5f53]
  - @salt-ds/theme@1.41.0

## 2.7.0

### Minor Changes

- 972e37e: Added mobile density tokens.

### Patch Changes

- Updated dependencies [972e37e]
- Updated dependencies [972e37e]
  - @salt-ds/theme@1.39.0

## 2.6.1

### Patch Changes

- ce18830: Fixed the background color of inputs in the header of a zebra striped grid being incorrect.
- Updated dependencies [df46ef9]
- Updated dependencies [afe9104]
  - @salt-ds/theme@1.38.0

## 2.6.0

### Minor Changes

- 58d81ac: - Added row validation status support via classes: `.error-row`, `.warning-row` and `.success-row`.
  - Added cell validation status support via classes: `.error-cell`, `.warning-cell` and `.success-cell`, when used together with `.editable-cell`.
  - Refactored secondary and zebra variant to better align with ag grid CSS variables. This fixes row selection border color for zebra variant.

### Patch Changes

- Updated dependencies [e9838b5]
- Updated dependencies [e9838b5]
- Updated dependencies [e9838b5]
  - @salt-ds/theme@1.34.0

## 2.5.1

### Patch Changes

- 3db3703: Fixed menus showing up as secondary using secondary and zebra variants.
- Updated dependencies [9c74ceb]
  - @salt-ds/theme@1.33.0

## 2.5.0

### Minor Changes

- d2055e1: Added date filter support.

  ```js
  const dateColumnDef = {
    // ...
    filter: "agDateColumnFilter",
  };
  ```

### Patch Changes

- Updated dependencies [9277313]
- Updated dependencies [512b0e7]
- Updated dependencies [64ef723]
- Updated dependencies [9277313]
- Updated dependencies [9277313]
- Updated dependencies [9277313]
- Updated dependencies [8538730]
- Updated dependencies [9277313]
  - @salt-ds/theme@1.32.0

## 2.4.4

### Patch Changes

- Updated dependencies [665c306]
- Updated dependencies [9a4ff31]
- Updated dependencies [5edb00f]
- Updated dependencies [c86ee15]
- Updated dependencies [1a8898f]
- Updated dependencies [5edb00f]
- Updated dependencies [1a8898f]
- Updated dependencies [9a4ff31]
- Updated dependencies [1a8898f]
- Updated dependencies [91f0e09]
- Updated dependencies [efb4fbc]
- Updated dependencies [efb4fbc]
  - @salt-ds/theme@1.31.0

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

  2. Update classnames used on the container around `AgGridReact`, which no longer has density portion. If you previously copied `useAgGridHelpers`, you'll need to copy a new version from [here](https://github.com/jpmorganchase/salt-ds/blob/2cb267b0ee4b86cf73464508936b7fe902095fe5/site/src/examples/ag-grid-theme/useAgGridHelpers.ts).

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
