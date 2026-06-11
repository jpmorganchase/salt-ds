/**
 * Salt tab-style part (proposal §4.6.3, decision 2026-06-11).
 *
 * Owns the two `tabSelected*` typed params (declared on `TabStyleParams`,
 * NOT in `CoreParams`) plus the small amount of bespoke tab layout CSS
 * that 2.x carried in `ag-menus.css` (`.ag-tabs` padding and `.ag-tab`
 * sizing). Mutually exclusive with built-in `tabStyleQuartz` /
 * `tabStyleMaterial` / `tabStyleAlpine` / `tabStyleRolodex` / `tabStyleBase`
 * via the shared `feature: "tabStyle"` key.
 *
 * Consumers swap the look with:
 *   saltTheme.withPart(tabStyleQuartz)
 */
import { createPart } from "ag-grid-community";
import css from "../css/salt-tab.css?inline";
import type { ColorValue, LengthValue } from "./_paramTypes";

/**
 * Subset of `TabStyleParams` that Salt's tab style actually opinionates on.
 *
 * `createPart`'s generic argument is the strict shape of `params` — passing
 * the full `TabStyleParams` would force us to declare values for all 19
 * tab-style params (background, hover, selected, spacing, etc.) in this
 * phase. Salt's 2.x tab footprint only customises the selected-underline,
 * so we declare a narrow type here. Phase 1+ can broaden this if/when
 * we opinion-ate on more tab params.
 */
export interface SaltTabStyleParams {
  tabSelectedUnderlineColor: ColorValue;
  tabSelectedUnderlineWidth: LengthValue;
}

export const saltTabStyle = createPart<SaltTabStyleParams>({
  feature: "tabStyle",
  css,
  params: {
    tabSelectedUnderlineColor: "var(--salt-navigable-accent-indicator-active)",
    tabSelectedUnderlineWidth: "var(--salt-size-indicator)",
  },
});
