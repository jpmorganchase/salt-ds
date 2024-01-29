import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultData, rowDragColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const DragRowOrder = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        animateRows
        rowDragManaged
        {...agGridProps}
        {...props}
        columnDefs={rowDragColumns}
        rowData={defaultData}
      />
    </div>
  );
};
