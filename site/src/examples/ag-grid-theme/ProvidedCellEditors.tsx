import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { cellEditorsColumn } from "./data/cellEditorsColumn";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { dataGridExampleDataCellEditors } from "./data/cellEditorsData";
import { dateString } from "./data/cellEditorsDataTypes";

export const ProvidedCellEditors = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
        defaultColDef={{ filter: true }}
        {...props}
        columnDefs={cellEditorsColumn}
        rowData={[...dataGridExampleDataCellEditors]}
        dataTypeDefinitions={{ dateString }}
      />
    </div>
  );
};
