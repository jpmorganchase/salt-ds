import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultColumns, defaultData } from "./data";

const CheckboxSelection = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
      <div {...containerProps}>
        <AgGridReact
          {...agGridProps}
          {...props}
          rowData={defaultData}
          columnDefs={defaultColumns}
          rowSelection="multiple"
        />
      </div>
  );
};

export default CheckboxSelection;
