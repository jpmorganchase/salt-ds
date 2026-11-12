import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";

const VariantSecondary = (props: AgGridReactProps) => {
  return (
    <div
      className="ag-theme-salt ag-theme-salt-variant-secondary"
      style={{ height: 500, width: 800 }}
    >
      <AgGridReact
        {...props}
        rowData={dataGridExampleData}
        columnDefs={dataGridExampleColumns}
        rowSelection="multiple"
      />
    </div>
  );
};

export default VariantSecondary;
