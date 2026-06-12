/**
 * Salt cell-state classes — application-level helpers for cell/row status:
 *
 *   - `.numeric-cell`                     right-aligns text + adornment
 *   - `.editable-cell` / `.editable-numeric-cell`
 *                                         draws the Salt editable outline
 *   - `.error-cell` / `.warning-cell` /
 *     `.success-cell` (compose with `.editable-cell`)
 *                                         status background + adornment glyph
 *   - `.error-row` / `.warning-row` /
 *     `.success-row` (via `getRowClass`)  status row background + selected /
 *                                         hover overrides
 *
 * Phase 1 ports the focused subset of `css/parts/ag-body.css` lines 283-300
 * (numeric), 83-93 (editable outline), 95-281 (status + adornments) and the
 * `.{error,warning,success}-row` blocks from `ag-row.css`. The 2.x line
 * scoped every rule to `.ag-theme-salt-{light,dark,compact-light,compact-dark}`;
 * in v3 the rules are unscoped because AG Grid auto-wraps the part's CSS
 * inside `:where(.ag-theme-part-N)` (the part is only emitted when added
 * to a theme).
 *
 * Phase 2+ additions:
 *   - .ag-cell-focus / .ag-cell-range-* outlines             → saltFocusRing
 *   - Cross-cell range outlines                               → saltRangeSelectionAdjustments
 *   - .ag-cell-inline-editing styling + cell-editor pickers   → saltInputStyle compose
 *
 * No params and no `feature` — saltCellStates is a pure CSS overlay that
 * consumers can opt out of with `withoutPart(saltCellStates)`.
 */
import { createPart } from "ag-grid-community";
import css from "../css/salt-cell-states.css?inline";

export const saltCellStates = createPart({ css });

