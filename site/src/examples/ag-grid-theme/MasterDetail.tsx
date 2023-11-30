import { useCallback, useRef } from "react";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultData, masterDetailColumns } from "./data";

export const MasterDetail = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
  const { agGridProps, containerProps } = useAgGridHelpers();

  const gridRef = useRef<AgGridReact>(null);

  const onFirstDataRendered = useCallback(() => {
    requestAnimationFrame(function () {
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
      <AgGridReact
        columnDefs={masterDetailColumns}
        rowData={defaultData}
        {...agGridProps}
      ></AgGridReact>
    </div>
  );

  return (
    <div {...containerProps}>
      <AgGridReact
        ref={gridRef}
        columnDefs={masterDetailColumns}
        detailCellRenderer={detailCellRenderer}
        detailCellRendererParams={{
          detailGridOptions: { columnDefs: masterDetailColumns },
          getDetailRowData: (params: {
            successCallback: (rowData: typeof defaultData) => void;
          }) => params.successCallback(defaultData),
        }}
        masterDetail={true}
        detailRowHeight={300}
        rowData={defaultData}
        {...agGridProps}
        {...props}
        onFirstDataRendered={onFirstDataRendered}
      />
    </div>
  );
};
