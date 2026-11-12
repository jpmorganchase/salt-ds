import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultData } from "./data";
import { wrappedColumns } from "./data/wrappedColumns";

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
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        columnDefs={wrappedColumns}
        rowData={defaultData}
        statusBar={statusBar}
        rowSelection="multiple"
        defaultColDef={{
          filter: true,
          autoHeaderHeight: true,
          wrapHeaderText: true,
        }}
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
        {...props}
      />
    </div>
  );
};
