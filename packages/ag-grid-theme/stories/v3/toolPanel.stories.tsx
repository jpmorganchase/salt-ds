import "./_setupV3";
/**
 * Phase 2 V3 spike — `ToolPanel` story rendered against `saltTheme`.
 *
 * Exercises AG Enterprise's right-side tool-panel drawer with three panels:
 *   - built-in `agColumnsToolPanel` (column visibility list)
 *   - built-in `agFiltersToolPanel` (per-column filter editor)
 *   - a Salt-built `CustomPanel` (FlexLayout + Text)
 *
 * Visual coverage:
 *   - the tab-bar at the right uses `saltTabStyle` for the selected
 *     underline + `saltIconSet` for the columns / filter / save glyphs
 *   - the panel itself takes `chromeBackgroundColor` from saltTheme
 *   - the custom panel uses `var(--salt-container-secondary-background)`
 *     directly to differentiate its surface.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → ToolPanel`
 * (`packages/ag-grid-theme/src/examples/ToolPanel.tsx`).
 */
import { FlexLayout, Text } from "@salt-ds/core";
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const CustomPanel = () => (
  <FlexLayout
    style={{
      background: "var(--salt-container-secondary-background",
      height: "calc(10* var(--salt-size-base))",
    }}
    align="center"
    justify="center"
    direction="column"
  >
    <Text styleAs="h2">Custom panel</Text>
    <Text>Width should auto fit</Text>
  </FlexLayout>
);

const sideBar = {
  toolPanels: [
    {
      id: "columns",
      labelDefault: "Columns",
      labelKey: "columns",
      iconKey: "columns",
      toolPanel: "agColumnsToolPanel",
    },
    {
      id: "filters",
      labelDefault: "Filters",
      labelKey: "filters",
      iconKey: "filter",
      toolPanel: "agFiltersToolPanel",
    },
    {
      id: "customStats",
      labelDefault: "Custom Stats",
      labelKey: "customStats",
      iconKey: "save",
      toolPanel: CustomPanel,
    },
  ],
  defaultToolPanel: "customStats",
};

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

export const ToolPanel = () => (
  <div style={V3_STORY_CONTAINER}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      columnDefs={columnDefs}
      rowData={dataGridExampleData}
      rowSelection="single"
      cellSelection={true}
      sideBar={sideBar}
      onGridReady={fitColumnsOnReady}
    />
  </div>
);
