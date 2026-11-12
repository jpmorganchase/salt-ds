import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGroupPanel from "../dependencies/dataGridExampleRowGroupPanel";

const RowGroupPanel = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        columnDefs={dataGridExampleRowGroupPanel}
        defaultColDef={{
          enableRowGroup: true,
        }}
        rowData={dataGridExampleData}
        rowGroupPanelShow="always"
      />
    </div>
  );
};
export default RowGroupPanel;
