import { AgGridReact } from "ag-grid-react";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultColumns, defaultData } from "./data";

export const CheckboxSelection = () => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
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
