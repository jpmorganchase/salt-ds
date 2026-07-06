---
"@salt-ds/ag-grid-theme": patch
---

Fixed several AG Grid theme styling issues:

- Row Group Panel pill text and icon now use `--salt-actionable-bold-foreground` (with `-hover` and `-active` variants), and the chip background uses `--salt-actionable-bold-background`, matching the Salt `Pill` component. Previously the pill text inherited `--salt-content-primary-foreground` and the background used `--salt-actionable-primary-background`.
- Replaced remaining references to legacy actionable token aliases. The theme was still referencing `--salt-actionable-secondary-*` (renamed to `--salt-actionable-subtle-*`) and `--salt-actionable-cta-*` (renamed to `--salt-actionable-accented-bold-*`). Both old names exist only in the legacy theme's deprecated aliases file and are not defined in `themeNext`, so the theme would silently render with undefined values when used with `SaltProviderNext`. No visual change for users of the legacy theme—the aliases resolve to the same values.
- Scoped helper classes to the Salt theme wrapper. `.error-row`, `.warning-row`, `.success-row`, `.ag-column-drop-cell*` and `.ag-toggle-button-input-wrapper*` rules were previously declared as bare class selectors. They are now scoped to `[class*="ag-theme-salt"]` so they only match elements inside a Salt-themed grid and can no longer collide with consumer classes of the same name elsewhere on the page.
