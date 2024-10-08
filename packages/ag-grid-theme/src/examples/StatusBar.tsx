import { Divider, StackLayout, Text } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const CustomClickableStatusBar = () => {
  return (
    <StackLayout direction="row" align="center" gap={1}>
      <Divider
        orientation="vertical"
        variant="secondary"
        style={{ height: "var(--salt-text-fontSize)", alignSelf: "center" }}
      />
      {/* In status bar, line height being size base keeps text in the middle */}
      <Text color="secondary" style={{ lineHeight: "var(--salt-size-base)" }}>
        Custom Component
      </Text>
    </StackLayout>
  );
};

const statusBar = {
  statusPanels: [
    {
      statusPanel: "agTotalRowCountComponent",
      align: "left",
    },
    { statusPanel: "agFilteredRowCountComponent" },
    { statusPanel: "agSelectedRowCountComponent" },
    { statusPanel: "agAggregationComponent" },
    {
      statusPanel: CustomClickableStatusBar,
    },
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
          cellSelection
          rowSelection="multiple"
          statusBar={statusBar}
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
          onFirstDataRendered={(params) => {
            params.api.forEachNode((node, index) => {
              if (node.data && index < 3) {
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
