import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import rowDragColumns from "../dependencies/rowDragColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const DragRowOrder = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
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
