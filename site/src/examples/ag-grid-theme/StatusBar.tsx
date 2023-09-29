import { StackLayout } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultColumns, defaultData } from "./data";

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

const StatusBar = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <StackLayout gap={2}>
      <p>Select rows to enable status bar display</p>
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
    </StackLayout>
  );
};

export default StatusBar;
