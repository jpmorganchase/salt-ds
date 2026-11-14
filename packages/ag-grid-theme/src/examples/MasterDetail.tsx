import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useCallback, useRef } from "react";
import rowData from "../dependencies/dataGridExampleData";
import columnDefs from "../dependencies/masterDetailExampleData";

const MasterDetail = (props: AgGridReactProps) => {
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
      <AgGridReact columnDefs={columnDefs} rowData={rowData} />
    </div>
  );

  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
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

export default MasterDetail;
