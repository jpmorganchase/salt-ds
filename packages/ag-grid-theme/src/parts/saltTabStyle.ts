/**
 * Salt tab-style part (proposal §4.6.3, decision 2026-06-11).
 *
 * Owns the typed `tab*` params (declared on `TabStyleParams`, NOT in
 * `CoreParams`) plus the small amount of bespoke tab layout CSS that
 * 2.x carried in `ag-menus.css` (`.ag-tabs` padding and `.ag-tab`
 * sizing). Mutually exclusive with built-in `tabStyleQuartz` /
 * `tabStyleMaterial` / `tabStyleAlpine` / `tabStyleRolodex` /
 * `tabStyleBase` via the shared `feature: "tabStyle"` key.
 *
 * Phase 8.6 broadening (2026-06-14): the original Phase 1 narrow shape
 * (only `tabSelectedUnderline{Color,Width}`) was extended to cover every
 * `--ag-tab-*` variable that Salt opinionates on. Previously these lived
 * as raw CSS-variable settings on `.ag-root-wrapper` in `salt-tab.css`;
 * they now flow through AG Grid v3's typed-params API, matching the
 * pattern of the existing `sideButton*` typed-param overrides in
 * `saltTheme.ts`. The CSS file is now layout-only.
 *
 * Consumers swap the look with:
 *   saltTheme.withPart(tabStyleQuartz)
 */
import { createPart } from "ag-grid-community";
import css from "../css/salt-tab.css?inline";
import type {
  BorderValue,
  ColorValue,
  DurationValue,
  LengthValue,
} from "./_paramTypes";
/**
 * Subset of `TabStyleParams` that Salt's tab style opinionates on.
 *
 * `createPart`'s generic argument is the strict shape of `params` — using
 * the full `TabStyleParams` would force us to declare values for the
 * three additional params Salt has no opinion on (`tabSpacing`,
 * `tabTextColor`, `tabTopPadding`). Keeping the narrow type lets AG fall
 * back to its built-in defaults for those.
 */
export interface SaltTabStyleParams {
  // Tab bar (the strip holding the tab buttons)
  tabBarBackgroundColor: ColorValue;
  tabBarBorder: BorderValue;
  tabBarHorizontalPadding: LengthValue;
  tabBarTopPadding: LengthValue;
  // Tab body padding (within each tab)
  tabHorizontalPadding: LengthValue;
  tabBottomPadding: LengthValue;
  // Default tab
  tabBackgroundColor: ColorValue;
  // Hover state
  tabHoverBackgroundColor: ColorValue;
  tabHoverTextColor: ColorValue;
  // Selected state — colours
  tabSelectedBackgroundColor: ColorValue;
  tabSelectedTextColor: ColorValue;
  tabSelectedBorderColor: ColorValue;
  tabSelectedBorderWidth: LengthValue;
  // Selected state — underline indicator
  tabSelectedUnderlineColor: ColorValue;
  tabSelectedUnderlineWidth: LengthValue;
  tabSelectedUnderlineTransitionDuration: DurationValue;
}
export const saltTabStyle = createPart<SaltTabStyleParams>({
  feature: "tabStyle",
  css,
  params: {
    // Tab bar (the strip holding the tab buttons)
    tabBarBackgroundColor: "var(--salt-container-primary-background)",
    tabBarBorder: {
      width: "var(--salt-size-fixed-100)",
      color: "var(--salt-separable-tertiary-borderColor)",
    },
    tabBarHorizontalPadding: "0",
    tabBarTopPadding: "0",
    // Tab body padding
    tabHorizontalPadding: "var(--salt-spacing-100)",
    tabBottomPadding: "0",
    // Default tab — transparent (inherits Salt secondary fg from parent)
    tabBackgroundColor: "transparent",
    // Hover state
    tabHoverBackgroundColor: "var(--salt-actionable-subtle-background-hover)",
    tabHoverTextColor: "var(--salt-actionable-subtle-foreground-hover)",
    // Selected state — colours. actionable-subtle has no `-selected`
    // token variant; the bare `--salt-actionable-subtle-background`
    // (transparent) is used to keep the selected tab visually flush
    // with the bar — the underline indicator below is the sole
    // selected-state affordance.
    tabSelectedBackgroundColor: "var(--salt-actionable-subtle-background)",
    tabSelectedTextColor: "var(--salt-content-primary-foreground)",
    tabSelectedBorderColor: "transparent",
    tabSelectedBorderWidth: "0",
    // Selected state — underline indicator (the visible affordance)
    tabSelectedUnderlineColor: "var(--salt-navigable-accent-indicator-active)",
    tabSelectedUnderlineWidth: "var(--salt-size-indicator)",
    // Disable transition so screenshot tests don't catch mid-animation
    tabSelectedUnderlineTransitionDuration: "0s",
  },
});
