/**
 * Salt "compact" density tier — opt-in part that contracts row /
 * header / list-item heights to the legacy 2.x
 * `useAgGridHelpers({ compact: true, density: "high" })` rhythm.
 *
 * Effect:
 *   - `rowHeight`: `calc(--salt-size-base + 1px)`  (row content + 1px row border)
 *   - `headerHeight`: `var(--salt-size-base)`     (no border on header)
 *   - `listItemHeight`: `var(--salt-size-base)`
 *
 * At high density (`--salt-size-base = 20px`) this resolves to **21px rows
 * + 20px headers**, matching the legacy compact tier exactly.
 *
 * Because the rule is expressed in tokens (not hard-coded px), the part
 * works at any density:
 *   - high   → 21 / 20
 *   - medium → 29 / 28
 *   - low    → 37 / 36
 *   - touch  → 45 / 44
 *
 * Differs from the default `saltTheme` rhythm
 * (`calc(--salt-size-base + --salt-spacing-100 + 1px)`) by removing the
 * `--salt-spacing-100` row padding. The row border still applies (+1px on
 * `rowHeight`), so cell content lands on the same scale as the regular tier
 * just without the breathing room.
 *
 * **Usage** (same as any other Salt part):
 * ```ts
 * import { saltTheme, saltCompact } from "@salt-ds/ag-grid-theme";
 *
 * const compactTheme = saltTheme.withPart(saltCompact);
 * <AgGridReact theme={compactTheme} ... />
 * ```
 *
 * Pair with `<SaltProvider density="high">` for the legacy HD compact look.
 *
 * **History:** Originally proposed for deletion per §9 Decision 2
 * ("density flows from SaltProvider, no need for a separate compact tier")
 * but reinstated 2026-06-14 — the 2.x compact tier was used by enough
 * consumer products that "wrap your grid in `SaltProvider density='high'`
 * AND call `.withParams({ rowHeight: 21, headerHeight: 20 })`" was too much
 * boilerplate for a common case. A part is cleaner.
 *
 * No `feature` key — part composes additively, but the `params` it sets
 * override `saltTheme`'s defaults because AG v3 resolves params last-part-wins.
 */
import { createPart } from "ag-grid-community";

export const saltCompact = createPart({
  params: {
    // `+1px` mirrors the row-border bump in saltTheme (so the 1px
    // `--ag-row-border` doesn't eat into the cell content under
    // box-sizing: border-box). See saltTheme.ts `rowHeight` for the
    // full explanation.
    rowHeight: "calc(var(--salt-size-base) + 1px)",
    headerHeight: "var(--salt-size-base)",
    listItemHeight: "var(--salt-size-base)",
  },
});
