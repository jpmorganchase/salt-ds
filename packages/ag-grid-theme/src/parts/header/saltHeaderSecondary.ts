/**
 * Salt header "Secondary" — swap-in for `saltHeaderPrimary` (proposal §4.6.1).
 *
 * Token mapping (verbatim from `css/parts/ag-header-variants.css` lines 5-8):
 *   --ag-header-background-color            ← --salt-container-secondary-background
 *   --ag-header-cell-hover-background-color ← same as background (no hover delta)
 *
 * `headerTextColor` is intentionally NOT overridden — the 2.x line keeps the
 * same text colour across all three background variants (driven only by
 * `--ag-header-foreground-color` set in `ag-root-var.css:28`). The
 * `saltHeaderPrimary` part defines it; AG Grid's part-merge keeps the value
 * because parts in the `saltHeaderBackground` group are mutually exclusive
 * but `headerTextColor` set in the *theme-level* withParams (or any other
 * non-saltHeaderBackground part) survives. Since we declare it on the Primary
 * part, swapping to Secondary leaves `headerTextColor` undefined here and
 * the rendering falls back to the inherited `--ag-foreground-color`.
 *
 * TODO if/when this drifts visually: lift `headerTextColor` from the three
 * Primary/Secondary/Tertiary parts into `saltTheme.withParams({...})` so the
 * value persists across swaps.
 */
import { createPart } from "ag-grid-community";

export const saltHeaderSecondary = createPart({
  feature: "saltHeaderBackground",
  params: {
    headerBackgroundColor: "var(--salt-container-secondary-background)",
    headerCellHoverBackgroundColor: "var(--salt-container-secondary-background)",
    headerTextColor: "var(--salt-content-secondary-foreground)",
  },
});

