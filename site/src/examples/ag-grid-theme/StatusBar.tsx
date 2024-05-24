import { Text } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultColumns, defaultData } from "./data";
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

export const StatusBar = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <>
      <Text>Select rows to enable status bar display</Text>
      <div {...containerProps}>
        <AgGridReact
          enableRangeSelection
          rowSelection="multiple"
          statusBar={statusBar}
          columnDefs={defaultColumns}
          rowData={defaultData}
          {...agGridProps}
          {...props}
        />
      </div>
    </>
  );
};
