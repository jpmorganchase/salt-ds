/**
 * `@salt-ds/ag-grid-theme` v3 public API (proposal §4.2).
 *
 * Phase 0 spike: ships `saltTheme`, `createSaltTheme`, `saltAgGridDefaults`
 * and every part needed by the §4.3 composition. Header / row variants
 * beyond the "primary" defaults arrive in Phase 1+.
 */
export { saltTheme, createSaltTheme } from "./saltTheme";
export { saltAgGridDefaults } from "./saltAgGridDefaults";

// Parts — advanced; consumers can compose their own theme via createTheme().withPart(...)
export { saltIconSet } from "./parts/saltIconSet";
export { saltCheckboxStyle } from "./parts/saltCheckboxStyle";
export { saltInputStyle } from "./parts/saltInputStyle";
export { saltColumnDropStyle } from "./parts/saltColumnDropStyle";
export { saltButtonStyle } from "./parts/saltButtonStyle";
export { saltCompact } from "./parts/saltCompact";
export { saltTabStyle } from "./parts/saltTabStyle";
export { saltCellStates } from "./parts/saltCellStates";
export { saltFocusRing } from "./parts/saltFocusRing";
export { saltRangeSelectionAdjustments } from "./parts/saltRangeSelectionAdjustments";

// Header parts — mutually exclusive within the saltHeaderBackground / saltHeaderDivider feature groups
export { saltHeaderPrimary } from "./parts/header/saltHeaderPrimary";
export { saltHeaderDividerPrimary } from "./parts/header/saltHeaderDividerPrimary";
export { saltHeaderLayout } from "./parts/header/saltHeaderLayout";
export { saltHeaderSecondary } from "./parts/header/saltHeaderSecondary";
export { saltHeaderTertiary } from "./parts/header/saltHeaderTertiary";
export { saltHeaderDividerSecondary } from "./parts/header/saltHeaderDividerSecondary";
export { saltHeaderDividerTertiary } from "./parts/header/saltHeaderDividerTertiary";
export { saltHeaderDividerNone } from "./parts/header/saltHeaderDividerNone";

// Row variant parts (proposal §4.6) — saltRowVariant{Secondary,Tertiary} are
// mutually exclusive via `feature: "saltRowVariant"`; saltZebra is a toggle on
// its own `feature: "saltZebra"` key. Default ("Primary") needs no extra part.
export { saltRowVariantSecondary } from "./parts/variants/saltRowVariantSecondary";
export { saltRowVariantTertiary } from "./parts/variants/saltRowVariantTertiary";
export { saltZebra } from "./parts/variants/saltZebra";

