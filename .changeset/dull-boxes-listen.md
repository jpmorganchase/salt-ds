---
"@salt-ds/data-grid": minor
---

Add cell validation.

```tsx
<GridColumn
  getValidationStatus={({ row }) => validationStatus[row.index].name}
  validationType="strong"
>
```

Add row validation.

```tsx
<Grid getRowValidationStatus={(row) => row.data.status}>
  <RowValidationStatusColumn
    id="status"
    aria-label="Row status"
    defaultWidth={30}
  />
</Grid>
```
