import { StackLayout, Text } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
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
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <StackLayout gap={2}>
      <Text>Select rows to enable status bar display</Text>
      <div {...containerProps}>
        <AgGridReact
          enableRangeSelection
          rowSelection="multiple"
          statusBar={statusBar}
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
          {...agGridProps}
          {...props}
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

StatusBar.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default StatusBar;
