# @jpmorganchase/uitk-grid

## 0.2.0

### Minor Changes

- 9b4964ae: Change checkbox -solid-color token to -fill
- 58adde30: Ensure CSS attributes in all private and public tokens are always kebab case, e.g.:
  --uitkDialog-border-color -> --uitkDialog-borderColor
  --accordion-summary-padding-left -> --accordion-summary-paddingLeft
  --grid-item-grid-row-end -> --grid-item-gridRowEnd
- b07baa66: Fix for class names in selectors causing nesting issues when design tokens are density specific
- dd8c7646: Add global css box-sizing as border-box, and remove from components
