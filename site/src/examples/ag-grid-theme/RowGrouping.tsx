import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultData, rowGroupColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const RowGrouping = (props: AgGridReactProps) => {
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