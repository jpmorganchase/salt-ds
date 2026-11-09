---
"@salt-ds/ag-grid-theme": minor
---

Added `ag-theme-salt` and `ag-theme-salt-compact` class names. The theme takes its mode from the nearest `SaltProvider`, as before, so one class name works in light and dark mode; `ag-theme-salt-light`, `ag-theme-salt-dark`, `ag-theme-salt-compact-light` and `ag-theme-salt-compact-dark` still work and are the same.

Row heights now include the border below each row, so the theme supplies rows of 25px, 37px, 49px and 61px in high, medium, low and touch density, with headers 1px shorter. Cell text stays vertically aligned when heights come from CSS.

Client-side grids on AG Grid v33 and later follow density changes without setting `rowHeight` or `headerHeight`. Infinite-scroll examples retain a reactive `rowHeight` option because that row model does not update row heights from CSS changes.

HD Compact (`ag-theme-salt-compact`) preserves the existing compact classes' sizing behavior. It is intended for high density, and the example helpers apply it only when the nearest `SaltProvider` is high density.

```jsx
<div className="ag-theme-salt" style={{ height: 400 }}>
  <AgGridReact theme="legacy" rowData={rowData} columnDefs={columnDefs} />
</div>
```
