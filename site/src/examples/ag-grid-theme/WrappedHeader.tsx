import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useEffect } from "react";
import { defaultData } from "./data";
import { wrappedColumns } from "./data/wrappedColumns";
import { useAgGridHelpers } from "./useAgGridHelpers";

const statusBar = {
  statusPanels: [
    {
      statusPanel: "agTotalRowCountComponent",
      align: "left",
    },
    { statusPanel: "agFilteredRowCountComponent" },
    { statusPanel: "agSelectedRowCountComponent" },
    { statusPanel: "agAggregationComponent" },
  ],
};

export const WrappedHeader = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers();
  const { defaultColDef: propsColDefs, ...restAgGridProps } = agGridProps;

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [api, isGridReady]);

  return (
    <div {...containerProps} style={{ height: "400px", width: "500px" }}>
      <AgGridReact
        columnDefs={wrappedColumns}
        rowData={defaultData}
        statusBar={statusBar}
        rowSelection="multiple"
        defaultColDef={{
          ...propsColDefs,
          autoHeaderHeight: true,
          wrapHeaderText: true,
        }}
        {...restAgGridProps}
        {...props}
      />
    </div>
  );
};
