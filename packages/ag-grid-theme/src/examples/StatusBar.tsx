import { StackLayout } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

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
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <StackLayout gap={4}>
      {switcher}
      <StackLayout gap={2}>
        <p>Select rows to enable status bar display</p>
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
    </StackLayout>
  );
};

StatusBar.parameters = {
  chromatic: { disableSnapshot: false, delay: 500 },
};

export default StatusBar;
