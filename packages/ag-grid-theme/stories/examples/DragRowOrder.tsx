import React, { useEffect } from "react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import rowDragColumns from "../dependencies/rowDragColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import "../../uitk-ag-theme.css";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const DragRowOrderExample = function DragRowOrderExample(
  props: AgGridReactProps
) {
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div style={{ marginTop: 25, height: 800, width: 800 }} {...containerProps}>
      <AgGridReact animateRows rowDragManaged {...agGridProps} {...props} />
    </div>
  );
};

DragRowOrderExample.defaultProps = {
  columnDefs: rowDragColumns,
  rowData: dataGridExampleData,
};

export default function DragRowOrder(props: AgGridReactProps) {
  return <DragRowOrderExample {...props} />;
}
