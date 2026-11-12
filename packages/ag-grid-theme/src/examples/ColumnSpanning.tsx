import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import columnSpanningExampleColumns from "../dependencies/columnSpanningExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";

const ColumnSpanning = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        columnDefs={columnSpanningExampleColumns}
        rowData={dataGridExampleData}
      />
    </div>
  );
};

export default ColumnSpanning;
