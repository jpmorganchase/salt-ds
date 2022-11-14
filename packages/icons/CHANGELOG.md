# @jpmorganchase/uitk-icons

## 0.7.0

### Minor Changes

- 172fd5a8: Updated the `<Icon />` component.

  - It now only accepts SVG elements as children and should be used as follows:

  ```jsx
  <Icon aria-label="add" viewBox="0 0 12 12" size={1}>
    <path d="M7 0H5v5H0v2h5v5h2V7h5V5H7V0z" />
  </Icon>
  ```

  - Wrapping span elements have been removed so the root element is the `<svg>` itself. The Icon ref is now type `SVGSVGElement` instead of a `<span>`.

  - The size prop has been updated to be a number which is a multiplier of the base value instead of a named size. At high density the following would apply:

  ```jsx
  <AddIcon size="small" />
  <AddIcon size="medium" />
  <AddIcon size="large" />
  ```

  becomes

  ```jsx
  <AddIcon size={1} />
  <AddIcon size={2} />
  <AddIcon size={4} />
  ```

  - The size of the Icon will now scale with density.
  - **Note:** Previously Icon could be set to a specific size by passing a number to the `size` prop. This has been removed so Icons will scale with the rest of the design system. You can still set a specific size using the css variable `--icon-size` but it is not recommended as your component won't scale with density.
  - Built in Icon components e.g. `<AddIcon />` have been regenerated to use the new Icon component so their html and API have changed accordingly.
  - UITK components which had Icon or a built-in Icon as a dependancy have also been updated.
  - A new size css variable `--uitk-size-icon-base` has been added to the theme for each density.

### Patch Changes

- 7c234a84: Renamed SortNumDescentIcon to SortNumDescendIcon

  Fix some icons with incorrect scales:

  - SortAlphaDescending
  - SortNumAscend
  - SortNumDescend

## 0.6.0

### Minor Changes

- 78f0be6d: Add new icons:

  - Api
  - Bookmark
  - BookmarkSolid
  - Building
  - Buildings
  - BuildingSolid
  - BuildingsSolid
  - BuildReportSolid
  - Calculator
  - CalculatorSolid
  - Closedcaption
  - ClosedcaptionDisabled
  - ClosedcaptionSolid
  - Cloud
  - CloudSolid
  - Coffee
  - CoffeeSolid
  - Compass
  - CompassSolid
  - Cookie
  - CookieSolid
  - CsvSolid
  - Dark
  - DarkSolid
  - Diamond
  - ErrorSolid
  - FilterClear
  - FilterClearSolid
  - FolderClosedSolid
  - FolderOpenSolid
  - GuideClosedSolid
  - GuideOpenSolid
  - HelpSolid
  - Image
  - ImageSolid
  - InfoSolid
  - Key
  - KeySolid
  - Light
  - LightSolid
  - LocationSolid
  - PdfSolid
  - PivotSolid
  - ProgressCancelled
  - ProgressClosed
  - ProgressComplete
  - ProgressDraft
  - ProgressInprogress
  - ProgressOnhold
  - ProgressPending
  - ProgressRejected
  - ProgressTodo
  - RunReportSolid
  - ScheduleTimeSolid
  - SortAlphaAscend
  - SortAlphaDescend
  - SortNumAscend
  - SortNumDescent
  - SuccessSolid
  - Tag
  - TagClear
  - TagClearSolid
  - TagSolid
  - Tails
  - TailsSolid
  - Target
  - UrgencyCritical
  - UrgencyHigh
  - UrgencyLow
  - UrgencyMedium
  - UrgencyNone
  - Video
  - VideoDisabled
  - VideoSolid
  - WarningSolid
  - XlsSolid
  - ZipSolid

## 0.5.0

### Minor Changes

- 5b9a50db: Delete WarningSecondaryIcon
- eda3b744: Delete ErrorSecondaryIcon
- ae1591ae: Delete HelpSecondaryIcon
- 926cfb2e: Delete SuccessSecondaryIcon
- 7d5afa66: Delete InfoSecondaryIcon

## 0.4.1

### Patch Changes

- d208f8b1: Fix circular dependencies warning

## 0.4.0

### Minor Changes

- 46bcdec9: Add new icon and update existing onces with updated design
- 58adde30: Ensure CSS attributes in all private and public tokens are always kebab case, e.g.:
  --uitkDialog-border-color -> --uitkDialog-borderColor
  --accordion-summary-padding-left -> --accordion-summary-paddingLeft
  --grid-item-grid-row-end -> --grid-item-gridRowEnd
- 1c1d5b1e: Remove unsupported ColumnChooserSingle and ColumnChooserSingleSolid icons
- dd8c7646: Add global css box-sizing as border-box, and remove from components

## 0.3.0

### Minor Changes

- f6919e32: Modify sideEffects to css related files from package.json

## 0.2.0

### Minor Changes

- f5facb1: Icon component and createIcon util is move from core to icons package

### Patch Changes

- 36e0654: Remove xmlns attributes from Icon components

## 0.1.0

### Minor Changes

- f509a9d: Release the icons package.
