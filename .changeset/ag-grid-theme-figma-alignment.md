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
- Cells now use `--salt-palette-corner-weak` for their corner radius, so focus rings, editable borders, validation backgrounds and the edit flag are rounded when `corner="rounded"`. Multi-cell range selections only round their outer corners. Custom cell backgrounds, such as those set with `cellStyle` or `cellClass`, follow the same corner radius, matching the Figma cell.
- Editor popups (select, rich select and large text) now use `--salt-palette-corner` for their corner radius, matching `OptionList`, and their shadow follows the rounded corners. Their scroll area is inset from the top and bottom by the corner radius, so scrollbars don't overlap the rounded corners.
- Checkboxes are now drawn like Salt's `Checkbox`, with `--salt-palette-corner-weaker` for their corner radius and the indeterminate bar from `CheckboxIcon`.
- Floating filters are drawn as a rounded box with a 1px gap between columns, and the filter button is centered where the Figma button sits inside the box. The focus ring and `--salt-editable-primary-background` now cover the whole box, including the filter button. Read-only floating filters, such as the set filter, and columns without a floating filter show no box, and filter values use `--salt-content-secondary-foreground`.
- Validation status adornments no longer replace the range selection border on cells at the edge of a multi-cell range selection.
- Floating filter values now use `--salt-text-fontSize` and `--salt-text-fontWeight`, instead of the header label text.
- Row group expand icons now have `--salt-spacing-100` on each side, plus a `--salt-spacing-100` gap before the group value, and leaf rows line up with their parent's group value. The hover covers the whole expand button.
- Validation cells now leave a `--salt-spacing-100` gap between the cell text and the status adornment.
- Right-aligned header text now has a `--salt-spacing-100` gap from the menu and filter icons when truncated.
- Column group headers now show a right chevron when closed and a left chevron when open.
- Validation cells inside a range selection keep their status background, with the range selection color painted on top.
- Menus now have a 1px gap between items, with separators drawn in the gap, use the Salt chevron for submenus, and show the Salt focus ring on keyboard focus.
- Filter inputs and dropdowns are now bordered, `--salt-size-base` tall and use `--salt-palette-corner-weak`, with the Salt chevron for dropdowns. Filter buttons also use `--salt-palette-corner-weak`.
- The columns tool panel now uses `--salt-spacing-300` padding and gaps, drop zones are drawn as a dashed box with a bolder message, side bar tabs have a `--salt-spacing-100` gap with a single divider beside them, and the pivot mode toggle matches Salt's `Switch`.
- The pagination panel no longer has a top border, uses `--salt-content-secondary-foreground` with bolder numbers, `--salt-spacing-300` between groups, and transparent buttons around the paging icons.
- Column drop chips now use `--salt-container-secondary-background` with a border, shadow and transparent remove button, instead of the bold actionable style.
- Side bar tabs, paging buttons, column drop chips and the column select header now show the Salt focus ring instead of the AG Grid focus box.
- Dialogs, such as Choose Columns, now match Salt's `Dialog`, with `--salt-palette-corner` and `--salt-container-borderColor`.
- Filter menu content now lines up with the menu padding, with `--salt-spacing-100` between rows and above the buttons.
- Buttons now use the same tokens as Salt's `Button` (`--salt-text-action-*`, and the actionable subtle and accented bold colors including borders and active states), instead of hard-coded font weight and text transform.
- Keyboard focus on list items (set filter, column select, rich select), tabs, tool panel and multi filter group headers, and column group headers now shows the Salt focus ring instead of the AG Grid focus box.
- The filters tool panel now matches the Figma "Filters panel": a bordered search input, `--salt-size-base` group headers with a bolder title and a chevron indicator, and filters indented to the group title.
- Dialog titles now use `--salt-content-primary-foreground` and `--salt-text-fontWeight-bolder`.
- The editable cell corner flag is now `--salt-size-adornment`, and focus ring offsets use Salt tokens instead of fixed pixel values.
- Side-by-side editable cells now have a 1px gap between them, matching the row border between stacked editable cells. The editable border, focus ring and background stay inside the gap, and the pinned column separator takes its place on the last left-pinned column. Range selection backgrounds cover the gap, so a range still reads as one area.
