---
"@salt-ds/ag-grid-theme": minor
---

Added `ag-theme-salt` and `ag-theme-salt-compact` class names. The theme takes its mode from the nearest `SaltProvider`, as before, so one class name works in light and dark mode; `ag-theme-salt-light`, `ag-theme-salt-dark`, `ag-theme-salt-compact-light` and `ag-theme-salt-compact-dark` still work and are the same.

Client-side grids without auto-height columns follow CSS density changes from AG Grid v33. AG Grid v36.2 adds this behavior for the infinite and viewport row models, and for server-side grids without auto-height columns. With AG Grid v36.3 and later, client-side and server-side grids also update auto-height rows when the theme's height changes, preserving space for taller content. These configurations can leave `rowHeight` and `headerHeight` unset. A new auto-height example shows short and wrapped text, empty cells and fixed-height renderers together. The infinite-scroll examples retain a reactive `rowHeight` for compatibility with versions before v36.2; see the usage guide for older-version limitations.

Cells of AG Grid's `rightAligned` and `numericColumn` column types now show validation states and edited values on the same sides as `numeric-cell` cells: the status adornment on the left, away from the value, and the edited value on the right. In a right-to-left grid, where AG Grid puts their values on the left, the adornment is on the right and the edited value on the left.

HD Compact (`ag-theme-salt-compact`) preserves the existing compact classes' sizing behavior. It is intended for high density; if your application switches density, apply it only in high density and use `ag-theme-salt` otherwise.

```jsx
<div className="ag-theme-salt" style={{ height: 400 }}>
  <AgGridReact theme="legacy" rowData={rowData} columnDefs={columnDefs} />
</div>
```
