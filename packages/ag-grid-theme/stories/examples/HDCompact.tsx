import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { FlexLayout, SaltProvider, StackLayout } from "@salt-ds/core";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
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

const HDCompact = (props: AgGridReactProps) => {
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers(
    `ag-theme-${themeName}`,
    true
  );

  return (
    <SaltProvider density="high">
      <StackLayout gap={4}>
        <FlexLayout direction="row">{switcher}</FlexLayout>
        <div {...containerProps}>
          <AgGridReact
            columnDefs={dataGridExampleColumns}
            rowData={dataGridExampleData}
            statusBar={statusBar}
            rowSelection="multiple"
            {...agGridProps}
            {...props}
            enableRangeSelection={true}
          />
        </div>
      </StackLayout>
    </SaltProvider>
  );
};

HDCompact.parameters = {
  chromatic: { disableSnapshot: false },
};

export default HDCompact;
