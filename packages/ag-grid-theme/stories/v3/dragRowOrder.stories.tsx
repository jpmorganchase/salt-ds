import "./_setupV3";
/**
 * Phase 2 V3 spike — `DragRowOrder` story rendered against `saltTheme`.
 *
 * Exercises `rowDragManaged` + `animateRows`:
 *   - the drag-handle icon (column-defined via `rowDrag: true`) uses the
 *     `saltIconSet` "grip" glyph.
 *   - the drop-target row highlight pulls from `selectedRowBackgroundColor`.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → DragRowOrder`
 * (`packages/ag-grid-theme/src/examples/DragRowOrder.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import rowDragColumns from "../../src/dependencies/rowDragColumns";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const DragRowOrder = () => (
  <div style={{ height: 500, width: 800 }}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      animateRows
      rowDragManaged
      columnDefs={rowDragColumns}
      rowData={dataGridExampleData}
    />
  </div>
);

