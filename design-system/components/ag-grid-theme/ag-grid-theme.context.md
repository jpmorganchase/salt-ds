# Salt AG Grid Theme (Copilot Context)

CSS theme that maps AG Grid to Salt Design System tokens. Applied via CSS class names — NOT a React wrapper.

- API: ./ag-grid-theme.json
- Guidance: ./ag-grid-theme.md

## Packages (install on demand)
```
npm install ag-grid-community@">=28.0.0 <=32.0.0" ag-grid-react@">=28.0.0 <=32.0.0" @salt-ds/ag-grid-theme
```

## Key rules
- Import both `ag-grid-community/styles/ag-grid.css` AND `@salt-ds/ag-grid-theme/salt-ag-theme.css`
- Apply theme class to container: `ag-theme-salt-light` or `ag-theme-salt-dark` (use `useTheme()` to pick)
- Container **must** have explicit height (e.g., `style={{ height: 500 }}`)
- Never use AG Grid's built-in themes (Quartz, Alpine, etc.)
- Never use Salt's `Grid`/`GridColumn` from `@salt-ds/data-grid` — use `AgGridReact` from `ag-grid-react`
- Editable columns must include `cellClass: "editable-cell"`
- Numeric columns must use `type: "numericColumn"` for right-alignment — never left-align numbers
- Checkbox selection columns must be density-aware — width = `--salt-size-selectable` + 2 × `--salt-spacing-100` (high: 20px, medium: 30px, low: 40px, touch: 50px). See ag-grid-theme.md for full ColDef pattern

## Required CSS override — cell vertical centering
AG Grid sets `.ag-cell` to `display: inline-block`, which doesn't vertically center content with the Salt theme's line-height. **Always add this fix:**

```css
.ag-ltr .ag-cell {
  display: inline-flex;
  align-items: center;
}
```

## Example
```tsx
import { AgGridReact } from "ag-grid-react";
import { StackLayout, useTheme } from "@salt-ds/core";
import type { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "@salt-ds/ag-grid-theme/salt-ag-theme.css";

const columns: ColDef[] = [
  { field: "name", headerName: "Name" },
  { field: "value", headerName: "Value", type: "numericColumn" },
];

function MyGrid({ data }: { data: any[] }) {
  const { mode } = useTheme();
  const agTheme = mode === "dark" ? "ag-theme-salt-dark" : "ag-theme-salt-light";

  return (
    <div className={agTheme} style={{ height: 500 }}>
      <AgGridReact rowData={data} columnDefs={columns} />
    </div>
  );
}
```
