/**
 * Salt range-selection adjustments — ports the bespoke CSS for selected
 * rows, pinned-column dividers, and cross-cell range outlines.
 *
 * Phase 2 step S. Source mapping documented in `src/css/salt-range-selection.css`.
 *
 * No params, no `feature` — pure additive CSS overlay. Consumers can opt
 * out with `withoutPart(saltRangeSelectionAdjustments)`.
 */
import { createPart } from "ag-grid-community";
import css from "../css/salt-range-selection.css?inline";

export const saltRangeSelectionAdjustments = createPart({ css });
