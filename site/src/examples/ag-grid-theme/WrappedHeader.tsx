import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultData } from "./data";
import { wrappedColumns } from "./data/wrappedColumns";
import { useAgGridHelpers } from "./useAgGridHelpers";

const statusBar = {
  statusPanels: [
    {
      statusPanel: "agTotalRowCountComponent",
      align: "left",
    },
    { statusPanel: "agFilteredRowCountComponent" },
    { statusPanel: "agSelectedRowCountComponent" },
    { statusPanel: "agAggregationComponent" },
  ],
};

export const WrappedHeader = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { agGridProps, containerProps } = useAgGridHelpers();
  const { defaultColDef: propsColDefs, ...restAgGridProps } = agGridProps;

  return (
    <div {...containerProps}>
      <AgGridReact
        columnDefs={wrappedColumns}
        rowData={defaultData}
        statusBar={statusBar}
        rowSelection="multiple"
        defaultColDef={{
          ...propsColDefs,
          autoHeaderHeight: true,
          wrapHeaderText: true,
        }}
        {...restAgGridProps}
        {...props}
      />
    </div>
  );
};
