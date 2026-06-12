import "./_setupV3";
/**
 * Phase 2 V3 spike — `ColumnSpanning` story rendered against `saltTheme`.
 *
 * Exercises `colSpan` (declared in `columnSpanningExampleColumns`) — when
 * a cell spans multiple columns the rendered cell still needs to obey the
 * Salt header/cell border tokens. Visual coverage:
 *   - header cells render with `saltHeaderPrimary` + divider
 *   - the spanned `Name` cell renders without an internal column border —
 *     `columnBorder: false` in `saltTheme` keeps the join invisible.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → ColumnSpanning`
 * (`packages/ag-grid-theme/src/examples/ColumnSpanning.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import columnSpanningExampleColumns from "../../src/dependencies/columnSpanningExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const ColumnSpanning = () => (
  <div style={{ height: 500, width: 800 }}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      columnDefs={columnSpanningExampleColumns}
      rowData={dataGridExampleData}
    />
  </div>
);

