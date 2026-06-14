import "./_setupV3";
/**
 * Phase 2 V3 spike — `RowValidation` story rendered against `saltTheme`.
 *
 * Exercises `rowClassRules` (declared in `validationRowClassRules`) which
 * adds `.error-row`, `.warning-row` or `.success-row` to flagged rows.
 * Visual coverage:
 *   - `saltCellStates` (Phase 1) ships the row-level adornments — error /
 *     warning / success rows get the corresponding `--ag-row-*` custom-
 *     property scope and the leading status-icon column.
 *   - row hover + selection on the flagged rows still works (CellStates
 *     adornments are cell-level overrides, not background swaps).
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → RowValidation`
 * (`packages/ag-grid-theme/src/examples/RowValidation.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import {
  validationRowClassRules,
  validationRowExampleColumns,
} from "../../src/dependencies/validationExampleColumns";
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

export const RowValidation = () => (
  <div style={V3_STORY_CONTAINER}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      rowData={validationExampleData}
      columnDefs={validationRowExampleColumns}
      rowClassRules={validationRowClassRules}
      rowSelection="multiple"
      onGridReady={fitColumnsOnReady}
    />
  </div>
);
