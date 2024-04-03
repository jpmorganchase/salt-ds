import { StackLayout, Text } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

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
      <Text>Select rows to enable status bar display</Text>
      <div
        {...containerProps}
        style={{
          ...containerProps.style,
          // Not part of the theme, add a border to check text center alignment
          borderBottom: "1px solid var(--salt-container-primary-borderColor)",
        }}
      >
        <AgGridReact
          {...agGridProps}
          {...props}
          enableRangeSelection
          rowSelection="multiple"
          statusBar={statusBar}
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
          onFirstDataRendered={(params) => {
            params.api.forEachNode((node, index) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              if (node.data && index < 3) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                node.setSelected(true);
              }
            });
          }}
        />
      </div>
    </StackLayout>
  );
};

export default StatusBar;
