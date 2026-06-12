import "./_setupV3";
/**
 * Phase 1 V3 spike — `RowGroupPanel` story rendered against `saltTheme`.
 *
 * Exercises three things at once:
 *   1. `saltIconSet` (Phase 1) — the drag-handle, expand/collapse, menu,
 *      filter and sort icons all need the Salt icon font.
 *   2. `saltColumnDropStyle` (Phase 0 wired, hover/active CSS still TBD)
 *      — the "Capital" pill that appears in the drop panel uses the
 *      `columnDropCell*` params.
 *   3. The row-grouping rendering pipeline — group rows, expand chevrons,
 *      aggregation hooks. None of these have Salt-specific overrides yet,
 *      so they should fall back to the inherited Salt tokens (`--salt-*`)
 *      via the params block.
 *
 * Pairs with the legacy story `Ag Grid/Ag Grid Theme → RowGroupPanel`
 * (`packages/ag-grid-theme/src/examples/RowGroupPanel.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import dataGridExampleRowGroupPanel from "../../src/dependencies/dataGridExampleRowGroupPanel";

// AG Grid v33+ requires explicit module registration. Idempotent.
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const RowGroupPanel = () => (
  <div style={{ height: 400, width: 800 }}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      defaultColDef={{
        ...saltAgGridDefaults.defaultColDef,
        enableRowGroup: true,
      }}
      columnDefs={dataGridExampleRowGroupPanel}
      rowData={dataGridExampleData}
      rowGroupPanelShow="always"
    />
  </div>
);

