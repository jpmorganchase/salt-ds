/**
 * Salt header "Primary" — the default header background variant (proposal §4.6.1).
 *
 * In 2.x this corresponds to the un-modifier-classed header look (i.e. when
 * neither `.ag-theme-salt-header-secondary` nor `.ag-theme-salt-header-tertiary`
 * is present). The other two variants (`saltHeaderSecondary`,
 * `saltHeaderTertiary`) come in Phase 1+ and share the
 * `feature: "saltHeaderBackground"` key so they're mutually exclusive with
 * each other but compose freely with the divider parts.
 *
 * Token mapping (verbatim from `css/parts/ag-root-var.css` lines 21-28):
 *   --ag-header-background-color            ← --salt-container-primary-background
 *   --ag-header-cell-hover-background-color ← same as background (no hover delta)
 *   --ag-header-foreground-color            ← --salt-content-secondary-foreground
 *
 * The `headerCellHoverBackgroundColor` / `headerTextColor` defaults that the
 * §4.3 example notes as "set by the header parts above" are declared here.
 */
import { createPart } from "ag-grid-community";

export const saltHeaderPrimary = createPart({
  feature: "saltHeaderBackground",
  params: {
    headerBackgroundColor: "var(--salt-container-primary-background)",
    headerCellHoverBackgroundColor: "var(--salt-container-primary-background)",
    headerTextColor: "var(--salt-content-secondary-foreground)",
  },
});

