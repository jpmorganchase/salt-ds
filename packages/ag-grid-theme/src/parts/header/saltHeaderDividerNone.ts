/**
 * Salt header divider "None" — removes the header-row divider entirely
 * (proposal §4.6.1).
 *
 * Token mapping (verbatim from `css/parts/ag-header-variants.css` lines 32-35):
 *   border-bottom-color on .ag-header  ← transparent
 *
 * In v3, setting `headerRowBorder: false` removes the border declaration;
 * setting it to `{ width: 0 }` keeps the rule with zero width. The 2.x line
 * keeps a 1px transparent border so layout is preserved (the .ag-header
 * still occupies its `border-bottom: 1px solid transparent` slot). Using
 * `{ width: 0 }` is the closest v3 equivalent.
 */
import { createPart } from "ag-grid-community";

export const saltHeaderDividerNone = createPart({
  feature: "saltHeaderDivider",
  params: {
    headerRowBorder: { width: 0 },
  },
});

