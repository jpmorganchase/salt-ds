import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import rowDragColumns from "../dependencies/rowDragColumns";

const DragRowOrder = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        animateRows
        rowDragManaged
        columnDefs={rowDragColumns}
        rowData={dataGridExampleData}
      />
    </div>
  );
};

export default DragRowOrder;
