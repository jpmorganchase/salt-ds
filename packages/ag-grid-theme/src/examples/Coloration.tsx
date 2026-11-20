import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumnsColoration from "../dependencies/dataGridExampleColumnsColoration";
import dataGridExampleData from "../dependencies/dataGridExampleData";

const Coloration = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        columnDefs={dataGridExampleColumnsColoration}
        rowData={dataGridExampleData}
      />
    </div>
  );
};

export default Coloration;
