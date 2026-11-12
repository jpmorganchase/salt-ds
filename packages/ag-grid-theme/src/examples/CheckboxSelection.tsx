import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";

const CheckboxSelection = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        rowData={dataGridExampleData}
        columnDefs={dataGridExampleColumns}
        rowSelection="multiple"
        onFirstDataRendered={(params) => {
          params.api.forEachNode((node, index) => {
            if (node.data && index < 7 && index > 2) {
              node.setSelected(true);
            }
          });
        }}
      />
    </div>
  );
};

export default CheckboxSelection;
