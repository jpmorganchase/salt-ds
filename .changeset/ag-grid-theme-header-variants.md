---
"@salt-ds/ag-grid-theme": minor
---

Added header background modifier classes on the grid wrapper to align AG Grid headers with the Salt `Table` `<THead variant />` API.

- `ag-theme-salt-header-primary` (default), `ag-theme-salt-header-secondary`, `ag-theme-salt-header-tertiary` — swap the header background between Salt's primary, secondary and tertiary container tokens.

Add them alongside the mode class on the grid wrapper:

```jsx
<div className="ag-theme-salt-light ag-theme-salt-header-secondary">
  <AgGridReact rowData={rowData} columnDefs={columnDefs} />
</div>
```
