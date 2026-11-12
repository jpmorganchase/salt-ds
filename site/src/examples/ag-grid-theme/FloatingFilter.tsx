import { AgGridReact } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { customFilterColumns, defaultData } from "./data";

export const FloatingFilter = () => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        defaultColDef={{ floatingFilter: true }}
        columnDefs={customFilterColumns}
        rowData={defaultData}
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
      />
    </div>
  );
};
