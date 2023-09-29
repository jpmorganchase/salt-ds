import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import { defaultData, rowDragColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

const DragRowOrder = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <StackLayout gap={4}>
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
    </StackLayout>
  );
};

export default DragRowOrder;
