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
 * The `headerCellHoverBackgroundColor` / `headerTextColor` defaults that the
 * §4.3 example notes as "set by the header parts above" are declared here.
 */
import { createPart } from "ag-grid-community";

export const saltHeaderPrimary = createPart({
  feature: "saltHeaderBackground",
  params: {
    headerBackgroundColor: "var(--salt-container-secondary-background)",
    headerCellHoverBackgroundColor: "var(--salt-selectable-background-hover)",
    headerTextColor: "var(--salt-content-primary-foreground)",
  },
});

