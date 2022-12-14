# @jpmorganchase/uitk-grid

## 0.4.1

### Patch Changes

- f9589d76: Grid variants story updated to include "compact" variant of high density grid
  Editable cell border fixed (when grid is not focused)
- bca5e407: Move aria-rowindex to row elements
- 3ea035de: Focusable headers
  Design update (separators, shadows and focus)
  Characteristics updated

## 0.4.0

### Minor Changes

- da7065c1: Merge `-caption` and `-help` tokens to single `-label` token
  Remove `--uitk-text-help-fontWeight`, `--uitk-text-caption-fontStyle`
  Move `--uitk-text-help-fontStyle` to become `--uitk-editable-help-fontStyle`

  ```diff
  -  --uitk-text-caption-fontStyle
  -  --uitk-text-caption-fontWeight
  -  --uitk-text-caption-fontWeight-strong
  -  --uitk-text-caption-fontSize
  -  --uitk-text-caption-minHeight
  -  --uitk-text-help-fontWeight
  -  --uitk-text-help-fontSize
  -  --uitk-text-help-minHeight
  -  --uitk-text-help-fontStyle
  +  --uitk-text-label-fontWeight
  +  --uitk-text-label-fontWeight-strong
  +  --uitk-text-label-fontSize
  +  --uitk-editable-help-fontStyle
  ```

  Correct line height values

  TD

  ```diff
  -  --uitk-text-caption-lineHeight: 16px;
  -  --uitk-text-help-lineHeight: 16px;
  +  --uitk-text-label-lineHeight: 18px;
  ```

  LD

  ```diff
  -  --uitk-text-caption-lineHeight: 14px;
  -  --uitk-text-help-lineHeight: 14px;
  +  --uitk-text-label-lineHeight: 16px;
  ```

  MD

  ```diff
  -  --uitk-text-caption-lineHeight: 14px;
  -  --uitk-text-help-lineHeight: 14px;
  +  --uitk-text-label-lineHeight: 14px;
  ```

  HD

  ```diff
  -  --uitk-text-caption-lineHeight: 14px;
  -  --uitk-text-help-lineHeight: 14px;
  +  --uitk-text-label-lineHeight: 13px;
  ```

- 8c075106: Use American English 'gray' throughout code

### Patch Changes

- 8ded93ce: Fix Grid headers and column groups accessibility
- 51c31aeb: Focus handling changed to improve accessibility. Cells receive real focus.
  Keyboard handling updated.
  Aria attributes added.
  Keyboard navigation and edit mode tests added.
- 1228d3db: Remove selection column pinning by default
- d8d00054: Add aria-colcount, aria-rowcount and aria-multiselectable to grid
- 185375b5: Remove pinned Grid columns from the DOM when not in use.
- 656d4b07: Additional separators (pinned column separators) added (optional, enabled by default)
  Pinned/unpinned column separator replaces the regular column separator and column header separator (rendered on the same place)
  Shadows have no gaps between the header and table body
  Header has a shadow when scrollTop is not zero
- 4ed5e1f1: Row selection checkbox/radio button gets focus

## 0.3.2

### Patch Changes

- 9a520319: Updated styles for column drag-and-drop
  Escape key pressed while dragging a column cancels column move

## 0.3.1

### Patch Changes

- 2d57cb73: Selection modes can be changed in runtime
  Tests updated
  CSS variables added
  Docs updated
- 282fce7a: Improve Grid documentation
  Minor CSS cleanup
  Fix scrolling on the Grid also scrolling the page

## 0.3.0

### Minor Changes

- 3aac68ac: Ensure component tokens start with their full name, as well as for any subcomponents, in all private and public tokens. Examples: --uitkCheckboxIcon- -> --uitkCheckbox-icon-, --uitkAccordionSummary- -> --uitkAccordion-summary-, --formHelperText -> --formField-helperText
- 5d8e5c74: Focus visible API removed from components; always use theme characteristics directly for focus visible styling
- a8ec0ff8: rxjs removed, grid is a plain react component now. Grid design updated to latest specs. Grid API changed.

### Patch Changes

- 09540ddc: `Grid` documentation added
  Keyboard handling improved
  `Grid` API improved

## 0.2.0

### Minor Changes

- 9b4964ae: Change checkbox -solid-color token to -fill
- 58adde30: Ensure CSS attributes in all private and public tokens are always kebab case, e.g.:
  --uitkDialog-border-color -> --uitkDialog-borderColor
  --accordion-summary-padding-left -> --accordion-summary-paddingLeft
  --grid-item-grid-row-end -> --grid-item-gridRowEnd
- b07baa66: Fix for class names in selectors causing nesting issues when design tokens are density specific
- dd8c7646: Add global css box-sizing as border-box, and remove from components
