import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultData, groupedColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const ColumnGroup = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        rowData={defaultData}
        columnDefs={groupedColumns("US States")}
      />
    </div>
  );
};
