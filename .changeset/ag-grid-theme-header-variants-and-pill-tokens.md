---
"@salt-ds/ag-grid-theme": minor
---

Aligned the AG Grid theme with the Salt `Table` component (#5391) and fixed the Row Group Panel pill colors (#6196).

- **Header background and divider variants.** New modifier class names on the grid wrapper mirror the Salt `Table` `<THead variant divider />` API, giving AG Grid headers the same visual-distinction options:

  - `ag-theme-salt-header-primary` (default), `ag-theme-salt-header-secondary`, `ag-theme-salt-header-tertiary` — swap the header background between Salt's primary, secondary and tertiary container tokens.
  - `ag-theme-salt-header-divider-primary` (default), `-secondary`, `-tertiary`, `-none` — control the strength of the line between the header and the body.

  Add them alongside the mode class on the grid wrapper:

  ```jsx
  <div className="ag-theme-salt-light ag-theme-salt-header-secondary ag-theme-salt-header-divider-primary">
    <AgGridReact rowData={rowData} columnDefs={columnDefs} />
  </div>
  ```

- **Row Group Panel pill text and icon now use `--salt-actionable-bold-foreground`** (with `-hover` and `-active` variants), and the chip background uses `--salt-actionable-bold-background`, matching the Salt `Pill` component. Previously the pill text inherited `--salt-content-primary-foreground` and the background used `--salt-actionable-primary-background`.

- **Removed remaining references to legacy actionable token aliases.** The theme was still referencing `--salt-actionable-secondary-*` (renamed to `--salt-actionable-subtle-*`) and `--salt-actionable-cta-*` (renamed to `--salt-actionable-accented-bold-*`). Both old names exist only in the legacy theme's deprecated aliases file and are not defined in `themeNext`, so the theme would silently render with undefined values when used with `SaltProviderNext`. No visual change for users of the legacy theme—the aliases resolve to the same values.

- **Scoped helper classes to the Salt theme wrapper.** `.error-row`, `.warning-row`, `.success-row`, `.ag-column-drop-cell*` and `.ag-toggle-button-input-wrapper*` rules were previously declared as bare class selectors. They are now scoped to `[class*="ag-theme-salt"]` so they only match elements inside a Salt-themed grid and can no longer collide with consumer classes of the same name elsewhere on the page.
