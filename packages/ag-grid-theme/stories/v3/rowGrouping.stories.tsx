import "./_setupV3";
/**
 * Phase 2 V3 spike — `RowGrouping` story rendered against `saltTheme`.
 *
 * Exercises AG\'s `rowGroup` column-def flag (set in
 * `dataGridExampleRowGrouping`) with `autoGroupColumnDef.field="name"` and
 * `groupDefaultExpanded={-1}`. Visual coverage:
 *   - the leading auto-group column shows expand/collapse chevrons from
 *     `saltIconSet`
 *   - group rows pick up the same row hover / selection tokens as flat rows
 *
 * Note on `useAgGridHelpers({ compact: true })`: the legacy story passes
 * `compact: true` to the hook, but the hook only contracts the rhythm when
 * `density === "high"` (`case compact && "high":` in the switch). With the
 * default medium density (set by Storybook\'s `withTheme` decorator), legacy
 * falls through to the standard 37/36 tier. The V3 port therefore renders at
 * default density too — no `SaltProvider density="high"` wrapper, matching
 * what legacy actually does.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → RowGrouping`
 * (`packages/ag-grid-theme/src/examples/RowGrouping.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import dataGridExampleRowGrouping from "../../src/dependencies/dataGridExampleRowGrouping";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const RowGrouping = () => (
  <div style={V3_STORY_CONTAINER}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      columnDefs={dataGridExampleRowGrouping}
      rowData={dataGridExampleData}
      // Make sure all groups expanded by default
      groupDefaultExpanded={-1}
      // Show value in group leaf node
      autoGroupColumnDef={{ field: "name" }}
      onGridReady={fitColumnsOnReady}
    />
  </div>
);
