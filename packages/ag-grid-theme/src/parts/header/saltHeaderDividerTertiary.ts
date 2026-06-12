/**
 * Salt header divider "Tertiary" — swap-in for `saltHeaderDividerPrimary`
 * (proposal §4.6.1).
 *
 * Token mapping (verbatim from `css/parts/ag-header-variants.css` lines 27-30):
 *   border-bottom-color on .ag-header  ← --salt-separable-tertiary-borderColor
 */
import { createPart } from "ag-grid-community";

export const saltHeaderDividerTertiary = createPart({
  feature: "saltHeaderDivider",
  params: {
    headerRowBorder: {
      width: 1,
      color: "var(--salt-separable-tertiary-borderColor)",
    },
  },
});

