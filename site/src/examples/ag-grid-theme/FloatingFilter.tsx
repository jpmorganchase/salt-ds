import { AgGridReact } from "ag-grid-react";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { customFilterColumns, defaultData } from "./data";

export const FloatingFilter = () => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        defaultColDef={{ floatingFilter: true }}
        columnDefs={customFilterColumns}
        rowData={defaultData}
        {...agGridProps}
      />
    </div>
  );
};
