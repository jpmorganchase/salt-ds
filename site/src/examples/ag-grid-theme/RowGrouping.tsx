import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultData, rowGroupColumns } from "./data";

export const RowGrouping = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        columnDefs={rowGroupColumns}
        rowData={defaultData}
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
        defaultColDef={{ filter: true }}
        {...props}
      />
    </div>
  );
};
