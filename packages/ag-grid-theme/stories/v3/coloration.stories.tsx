import "./_setupV3";
/**
 * Phase 1 V3 spike — `Coloration` story rendered against `saltTheme`.
 *
 * Exercises `saltCellStates` (Phase 1 wiring lands in the same commit as
 * this story):
 *   - the Population column carries `cellClass: ["editable-cell", "numeric-cell"]`
 *     so we see the editable outline + right-aligned text in V3
 *   - inline `cellStyle` overrides still work (those are AG Grid plumbing,
 *     unrelated to saltTheme — just confirming nothing's broken)
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → Coloration`
 * (`packages/ag-grid-theme/src/examples/Coloration.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleColumnsColoration from "../../src/dependencies/dataGridExampleColumnsColoration";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const Coloration = () => (
  <div style={{ height: 400, width: 800 }}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      columnDefs={dataGridExampleColumnsColoration}
      rowData={dataGridExampleData}
    />
  </div>
);

