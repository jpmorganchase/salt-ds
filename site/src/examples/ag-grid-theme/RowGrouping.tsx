import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultData, rowGroupColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const RowGrouping = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        columnDefs={rowGroupColumns}
        rowData={defaultData}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};
