/**
 * Salt row variant "Tertiary" (proposal §4.6).
 *
 * 2.x equivalent: `.ag-theme-salt-variant-tertiary` modifier class
 * (`css/parts/ag-row.css` lines 7-11). Same shape as
 * `saltRowVariantSecondary`, just on Salt's "tertiary container" token.
 *
 * Mutually exclusive with `saltRowVariantSecondary` via the shared
 * `feature: "saltRowVariant"` key. See that file's comment for the layering
 * notes on `headerBackgroundColor`.
 */
import { createPart } from "ag-grid-community";

export const saltRowVariantTertiary = createPart({
  feature: "saltRowVariant",
  params: {
    backgroundColor: "var(--salt-container-tertiary-background)",
    headerBackgroundColor: "var(--salt-container-tertiary-background)",
    headerCellHoverBackgroundColor: "var(--salt-container-tertiary-background)",
  },
});

