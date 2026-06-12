/**
 * Salt column-drop / pill style part (proposal §4.6.2).
 *
 * Sets the `columnDropCell*` params declared on `CoreParams` to the Salt
 * `--salt-actionable-bold-*` tokens (matching the 2.x cleanup in §2.1).
 *
 * Phase 1 calibration to match the legacy `ag-column-drop-list.css`
 * rendering exactly:
 *
 *   - `columnDropCellTextColor` is intentionally NOT overridden. The 2.x
 *     line only sets the text colour on `:hover` / `:active` /
 *     `[aria-expanded="true"]` (via `--salt-actionable-bold-foreground-{hover,active}`).
 *     The default state inherits from `--ag-foreground-color`, which is
 *     what `var(--salt-content-primary-foreground)` resolves to in the
 *     theme. Setting it explicitly to `--salt-actionable-bold-foreground`
 *     (white) would render white-on-grey pills — defensible per Salt's
 *     `Pill` design tokens, but breaks pixel parity with the 2.x rendering.
 *
 *   - `columnDropCellBorderRadius: 0` + the `border-radius` override in
 *     the `css` payload below force square pill corners. AG Grid v3 bakes
 *     a hardcoded `border-radius: 500px` into the module-level
 *     `.ag-column-drop-cell` rule (it does NOT consume the
 *     `--ag-column-drop-cell-border-radius` variable), so setting the
 *     theme param alone is ineffective; we have to ship a CSS rule that
 *     re-reads the variable. The 2.x line renders `border-radius: 0`.
 *
 * Phase 1+ TODO: port the bespoke `:hover` / `:active` / `[aria-expanded]`
 * cascade from `ag-column-drop-list.css` into this part's `css` payload to
 * recover the hover/active text-colour deltas.
 */
import { createPart } from "ag-grid-community";

export const saltColumnDropStyle = createPart({
  feature: "columnDropStyle",
  css: ".ag-column-drop-cell { border-radius: var(--ag-column-drop-cell-border-radius, 0); padding: 0 var(--salt-spacing-50); }",
  params: {
    columnDropCellBackgroundColor: "var(--salt-actionable-bold-background)",
    columnDropCellBorder: { color: "var(--salt-actionable-bold-borderColor)" },
    columnDropCellBorderRadius: 0,
  },
});

