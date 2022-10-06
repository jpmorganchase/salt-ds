# @jpmorganchase/uitk-grid

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
