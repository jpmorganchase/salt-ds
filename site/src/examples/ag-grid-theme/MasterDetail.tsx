import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useCallback, useRef } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultData, masterDetailColumns } from "./data";

export const MasterDetail = (props: AgGridReactProps) => {
  const gridRef = useRef<AgGridReact>(null);

  const onFirstDataRendered = useCallback(() => {
    requestAnimationFrame(() => {
      const node = gridRef.current?.api.getDisplayedRowAtIndex(0);
      node?.setExpanded(true);
    });
  }, []);

  const detailCellRenderer = () => (
    <div
      className="ag-theme-salt"
      style={{ height: "100%", padding: "var(--salt-spacing-300)" }}
    >
      <AgGridReact
        columnDefs={masterDetailColumns}
        rowData={defaultData}
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
        defaultColDef={{ filter: true }}
      />
    </div>
  );

  return (
    <div className="ag-theme-salt" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        ref={gridRef}
        columnDefs={masterDetailColumns}
        detailCellRenderer={detailCellRenderer}
        detailCellRendererParams={{
          detailGridOptions: {
            theme: "legacy",
            columnDefs: masterDetailColumns,
          },
          getDetailRowData: (params: {
            successCallback: (rowData: typeof defaultData) => void;
          }) => params.successCallback(defaultData),
        }}
        masterDetail={true}
        detailRowHeight={300}
        rowData={defaultData}
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
        defaultColDef={{ filter: true }}
        {...props}
        onFirstDataRendered={onFirstDataRendered}
      />
    </div>
  );
};
