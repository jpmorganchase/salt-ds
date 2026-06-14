import "./_setupV3";
/**
 * Phase 2 V3 spike — `WrappedHeader` story rendered against `saltTheme`.
 *
 * Exercises `wrapHeaderText: true` + `autoHeaderHeight: true` so long
 * header labels wrap and the header row grows. Visual coverage:
 *   - `headerHeight` from saltTheme acts as a minimum — wrapped headers
 *     grow past the base calc.
 *   - status bar still pinned to bottom; selection on first three rows is
 *     pre-set in `onFirstDataRendered` for snapshot stability.
 *
 * Differences from the legacy story:
 *   - The legacy `<Checkbox>` toggle for `useAgGridHelpers({ compact: true })`
 *     is removed — v3 drops the compact tier (proposal §9 decision 2). Use
 *     Storybook's density toolbar to verify the contracted header rhythm.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → WrappedHeader`
 * (`packages/ag-grid-theme/src/examples/WrappedHeader.tsx`).
 */
import { StackLayout } from "@salt-ds/core";
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleColumnsWrap from "../../src/dependencies/dataGridExampleColumnsWrap";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const statusBar = {
  statusPanels: [
    { statusPanel: "agTotalRowCountComponent", align: "left" },
    { statusPanel: "agFilteredRowCountComponent" },
    { statusPanel: "agSelectedRowCountComponent" },
    { statusPanel: "agAggregationComponent" },
  ],
};

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const WrappedHeader = () => (
  <StackLayout gap={4}>
    <div style={V3_STORY_CONTAINER}>
      <AgGridReact
        theme={saltTheme}
        {...saltAgGridDefaults}
        columnDefs={dataGridExampleColumnsWrap}
        rowData={dataGridExampleData}
        statusBar={statusBar}
        rowSelection="multiple"
        defaultColDef={{
          ...saltAgGridDefaults.defaultColDef,
          autoHeaderHeight: true,
          wrapHeaderText: true,
        }}
        onGridReady={fitColumnsOnReady}
      />
    </div>
  </StackLayout>
);
