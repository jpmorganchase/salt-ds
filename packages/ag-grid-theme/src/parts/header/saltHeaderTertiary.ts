/**
 * Salt header "Tertiary" — swap-in for `saltHeaderPrimary` (proposal §4.6.1).
 *
 * Token mapping (verbatim from `css/parts/ag-header-variants.css` lines 10-13):
 *   --ag-header-background-color            ← --salt-container-tertiary-background
 *   --ag-header-cell-hover-background-color ← same as background (no hover delta)
 *
 * `headerTextColor` is included to keep the Salt grey across all variant
 * swaps (see saltHeaderSecondary's note on the same topic).
 */
import { createPart } from "ag-grid-community";

export const saltHeaderTertiary = createPart({
  feature: "saltHeaderBackground",
  params: {
    headerBackgroundColor: "var(--salt-container-tertiary-background)",
    headerCellHoverBackgroundColor: "var(--salt-container-tertiary-background)",
    headerTextColor: "var(--salt-content-secondary-foreground)",
  },
});

