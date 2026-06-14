/**
 * Salt input style — owns the `inputStyle` feature slot and ships only the
 * bespoke filter / column-select / large-text editor CSS that 2.x carried
 * in `css/parts/ag-input.css`.
 *
 * Architecture (revising the proposal §4.5):
 *
 *   The original proposal had `saltInputStyle` use `feature: "inputStyle"`
 *   with no CSS payload — the typed `inputBorder` / `inputFocusBorder` /
 *   `inputFocusShadow` theme params would do the work. In practice those
 *   params are ONLY consumed by AG v3's built-in `inputStyleBase` /
 *   `inputStyleBordered` / `inputStyleUnderlined` parts' CSS, so without
 *   one of those base parts loaded they're dead weight.
 *
 *   We tried `inputStyleUnderlined` + a compose-over-default overlay (the
 *   same pattern as saltCheckboxStyle) but it draws a 1px border on EVERY
 *   ag-input — including floating filters, which 2.x leaves un-styled.
 *   The same issue applied to `inputStyleBase`.
 *
 *   So saltInputStyle keeps `feature: "inputStyle"` to FULLY REPLACE the
 *   AG default with the no-default Salt look (i.e. AG's generic inputs
 *   render with browser defaults; only the inputs my CSS explicitly
 *   targets get Salt styling, matching exactly what 2.x did).
 *
 *   The theme-level `inputBorder` / `inputFocusBorder` / `inputFocusShadow`
 *   params in saltTheme.ts remain set — they don't render anything via
 *   this part, but they keep the typed-param surface stable for any
 *   future part that does want to consume them.
 *
 * CSS scope (see `src/css/salt-input.css` for the source mapping):
 *
 *   - .ag-filter input  + .ag-column-select input  (Salt underlined look,
 *                                                   placeholder colour,
 *                                                   :focus outline)
 *   - .ag-popup-editor .ag-large-text textarea     (multiline editor)
 *   - .ag-autocomplete-list-popup                  (border reset for
 *                                                   focus-ring alignment)
 *
 * Floating filters, cell editors, and other ag-inputs NOT in those
 * scopes inherit AG v3's default no-`inputStyle` rendering (browser
 * default plus minimal AG layout) — same as 2.x.
 */
import { createPart } from "ag-grid-community";
import css from "../css/salt-input.css?inline";
import type { BorderValue, ColorValue } from "./_paramTypes";

/**
 * Subset of `InputStyleParams` that Salt opinionates on.
 *
 * Same pattern as `SaltTabStyleParams` in `saltTabStyle.ts`: passing the
 * full `InputStyleParams` to `createPart`'s generic forces a value for all
 * 27 input-style keys (inputBackgroundColor, inputBorder, … 23 more). Phase
 * 7 only customises the rich-select popup surface; the rest stays at AG v3
 * defaults (which Salt's bespoke CSS in salt-input.css overrides at the
 * selector level anyway).
 */
export interface SaltInputStyleParams {
  pickerListBackgroundColor: ColorValue;
  pickerListBorder: BorderValue;
}

export const saltInputStyle = createPart<SaltInputStyleParams>({
  feature: "inputStyle",
  css,
  // `pickerListBackgroundColor` + `pickerListBorder` feed AG v3's built-in
  // `.ag-virtual-list-viewport.ag-rich-select-list` rule; without them the
  // popup renders as a transparent ghost (legacy 2.x had bg + accent
  // border + Salt overlay shadow). Box-shadow override lives in
  // salt-input.css since AG ships no typed param for it. (Phase 7 finding.)
  params: {
    pickerListBackgroundColor: "var(--ag-background-color)",
    pickerListBorder: {
      width: "var(--salt-size-fixed-100)",
      style: "solid",
      color: "var(--ag-accent-color)",
    },
  },
});
