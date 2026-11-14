import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";

const FloatingFilter = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        defaultColDef={{ floatingFilter: true }}
        columnDefs={customFilterExampleColumns}
        rowData={dataGridExampleData}
      />
    </div>
  );
};

export default FloatingFilter;
