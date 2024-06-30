import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useCallback, useRef } from "react";
import rowData from "../dependencies/dataGridExampleData";
import columnDefs from "../dependencies/masterDetailExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const MasterDetail = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  const gridRef = useRef<AgGridReact>(null);

  const onFirstDataRendered = useCallback(() => {
    requestAnimationFrame(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const node = gridRef.current?.api.getDisplayedRowAtIndex(0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      node?.setExpanded(true);
    });
  }, []);

  const detailCellRenderer = () => (
    <div
      className={containerProps.className}
      style={{ height: "100%", padding: 20 }}
    >
      <AgGridReact columnDefs={columnDefs} rowData={rowData} {...agGridProps} />
    </div>
  );

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        ref={gridRef}
        columnDefs={columnDefs}
        detailCellRenderer={detailCellRenderer}
        detailCellRendererParams={{
          detailGridOptions: { columnDefs },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
          getDetailRowData: (params: any) => params.successCallback(rowData),
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
