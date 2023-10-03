import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultData, rowGroupPanelColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const RowGroupPanel = (props: AgGridReactProps) => {
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