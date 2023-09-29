import { AgGridReact } from "ag-grid-react";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { customFilterColumns, defaultData } from "./data";

const FloatingFilter = () => {
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

export default FloatingFilter;
