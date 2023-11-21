import { Text } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
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
