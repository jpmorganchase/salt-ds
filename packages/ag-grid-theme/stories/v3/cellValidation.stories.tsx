import "./_setupV3";
/**
 * Phase 1 V3 spike — `CellValidation` story rendered against `saltTheme`.
 *
 * Exercises `saltCellStates` for the FULL status surface:
 *   - `.editable-cell` outline
 *   - `.error-cell` / `.warning-cell` / `.success-cell` (status bg + adornment glyph)
 *   - `.numeric-cell` (right alignment + adornment placement flipped to left side)
 *
 * Cell class assignment is driven by `cellClassRules` against
 * `row.data.status` (see `validationCellClassRules` in
 * `src/dependencies/validationExampleColumns.ts`).
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → CellValidation`
 * (`packages/ag-grid-theme/src/examples/CellValidation.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { validationCellExampleColumns } from "../../src/dependencies/validationExampleColumns";
import { validationExampleData } from "../../src/dependencies/validationExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const CellValidation = () => (
  <div style={V3_STORY_CONTAINER}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      columnDefs={validationCellExampleColumns}
      rowData={validationExampleData}
      onGridReady={fitColumnsOnReady}
    />
  </div>
);
