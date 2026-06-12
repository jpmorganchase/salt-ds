import "./_setupV3";
/**
 * Phase 2 V3 spike — `RowGrouping` story rendered against `saltTheme`.
 *
 * Exercises AG's `rowGroup` column-def flag (set in
 * `dataGridExampleRowGrouping`) with `autoGroupColumnDef.field="name"` and
 * `groupDefaultExpanded={-1}`. Visual coverage:
 *   - the leading auto-group column shows expand/collapse chevrons from
 *     `saltIconSet`
 *   - group rows pick up the same row hover / selection tokens as flat rows
 *   - the legacy story called `useAgGridHelpers({ compact: true })` to
 *     contract the layout; in v3 we drop that branch (proposal §9 decision 2)
 *     — wrap in `SaltProvider density="high"` for the same visual rhythm.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → RowGrouping`
 * (`packages/ag-grid-theme/src/examples/RowGrouping.tsx`).
 */
import { SaltProvider, SaltProviderNext, useTheme } from "@salt-ds/core";
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import dataGridExampleRowGrouping from "../../src/dependencies/dataGridExampleRowGrouping";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const RowGrouping = () => {
  const { themeNext } = useTheme();
  const Provider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <Provider density="high">
      <div style={{ height: 500, width: 800 }}>
        <AgGridReact
          theme={saltTheme}
          {...saltAgGridDefaults}
          columnDefs={dataGridExampleRowGrouping}
          rowData={dataGridExampleData}
          // Make sure all groups expanded by default
          groupDefaultExpanded={-1}
          // Show value in group leaf node
          autoGroupColumnDef={{ field: "name" }}
        />
      </div>
    </Provider>
  );
};

