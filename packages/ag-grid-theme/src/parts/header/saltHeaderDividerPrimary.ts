/**
 * Salt header divider "Primary" — the default header-row divider (proposal §4.6.1).
 *
 * The 2.x `.ag-theme-salt-header-divider-{primary,secondary,tertiary,none}`
 * modifier classes become four parts that all share
 * `feature: "saltHeaderDivider"` (mutually exclusive within the group; the
 * `None` variant ships in Phase 1+ to remove the divider entirely).
 */
import { createPart } from "ag-grid-community";

export const saltHeaderDividerPrimary = createPart({
  feature: "saltHeaderDivider",
  params: {
    headerRowBorder: {
      width: 1,
      color: "var(--salt-separable-primary-borderColor)",
    },
  },
});

