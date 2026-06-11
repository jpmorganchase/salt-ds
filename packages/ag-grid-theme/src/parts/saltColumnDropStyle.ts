/**
 * Phase 0 skeleton for the Salt column-drop / pill style part (proposal §4.6.2).
 *
 * Sets the three `columnDropCell*` params declared on `CoreParams` to the
 * Salt `--salt-actionable-bold-*` tokens (matching the 2.x cleanup in §2.1).
 * The bespoke hover / active / `[aria-expanded="true"]` CSS that cascades
 * `--ag-*` properties for the pill states lands in Phase 1+; an empty CSS
 * placeholder is wired up now so the part shape mirrors §4.6.2.
 */
import { createPart } from "ag-grid-community";

export const saltColumnDropStyle = createPart({
  feature: "columnDropStyle",
  params: {
    columnDropCellBackgroundColor: "var(--salt-actionable-bold-background)",
    columnDropCellBorder: { color: "var(--salt-actionable-bold-borderColor)" },
    columnDropCellTextColor: "var(--salt-actionable-bold-foreground)",
  },
});

