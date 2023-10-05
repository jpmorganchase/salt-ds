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
  const { agGridProps, containerProps } = useAgGridHelpers(
    `ag-theme-${themeName}`
  );

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
          />
        </div>
      </StackLayout>
    </StackLayout>
  );
};

StatusBar.parameters = {
  chromatic: { disableSnapshot: false },
};

export default StatusBar;
