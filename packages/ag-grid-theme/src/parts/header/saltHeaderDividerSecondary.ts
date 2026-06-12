/**
 * Salt header divider "Secondary" — swap-in for `saltHeaderDividerPrimary`
 * (proposal §4.6.1).
 *
 * Token mapping (verbatim from `css/parts/ag-header-variants.css` lines 22-25):
 *   border-bottom-color on .ag-header  ← --salt-separable-secondary-borderColor
 *
 * In v3 this becomes the `headerRowBorder` composite. Width matches the 1px
 * fixed Salt size token (consistent with `saltHeaderDividerPrimary`).
 */
import { createPart } from "ag-grid-community";

export const saltHeaderDividerSecondary = createPart({
  feature: "saltHeaderDivider",
  params: {
    headerRowBorder: {
      width: 1,
      color: "var(--salt-separable-secondary-borderColor)",
    },
  },
});

