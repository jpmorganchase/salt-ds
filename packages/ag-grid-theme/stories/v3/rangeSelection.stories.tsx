import "./_setupV3";
/**
 * Phase 2 V3 spike — `RangeSelection` story rendered against `saltTheme`.
 *
 * Exercises `saltRangeSelectionAdjustments` (Phase 2 wiring lands in the
 * same commit as this story):
 *   - pre-selects rows 3-6 → `.ag-row-selected` background + ::before bar
 *   - programmatically adds a cell range (rows 1-10, columns code-to-population)
 *     via `api.addCellRange` → cross-cell `::after` outlines on the outer edges
 *   - the first column is pinned → tests `.ag-cell-last-left-pinned` divider
 *
 * Uses the AG v3-native `onGridReady` callback to get the grid api (legacy
 * uses `useAgGridHelpers().api` which was a Salt wrapper — gone in V3 per
 * proposal §9 decision 3).
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → RangeSelection`
 * (`packages/ag-grid-theme/src/examples/RangeSelection.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import {
  AllCommunityModule,
  type GridApi,
  type GridReadyEvent,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { useRef } from "react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const RangeSelection = () => {
  const apiRef = useRef<GridApi | null>(null);

  const onGridReady = (params: GridReadyEvent) => {
    apiRef.current = params.api;
    params.api.addCellRange({
      rowStartIndex: 1,
      rowEndIndex: 10,
      columnStart: "code",
      columnEnd: "population",
    });
  };

  return (
    <div style={{ height: 400, width: 800 }}>
      <AgGridReact
        theme={saltTheme}
        {...saltAgGridDefaults}
        columnDefs={dataGridExampleColumns}
        rowData={dataGridExampleData}
        rowSelection="multiple"
        cellSelection
        onGridReady={onGridReady}
        onFirstDataRendered={(params) => {
          params.api.forEachNode((node, index) => {
            if (node.data && index < 7 && index > 2) {
              node.setSelected(true);
            }
          });
        }}
      />
    </div>
  );
};

