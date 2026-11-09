---
"@salt-ds/ag-grid-theme": minor
---

Added `ag-theme-salt` and `ag-theme-salt-compact` class names. The theme takes its mode from the nearest `SaltProvider`, as before, so one class name works in light and dark mode; `ag-theme-salt-light`, `ag-theme-salt-dark`, `ag-theme-salt-compact-light` and `ag-theme-salt-compact-dark` still work and are the same.

Row heights now include the border below each row, so rows follow the density of the nearest `SaltProvider` without setting `rowHeight` or `headerHeight` on the grid: rows are 25px, 37px, 49px and 61px tall in high, medium, low and touch density, with headers 1px shorter.

HD Compact (`ag-theme-salt-compact`) now applies in high density only, as documented; in other densities a compact grid has that density's sizes.

```jsx
<div className="ag-theme-salt" style={{ height: 400 }}>
  <AgGridReact theme="legacy" rowData={rowData} columnDefs={columnDefs} />
</div>
```
