/**
 * Salt column-drop / pill style part (proposal §4.6.2).
 *
 * Sets the `columnDropCell*` params declared on `CoreParams` to the Salt
 * `--salt-actionable-bold-*` tokens (matching the 2.x cleanup in §2.1)
 * and ships the bespoke cell-layout + hover/active cascade as a CSS
 * payload (see `src/css/salt-column-drop.css`).
 *
 * Phase 1 / 8.3 calibration to match the legacy `ag-column-drop-list.css`
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
 *     the `css` payload force square pill corners. AG Grid v3 bakes a
 *     hardcoded `border-radius: 500px` into the module-level
 *     `.ag-column-drop-cell` rule (it does NOT consume the
 *     `--ag-column-drop-cell-border-radius` variable), so setting the
 *     theme param alone is ineffective; we have to ship a CSS rule that
 *     re-reads the variable. The 2.x line renders `border-radius: 0`.
 *
 *   - **Phase 8.3 (2026-06-14):** the bespoke `:hover` / `:active` /
 *     `[aria-expanded]` cascade from `ag-column-drop-list.css` is now
 *     ported into `salt-column-drop.css` (was previously a TODO on this
 *     JSDoc). 2.x drove the cascade by cycling legacy AG v32 variables
 *     (`--ag-chip-background-color` etc.) which AG v3 doesn't consume —
 *     so the port sets `background` + `color` directly on the pill, with
 *     icons inheriting via `iconColor: "inherit"` from saltTheme.
 */
import { createPart } from "ag-grid-community";
import css from "../css/salt-column-drop.css?inline";

export const saltColumnDropStyle = createPart({
  feature: "columnDropStyle",
  css,
  params: {
    columnDropCellBackgroundColor: "var(--salt-actionable-bold-background)",
    columnDropCellBorder: { color: "var(--salt-actionable-bold-borderColor)" },
    columnDropCellBorderRadius: 0,
  },
});
