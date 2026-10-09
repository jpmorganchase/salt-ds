---
"@salt-ds/ag-grid-theme": patch
---

Fixed AG Grid theme styling to align with the Salt Data Grid Figma designs.

- Default row height now includes the 1px row border (`--salt-size-base` + `--salt-spacing-100` + 1px), so cell content matches the header row height.
- Cell text is now vertically centered when `--ag-line-height` isn't defined (AG Grid v33+), and wrapped text cells use `--salt-text-lineHeight`.
- Header column separators are now as tall as `--salt-size-base`, less `--salt-spacing-50` at each end.
- Dividers between header rows (e.g. below column groups) and below the row group panel now use `--salt-separable-tertiary-borderColor`.
- The editable cell corner flag now uses `--salt-focused-outlineColor`, and the inline editing background uses `--salt-editable-primary-background`.
- Header icon buttons now use `--salt-actionable-background-hover` on hover.
- Status bar now matches the row height, uses `--salt-container-subtle-borderColor` for its top border and `--salt-content-primary-foreground` for its labels.
- Row group indentation now uses `--salt-spacing-100` on each side of the icon.
- Menu separators now use `--salt-separable-tertiary-borderColor`.
- Cells now use `--salt-palette-corner-weak` for their corner radius, so focus rings, editable outlines, validation backgrounds and the edit flag are rounded when `corner="rounded"`. Multi-cell range selections only round their outer corners.
- Floating filters, including read-only ones such as the set filter, are drawn as a rounded box with a 1px gap between columns. The focus ring and `--salt-editable-primary-background` now cover the whole box, including the filter button. Columns without a floating filter show no box, and filter values use `--salt-content-secondary-foreground`.
