import "./_setupV3";
/**
 * Phase 0 V3 spike — `Default` story rendered against the new `saltTheme`.
 *
 * Mirrors the legacy `Default` story (src/examples/Default.tsx) so a
 * side-by-side visual diff is meaningful:
 *   - container `{ height: 500, width: 800 }`            (was `useAgGridHelpers`)
 *   - `onGridReady` -> `api.sizeColumnsToFit()`          (was `useAgGridHelpers`)
 *   - `defaultColDef` filter / resizable / sortable      (via `saltAgGridDefaults`)
 *   - `statusBar` with `agTotalRowCountComponent`        (in legacy story)
 *   - `cellSelection={true}`                             (in legacy story)
 *
 * Sits alongside the legacy `Default` story in `ag-grid-theme.stories.tsx`.
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import {
  AllCommunityModule,
  type GridReadyEvent,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { useCallback } from "react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
const statusBar = {
  statusPanels: [{ statusPanel: "agTotalRowCountComponent", align: "right" }],
};
export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};
export const Default = () => {
  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);
  return (
    <div style={V3_STORY_CONTAINER}>
      <AgGridReact
        theme={saltTheme}
        {...saltAgGridDefaults}
        columnDefs={[
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
        ]}
        rowData={dataGridExampleData}
        rowSelection="single"
        statusBar={statusBar}
        cellSelection={true}
        onGridReady={onGridReady}
      />
    </div>
  );
};
