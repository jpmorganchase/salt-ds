---
"@salt-ds/ag-grid-theme": patch
---

- Fixed background color for custom editor component.
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
