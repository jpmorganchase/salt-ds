import "./_setupV3";
/**
 * Phase 2 V3 spike — `ParentChildRows` story rendered against `saltTheme`.
 *
 * Exercises AG's `treeData` rendering pipeline (`getDataPath` style, not
 * `rowGrouping`) with `groupDefaultExpanded={-1}` so every level is open.
 * Visual coverage:
 *   - tree expand/collapse chevrons use `saltIconSet`
 *   - the indent stripe spacing comes from `rowGroupIndentSize` in
 *     saltTheme (= `{ calc: "iconSize + spacing" }`)
 *   - leaf rows pick up the same `rowBorder` as the flat-grid case.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → ParentChildRows`
 * (`packages/ag-grid-theme/src/examples/ParentChildRows.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import parentChildExampleColumns from "../../src/dependencies/parentChildExampleColumns";
import parentChildExampleData from "../../src/dependencies/parentChildExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const ParentChildRows = () => (
  <div style={V3_STORY_CONTAINER}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      animateRows
      treeData
      columnDefs={parentChildExampleColumns}
      getDataPath={(data) => data.orgHierarchy}
      groupDefaultExpanded={-1}
      rowData={parentChildExampleData}
      onGridReady={fitColumnsOnReady}
    />
  </div>
);
