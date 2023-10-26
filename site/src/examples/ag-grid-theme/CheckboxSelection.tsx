import { AgGridReact } from "ag-grid-react";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultColumns, defaultData } from "./data";

export const CheckboxSelection = () => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        rowData={defaultData}
        columnDefs={defaultColumns}
        rowSelection="multiple"
      />
    </div>
  );
};
