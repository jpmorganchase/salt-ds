/**
 * Phase 0 skeleton for Salt range-selection adjustments (proposal §4.4).
 *
 * Owns the cross-cell outline, fill-handle, selected-row border cleanup and
 * a few other rules that don't have a direct AG Grid theming parameter
 * (see §5 mapping rows tagged "**Removed** — handled in
 * `saltRangeSelectionAdjustments` CSS"). The CSS moves here in Phase 1+.
 */
import { createPart } from "ag-grid-community";

export const saltRangeSelectionAdjustments = createPart({});

