import "./_setupV3";
/**
 * Phase 2 V3 spike — `SortAndFilter` story rendered against `saltTheme`.
 *
 * Exercises sort + filter on a pre-loaded grid. On mount:
 *   - sets `name` filter to `["Alabama", "Alaska", "Arizona"]`
 *   - sets `rating` filter to `lessThan 50`
 *   - calls `onFilterChanged()` to apply the batch
 *
 * Visual coverage:
 *   - sorted column header shows the `saltIconSet` sort-asc glyph next to
 *     "Code"
 *   - filtered column headers show the filter-applied indicator
 *   - the filtered rows render with `saltCellStates` `.numeric-cell` right-
 *     alignment.
 *
 * Differences from the legacy story:
 *   - api/grid-ready management is inline via `useRef<AgGridReact>` and
 *     `onGridReady` (proposal §9 decision 3) instead of `useAgGridHelpers`.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → SortAndFilter`
 * (`packages/ag-grid-theme/src/examples/SortAndFilter.tsx`).
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
import rowData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const colDef = [
  {
    field: "name",
    filterParams: { defaultOption: "Alaska" },
  },
  { field: "code", sort: "asc" as const },
  { field: "capital" },
  {
    field: "population",
    type: "numericColumn",
    filter: "agNumberColumnFilter",
    cellClass: ["numeric-cell"],
  },
  {
    field: "rating",
    type: "numericColumn",
    filter: "agNumberColumnFilter",
    cellClass: ["numeric-cell"],
  },
];

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const SortAndFilter = () => {
  const apiRef = useRef<GridApi | null>(null);

  const onGridReady = async (params: GridReadyEvent) => {
    apiRef.current = params.api;
    params.api.sizeColumnsToFit();

    // set filter model and update
    await params.api.setColumnFilterModel("name", {
      values: ["Alabama", "Alaska", "Arizona"],
    });
    await params.api.setColumnFilterModel("rating", {
      type: "lessThan",
      filter: 50,
    });

    // refresh rows based on the filter (not automatic to allow for batching)
    params.api.onFilterChanged();
  };

  return (
    <div style={{ height: 500, width: 800 }}>
      <AgGridReact
        theme={saltTheme}
        {...saltAgGridDefaults}
        columnDefs={colDef}
        rowData={rowData}
        onGridReady={onGridReady}
      />
    </div>
  );
};

