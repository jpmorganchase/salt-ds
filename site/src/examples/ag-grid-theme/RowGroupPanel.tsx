import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultData, rowGroupPanelColumns } from "./data";

export const RowGroupPanel = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        columnDefs={rowGroupPanelColumns}
        defaultColDef={{
          enableRowGroup: true,
        }}
        rowData={defaultData}
        rowGroupPanelShow="always"
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
        {...props}
      />
    </div>
  );
};
