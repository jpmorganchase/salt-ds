# @jpmorganchase/uitk-theme

## 0.5.0

### Minor Changes

- 3aac68ac: Ensure component tokens start with their full name, as well as for any subcomponents, in all private and public tokens. Examples: --uitkCheckboxIcon- -> --uitkCheckbox-icon-, --uitkAccordionSummary- -> --uitkAccordion-summary-, --formHelperText -> --formField-helperText

## 0.4.0

### Minor Changes

- 58adde30: Ensure CSS attributes in all private and public tokens are always kebab case, e.g.:
  --uitkDialog-border-color -> --uitkDialog-borderColor
  --accordion-summary-padding-left -> --accordion-summary-paddingLeft
  --grid-item-grid-row-end -> --grid-item-gridRowEnd
- 6259041e: Changes to text characteristic fontSize tokens

  TD:
  H1 36px -> 42px
  H2 28px -> 32px
  H3 18px -> 24px
  Caption 12px -> 14px
  Help 12px -> 14px

  LD:
  Caption 11px -> 12px
  Help 11px -> 12px

- 1269d30f: Gradient from palette and measured characteristic fill values replaced with solid blue color in line with design change; backwards compatibility classes added to CircularProgress and Spinner
- dd8c7646: Add global css box-sizing as border-box, and remove from components

## 0.3.1

### Patch Changes

- 765fed67: Theme
  small additions to text characteristic

  Lab
  Breadcrumb, ContactDetails, ContentStatus, Metric, Text: apply new naming conventions for CSS variables, add backwardsCompat styling
  Enhance QA stories

  Docs
  add functionality to QAContainer

- d3ee2063: - Remove text minimum height token.
  - Add backwards compatibility for text line height
  - Make sure text line height is declared for all densities

## 0.3.0

### Minor Changes

- 50dcb9a: Pill style uses characteristics
- 0093d6e: Characteristic changes - text characteristic, no direct usage of typography and opacity, rename tokens to use camel case
- fe868ab: Add layer layout component to lab

## 0.2.0

### Minor Changes

- 008074c: Switch css/api and new tokens for switch
- 54d5442: Introduce Draggable and Drop Target characteristics
- 550a668: - fix: blue 800 and 900 values #106
- feat: new characteristics token structure introduced #118 #46
- docs: auto gen characteristics table for component docs #134 #139
- fix: allow @types/react@18 peer dependency #131
- docs: allow all renderer and doc grid to be controlled #137
- chore: enable Chromatic #130 #133 #135 #136
- build: bump @floating-ui/react-dom-interactions to v0.5.0 #100
- chore: bump modular-scripts to v3.0.0 #97

## 0.1.0

### Minor Changes

- f509a9d: Release the theme package.
