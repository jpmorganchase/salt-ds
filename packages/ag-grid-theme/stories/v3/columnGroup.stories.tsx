import "./_setupV3";
/**
 * Phase 2 V3 spike — `ColumnGroup` story rendered against `saltTheme`.
 *
 * Exercises column-group headers (`ColGroupDef.children`) plus the leading
 * checkbox column with `headerCheckboxSelection`. Visual coverage:
 *   - the grouped header row sits on top of the leaf column headers — both
 *     pick up `saltHeaderPrimary` background + `saltHeaderDividerPrimary`
 *     bottom-border.
 *   - the leading checkbox column exercises `saltCheckboxStyle` colours.
 *   - the `Population` column has `cellClass: ["numeric-cell",
 *     "editable-cell"]` so `saltCellStates` adornments (right-aligned number
 *     + editable corner triangle) render on its cells.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → ColumnGroup`
 * (`packages/ag-grid-theme/src/examples/ColumnGroup.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import {
  AllCommunityModule,
  type ColDef,
  type ColGroupDef,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const columnsWithGrouping = (groupName: string): (ColGroupDef | ColDef)[] => [
  {
    headerName: "",
    field: "on",
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 38,
    pinned: "left",
    suppressHeaderMenuButton: true,
    suppressHeaderFilterButton: true,
  },
  {
    headerName: groupName,
    children: [
      {
        headerName: "Name",
        field: "name",
        filterParams: {
          buttons: ["reset", "apply"],
        },
        editable: false,
      },
      {
        headerName: "Code",
        field: "code",
        columnGroupShow: "open",
      },
      {
        headerName: "Capital",
        field: "capital",
      },
      {
        headerName: "Population",
        type: "numericColumn",
        field: "population",
        filter: "agNumberColumnFilter",
        editable: true,
        cellClass: ["numeric-cell", "editable-cell"],
      },
    ],
  },
];

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const ColumnGroup = () => (
  <div style={V3_STORY_CONTAINER}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      rowSelection="multiple"
      rowData={dataGridExampleData}
      columnDefs={columnsWithGrouping("US States")}
      onGridReady={fitColumnsOnReady}
    />
  </div>
);
