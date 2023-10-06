import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultData, groupedColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const ColumnGroup = (props: AgGridReactProps) => {
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
