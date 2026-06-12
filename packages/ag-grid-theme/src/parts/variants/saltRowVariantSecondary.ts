/**
 * Salt row variant "Secondary" (proposal §4.6).
 *
 * In 2.x this is the `.ag-theme-salt-variant-secondary` modifier class on
 * the grid wrapper (see `css/parts/ag-row.css` lines 1-5). It pushes the
 * cell + header backgrounds onto Salt's "secondary container" token.
 *
 * Token mapping:
 *   --ag-background-color                   ← --salt-container-secondary-background
 *   --ag-header-background-color            ← --salt-container-secondary-background
 *   --ag-header-cell-hover-background-color ← same as header bg (no hover delta)
 *
 * Note on layering: this part shares `feature: "saltRowVariant"` with
 * `saltRowVariantTertiary` (mutually exclusive). The `headerBackgroundColor`
 * declared here OVERRIDES whatever `saltHeaderPrimary/Secondary/Tertiary`
 * sets, matching the 2.x behaviour where the variant class on the wrapper
 * also clobbered the header bg via `--ag-header-background-color`. Consumers
 * composing `saltTheme.withPart(saltRowVariantSecondary)` get the right
 * paired look without needing to also swap the header part.
 *
 * 2.x also set `--ag-secondary-border-color: var(--salt-separable-tertiary-borderColor)`
 * inside the variant class. v33 removed `--ag-secondary-border-color` with no
 * direct replacement (proposal §3.5); the equivalent styling lands in Phase 2
 * via `saltCellStates` / `saltRangeSelectionAdjustments`.
 */
import { createPart } from "ag-grid-community";

export const saltRowVariantSecondary = createPart({
  feature: "saltRowVariant",
  params: {
    backgroundColor: "var(--salt-container-secondary-background)",
    headerBackgroundColor: "var(--salt-container-secondary-background)",
    headerCellHoverBackgroundColor: "var(--salt-container-secondary-background)",
  },
});

