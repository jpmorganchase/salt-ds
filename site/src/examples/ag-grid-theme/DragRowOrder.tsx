import { AgGridReact, AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultData, rowDragColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const DragRowOrder = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
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
