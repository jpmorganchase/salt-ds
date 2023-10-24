import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultData, spannedColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const ColumnSpanning = (props: AgGridReactProps) => {
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={spannedColumns}
        rowData={defaultData}
      />
    </div>
  );
};
