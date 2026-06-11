/**
 * Phase 0 skeleton for the Salt input style part.
 *
 * Holds the `inputStyle` feature slot so that the typed `inputBorder`,
 * `inputFocusBorder` and `inputFocusShadow` params declared on
 * `InputStyleParams` are merged into the theme's typed param set.
 * The actual values for those params are set in `saltTheme.ts` via
 * `withParams({...})` (per the §4.3 example).
 */
import { createPart } from "ag-grid-community";
import type { InputStyleParams } from "ag-grid-community";

export const saltInputStyle = createPart<InputStyleParams>({
  feature: "inputStyle",
});

