import "./_setupV3";
/**
 * Phase 2 V3 spike — `FloatingFilter` story rendered against `saltTheme`.
 *
 * Exercises `defaultColDef.floatingFilter: true` across every column so the
 * inline filter row sits directly under the header row. Visual coverage:
 *   - filter inputs render with the Salt baseline reset from `saltInputStyle`
 *     (no AG default border / focus ring overrides)
 *   - the filter row's bottom border picks up `rowBorder` from saltTheme.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → FloatingFilter`
 * (`packages/ag-grid-theme/src/examples/FloatingFilter.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import customFilterExampleColumns from "../../src/dependencies/customFilterExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const FloatingFilter = () => (
  <div style={{ height: 500, width: 800 }}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      defaultColDef={{
        ...saltAgGridDefaults.defaultColDef,
        floatingFilter: true,
      }}
      columnDefs={customFilterExampleColumns}
      rowData={dataGridExampleData}
    />
  </div>
);

