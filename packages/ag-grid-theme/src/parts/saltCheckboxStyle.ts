/**
 * Salt checkbox style overlay — composes ON TOP of AG Grid's
 * `checkboxStyleDefault` (added separately in saltTheme.ts), adding the
 * Salt sizing rule and recolouring the checkbox states to use Salt
 * `--salt-selectable-*` tokens.
 *
 * Architecture decision (Phase 1, revising the proposal §4.5):
 *
 *   The original proposal had `saltCheckboxStyle` use `feature:
 *   "checkboxStyle"` to fully REPLACE AG's default. In practice that
 *   means the default's checkbox-shape CSS rules and SVG shape images
 *   for the check mark / dash get dropped — we'd have to ship our own
 *   full set, which is ~100 lines of CSS we don't need to maintain.
 *
 *   So this part has NO `feature` — it composes additively. Consumers
 *   get `checkboxStyleDefault.css` (rendering) + Salt sizing CSS (this
 *   file) and the Salt colour params override AG's defaults via theme-
 *   level param merging (later parts win conflicts).
 *
 * Token mapping (verbatim from `ag-root-var.css` lines 10-13 +
 * `ag-checkbox.css`):
 *
 *   --ag-checkbox-border-radius: 0
 *     → checkboxBorderRadius: 0 (square corners, like Salt Checkbox)
 *
 *   --ag-checkbox-checked-color: var(--salt-selectable-foreground-selected)
 *     → checkboxCheckedBackgroundColor + checkboxCheckedBorderColor
 *       (in 2.x this was ONE colour because the checkbox is a font glyph;
 *       v3 splits them — we set both to the same Salt token for parity)
 *
 *   --ag-checkbox-indeterminate-color: var(--salt-selectable-foreground)
 *     → checkboxIndeterminateBackgroundColor + checkboxIndeterminateBorderColor
 *
 *   --ag-checkbox-unchecked-color: var(--salt-selectable-borderColor)
 *     → checkboxUncheckedBorderColor
 *
 *   `--salt-size-selectable` (16px / 12px in compact) sizes the wrapper.
 *   v3's `CheckboxStyleParams` has no `checkboxSize` typed param, so this
 *   stays as raw CSS — same pattern as saltColumnDropStyle / saltTabStyle.
 *
 * The check-mark/dash colour uses `--salt-container-primary-background`
 * (= white in light mode) so the glyph contrasts with the dark
 * background of a checked/indeterminate checkbox.
 */
import { createPart } from "ag-grid-community";

export const saltCheckboxStyle = createPart({
  // NO `feature` — composes with `checkboxStyleDefault` instead of replacing it.
  css: `
    .ag-checkbox-input-wrapper {
      height: var(--salt-size-selectable);
      width: var(--salt-size-selectable);
      font-size: var(--salt-size-selectable);
      line-height: var(--salt-size-selectable);
    }
  `,
  params: {
    checkboxBorderRadius: 0,
    checkboxCheckedBackgroundColor:
      "var(--salt-selectable-foreground-selected)",
    checkboxCheckedBorderColor: "var(--salt-selectable-foreground-selected)",
    checkboxCheckedShapeColor: "var(--salt-container-primary-background)",
    checkboxIndeterminateBackgroundColor: "var(--salt-selectable-foreground)",
    checkboxIndeterminateBorderColor: "var(--salt-selectable-foreground)",
    checkboxIndeterminateShapeColor: "var(--salt-container-primary-background)",
    checkboxUncheckedBorderColor: "var(--salt-selectable-borderColor)",
  },
});
