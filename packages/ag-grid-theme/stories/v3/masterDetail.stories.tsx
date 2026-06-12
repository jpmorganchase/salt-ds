import "./_setupV3";
/**
 * Phase 2 V3 spike — `MasterDetail` story rendered against `saltTheme`.
 *
 * Exercises the AG Enterprise master/detail row expansion:
 *   - the expander chevron in the leading column uses the `saltIconSet`
 *     "chevronDown"/"chevronRight" glyphs
 *   - the detail grid (rendered via `detailCellRenderer`) is also themed
 *     with `saltTheme` — the nested `<AgGridReact>` inherits the
 *     `--salt-*` tokens from the outer SaltProvider so its rows pick up
 *     the same Salt look without any extra wiring.
 *   - the first row is auto-expanded `onFirstDataRendered` so the detail
 *     grid is visible on snapshot capture.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → MasterDetail`
 * (`packages/ag-grid-theme/src/examples/MasterDetail.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useRef } from "react";
import rowData from "../../src/dependencies/dataGridExampleData";
import columnDefs from "../../src/dependencies/masterDetailExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const MasterDetail = () => {
  const gridRef = useRef<AgGridReact>(null);

  const onFirstDataRendered = useCallback(() => {
    requestAnimationFrame(() => {
      const node = gridRef.current?.api.getDisplayedRowAtIndex(0);
      node?.setExpanded(true);
    });
  }, []);

  const detailCellRenderer = () => (
    <div style={{ height: "100%", padding: "var(--salt-spacing-300)" }}>
      <AgGridReact
        theme={saltTheme}
        {...saltAgGridDefaults}
        columnDefs={columnDefs}
        rowData={rowData}
      />
    </div>
  );

  return (
    <div style={{ height: 500, width: 800 }}>
      <AgGridReact
        theme={saltTheme}
        {...saltAgGridDefaults}
        ref={gridRef}
        columnDefs={columnDefs}
        detailCellRenderer={detailCellRenderer}
        detailCellRendererParams={{
          detailGridOptions: { columnDefs },
          getDetailRowData: (params: {
            successCallback: (data: typeof rowData) => void;
          }) => params.successCallback(rowData),
        }}
        masterDetail={true}
        detailRowHeight={300}
        rowData={rowData}
        onFirstDataRendered={onFirstDataRendered}
      />
    </div>
  );
};

