import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultData, rowGroupPanelColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const RowGroupPanel = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        columnDefs={rowGroupPanelColumns}
        defaultColDef={{
          enableRowGroup: true,
        }}
        rowData={defaultData}
        rowGroupPanelShow="always"
        {...agGridProps}
        {...props}
      />
    </div>
  );
};
