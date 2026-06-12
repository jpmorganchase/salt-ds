/**
 * Salt focus-ring part — unified keyboard focus appearance across the grid.
 *
 * Phase 2 (entry: cell + header focus + editable corner adornment). Ports
 * the focus-related rules from `ag-body.css` (309-358) and `ag-header.css`
 * (29-44, 67-76, 165-170) into a single CSS payload. See
 * `src/css/salt-focus-ring.css` for the full source mapping.
 *
 * Phase 2+ additions (intentionally left for sibling parts):
 *   - .ag-cell-range-{top,right,bottom,left}::after cross-cell outlines
 *                                                  → saltRangeSelectionAdjustments
 *   - .ag-row-selected background + ::before bar    → saltRangeSelectionAdjustments
 *   - Filter / column-select input focus shadows    → saltInputStyle compose
 *
 * No params, no `feature` — pure additive CSS overlay. Consumers can opt
 * out with `withoutPart(saltFocusRing)` to fall back to AG's defaults.
 */
import { createPart } from "ag-grid-community";
import css from "../css/salt-focus-ring.css?inline";

export const saltFocusRing = createPart({ css });

