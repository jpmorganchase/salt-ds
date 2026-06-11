/**
 * Phase 0 skeleton for the Salt checkbox style part.
 *
 * The full `--ag-checkbox-*` mapping (see `MIGRATION_PROPOSAL.md` §5) plus
 * the Salt-specific selectors land in Phase 1+. For now this part just
 * occupies the `checkboxStyle` feature slot so no built-in checkbox style
 * leaks in (proposal §3.5).
 */
import { createPart } from "ag-grid-community";

export const saltCheckboxStyle = createPart({
  feature: "checkboxStyle",
});

