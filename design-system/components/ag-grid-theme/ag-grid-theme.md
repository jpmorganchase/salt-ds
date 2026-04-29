# Salt AG Grid Theme

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/@salt-ds/ag-grid-theme
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/theming/how-to-compose-a-theme.mdx
- Repository: https://github.com/jpmorganchase/salt-ds

## When to use

- You need a data grid / table with sorting, filtering, grouping, or editable cells
- The UI must respect Salt Design System tokens for color, typography, spacing, and density
- You want consistent light/dark mode and density support without manual styling

## When not to use

- **Simple read-only table** — use a plain HTML `<table>` with Salt `Text` and tokens, or Salt's layout components
- **Card-based list** — use `Card` + `StackLayout` instead
- **You need Salt's own Grid/GridColumn** — this is a legacy component; always use AG Grid with the Salt theme instead

## AG Grid version compatibility

- Supported: **>= 28.0.0** and **<= 32.0.0**
- AG Grid v33 introduced a new theming API. If you must use v33, set `{ theme: "legacy" }` on the grid. See the [AG Grid v33 upgrade guide](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-33/).

## Common mistakes

- ❌ Forgetting to import AG Grid's base CSS (`ag-grid.css`) — the theme only overrides variables; it doesn't include structural styles
- ❌ Using AG Grid's built-in themes (Quartz, Alpine, Balham, Material) alongside the Salt theme — use **only** the Salt theme classes
- ❌ Not setting an explicit height on the grid container — AG Grid does not render without a sized container
- ❌ Omitting `cellClass: "editable-cell"` on editable columns — the editable border won't render
- ❌ Using `@salt-ds/data-grid`'s `Grid`/`GridColumn` components — these are a legacy Salt data grid, not the AG Grid integration
- ❌ Not applying the vertical-centering CSS fix — content will be misaligned
- ❌ Leaving checkbox selection columns at default width (~200px) — use the density-aware width (high: 20px, medium: 30px, low: 40px, touch: 50px)

## Editable cells

Any editable column **must** include `cellClass: "editable-cell"` to render the Salt-styled border outline.

| Cell class | Purpose |
|---|---|
| `editable-cell` | Base editable styling (required for all editable columns) |
| `numeric-cell` | Combine with `editable-cell` for numeric columns |
| `error-cell` | Validation error (red border + status dot) |
| `warning-cell` | Validation warning (orange border + status dot) |
| `success-cell` | Validation success (green border + status dot) |

## How it works

The Salt AG Grid theme is a **CSS-only theme** — it is not a React wrapper component. You apply it by:
1. Importing AG Grid's base CSS: `import "ag-grid-community/styles/ag-grid.css";`
2. Importing the Salt theme CSS: `import "@salt-ds/ag-grid-theme/salt-ag-theme.css";`
3. Applying a theme class to the grid container (e.g., `className="ag-theme-salt-light"`)

The theme maps AG Grid's CSS custom properties to Salt tokens so the grid inherits the correct colors, fonts, spacing, and density from the Salt provider.

## Known issues and required CSS overrides

### Cell vertical alignment (REQUIRED)
**Problem:** AG Grid's base CSS sets `.ag-cell` to `display: inline-block`. The Salt theme adjusts `line-height` to `calc(var(--ag-line-height) - 1px)` but does not change the `display` property. The `inline-block` display model relies on line-height for vertical positioning, and the `-1px` offset causes cell content to sit slightly above center — especially visible at non-default densities or with custom cell renderers that render React components.

**Fix:** Add this CSS override to your project (e.g. in `App.css` or a dedicated `ag-grid-overrides.css`):

```css
/* Fix AG Grid + Salt theme cell vertical centering.
   AG Grid base uses display: inline-block on .ag-cell, which doesn't
   reliably center content with the Salt theme's adjusted line-height.
   Switching to inline-flex + align-items: center ensures content is
   always vertically centered regardless of density or cell content. */
.ag-ltr .ag-cell {
  display: inline-flex;
  align-items: center;
}
```

**Why this isn't in the theme:** The Salt AG Grid theme deliberately avoids overriding AG Grid's `display` model to minimize side effects with AG Grid's internal layout (pinned columns, cell editing, animations). This override is safe for standard use and recommended for all projects.

## Migration notes

- If upgrading from a project that used `@salt-ds/data-grid`'s `Grid` component, replace it entirely with `AgGridReact` from `ag-grid-react` and the Salt AG Grid theme CSS classes

## Numeric column alignment

Columns containing numerical values **must** use `type: "numericColumn"` in their `ColDef`. This applies AG Grid's built-in right-alignment to both the cell content and the header. Never leave numeric data left-aligned — right-alignment is required for scannability and decimal alignment.

```ts
{ field: "amount", headerName: "Amount", type: "numericColumn" }
```

## Row and cell sizing

- **Row height** is `calc(var(--salt-size-base) + var(--salt-spacing-100))` — this adapts to the density context
- **Header height** uses the same formula
- **Cell padding** is `var(--salt-spacing-100)` horizontal
- **Cell line-height** is `calc(var(--ag-line-height) - 1px)` — see "Known issues" below

## Row selection with checkboxes

To add a checkbox selection column, define a dedicated `ColDef` pinned to the left with a density-aware width.

### Checkbox sizing per density
The Salt theme renders AG Grid checkboxes at `--salt-size-selectable` with `--salt-spacing-100` cell padding on each side. The correct column width is `selectable + 2 × spacing`:

| Density | `--salt-size-selectable` | `--salt-spacing-100` | Column width |
|---|---|---|---|
| High | 12px | 4px | **20px** |
| Medium | 14px | 8px | **30px** |
| Low | 16px | 12px | **40px** |
| Touch | 18px | 16px | **50px** |

Never leave the column at AG Grid's default width (~200px). Use a density lookup to set `width` and `maxWidth`:
```ts
const checkboxColumnWidths: Record<string, number> = {
  high: 20,
  medium: 30,
  low: 40,
  touch: 50,
};
```

### Recommended ColDef pattern
```ts
// checkboxWidth comes from the density lookup above
{
  checkboxSelection: true,
  headerCheckboxSelection: true,  // select-all in header
  width: checkboxWidth,
  maxWidth: checkboxWidth,
  suppressMenu: true,
  lockPosition: "left",           // always first column
  resizable: false,
  sortable: false,
  headerName: "",                 // no header label
}
```

Also set `rowSelection="multiple"` on `<AgGridReact>` to enable multi-select.

### Token reference
| Token | Role | Default value |
|---|---|---|
| `--salt-size-selectable` | Checkbox rendered size | 12–18px (varies by density) |
| `--ag-checkbox-checked-color` | Checked fill | `--salt-selectable-foreground-selected` |
| `--ag-checkbox-unchecked-color` | Unchecked border | `--salt-selectable-borderColor` |
| `--ag-checkbox-indeterminate-color` | Indeterminate fill | `--salt-selectable-foreground` |
| `--ag-checkbox-border-radius` | Corner radius | `0` (square) |

## Row validation

Apply row-level validation via `rowClassRules` or `getRowClass`:
- `error-row` — red background
- `warning-row` — orange background
- `success-row` — green background

## Theme class selection

| Salt mode | Standard density | HD Compact |
|---|---|---|
| Light | `ag-theme-salt-light` | `ag-theme-salt-compact-light` |
| Dark | `ag-theme-salt-dark` | `ag-theme-salt-compact-dark` |

Use `useTheme()` from `@salt-ds/core` to read the current mode and apply the correct class dynamically.

### Variant classes (additive)
Combine one of these with the base theme class:
- `ag-theme-salt-variant-secondary` — secondary container background
- `ag-theme-salt-variant-tertiary` — tertiary container background
- `ag-theme-salt-variant-zebra` — alternating row colors

Example: `className="ag-theme-salt-light ag-theme-salt-variant-zebra"`

## Decision trees

### When to use this component vs alternatives
- Choose this component when you need the specific interactive or display patterns it provides
- Avoid if a simpler or more generic component would meet the requirements

### When to use each variant/state
- Default state: Use when no special status or condition applies
- Active/selected state: Use when highlighting user selection
- Disabled state: Use when an action is currently unavailable
- Error/warning state: Use to indicate a problem or caution

## Validation checklist
- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Keyboard navigation works as expected
- [ ] Visual states meet design system standards

## Primary references
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/@salt-ds/ag-grid-theme
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/theming/how-to-compose-a-theme.mdx
- https://github.com/jpmorganchase/salt-ds
- https://www.ag-grid.com/react-data-grid/
- https://storybook.saltdesignsystem.com/
## Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./ag-grid-theme.md`
- Required behavior and constraints can be satisfied using props/states documented in `./ag-grid-theme.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./ag-grid-theme.json` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./ag-grid-theme.json` |

### Validation
- [ ] Generated usage aligns with `./ag-grid-theme.md` "When to use"
- [ ] Generated usage avoids `./ag-grid-theme.md` "When not to use"
- [ ] Required props and value types match `./ag-grid-theme.json`
- [ ] Accessibility requirements from `./ag-grid-theme.json` are satisfied

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./ag-grid-theme.md`
- Required behavior and constraints can be satisfied using props/states documented in `./ag-grid-theme.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./ag-grid-theme.json` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./ag-grid-theme.json` |

### Validation
- [ ] Generated usage aligns with `./ag-grid-theme.md` "When to use"
- [ ] Generated usage avoids `./ag-grid-theme.md` "When not to use"
- [ ] Required props and value types match `./ag-grid-theme.json`
- [ ] Accessibility requirements from `./ag-grid-theme.json` are satisfied