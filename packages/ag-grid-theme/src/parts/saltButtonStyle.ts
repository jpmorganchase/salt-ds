/**
 * Salt button (+ filter / status / paging / column-drop) layout part.
 *
 * Misleadingly named (mirrors the 2.x `css/parts/ag-buttons.css` file
 * which had the same identity-vs-content mismatch). The CSS payload
 * covers six concerns:
 *
 *   1. `.ag-standard-button` Salt-actionable-subtle look + accent
 *      "Apply Filter" variant
 *   2. `button[class^="ag-"]:focus` outline (overrides
 *      `buttonStyleQuartz`'s box-shadow focus ring)
 *   3. Filter menu layout (filter-body-wrapper, mini-filter, set-filter-item)
 *   4. Status bar
 *   5. Paging panel + floating-bottom borders
 *   6. Column drop horizontal container
 *
 * Composes additively over AG v3's auto-loaded `buttonStyleQuartz`
 * (which `createTheme()` adds automatically) — no `feature` key, same
 * pattern as `saltCheckboxStyle` over `checkboxStyleDefault`. AG's base
 * button rendering still ships (kept for the layout / sizing primitives),
 * but the Salt colour / border / focus rules win via cascading order.
 *
 * Consumers can opt out with `saltTheme.withoutPart(saltButtonStyle)` to
 * fall back to AG's defaults.
 *
 * Ported from `packages/ag-grid-theme/css/parts/ag-buttons.css` (2.x line)
 * minus the `.ag-keyboard-focus .ag-header-cell:focus::after { border: 0 }`
 * rule — already covered by `.ag-header-cell:focus-visible::after` in
 * `salt-focus-ring.css`. (Phase 8 port 2026-06-14.)
 */
import { createPart } from "ag-grid-community";
import css from "../css/salt-buttons.css?inline";

export const saltButtonStyle = createPart({ css });
