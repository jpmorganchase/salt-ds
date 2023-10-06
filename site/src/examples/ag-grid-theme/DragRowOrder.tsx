import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultData, rowDragColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const DragRowOrder = (props: AgGridReactProps) => {
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
