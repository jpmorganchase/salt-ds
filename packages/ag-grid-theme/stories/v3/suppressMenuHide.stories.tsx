import "./_setupV3";
/**
 * Phase 2 V3 spike — `SuppressMenuHide` story rendered against `saltTheme`.
 *
 * Exercises `suppressMenuHide={false}` (AG's v32 default changed — when
 * false, the column-header menu/filter buttons fade in on hover only).
 * Visual coverage:
 *   - hovering a column header reveals the menu button (3-dots) and filter
 *     button using `saltIconSet` glyphs
 *   - tooltips on `Capital` come from `tooltipBackgroundColor` in saltTheme.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → SuppressMenuHide`
 * (`packages/ag-grid-theme/src/examples/SuppressMenuHide.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const columnDefs: AgGridReactProps["columnDefs"] = [
  {
    headerName: "Name",
    field: "name",
    filterParams: { buttons: ["reset", "apply"] },
    editable: false,
  },
  { headerName: "Code", field: "code" },
  {
    headerName: "Capital",
    field: "capital",
    tooltipField: "capital",
    headerTooltip: "Capital",
  },
];

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const SuppressMenuHide = (props: AgGridReactProps) => (
  <div style={V3_STORY_CONTAINER}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      {...props}
      columnDefs={columnDefs}
      rowData={dataGridExampleData}
      rowSelection="single"
      cellSelection={true}
      // Default value changed in v32
      suppressMenuHide={false}
      onGridReady={fitColumnsOnReady}
    />
  </div>
);
