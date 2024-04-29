import { SaltProvider } from "@salt-ds/core";
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

const HDCompact = (props: AgGridReactProps) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
    compact: true,
    density: "high",
  });

  return (
    <SaltProvider density="high">
      <div {...containerProps}>
        <AgGridReact
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
          statusBar={statusBar}
          rowSelection="multiple"
          {...agGridProps}
          {...props}
          enableRangeSelection={true}
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
    </SaltProvider>
  );
};

HDCompact.parameters = {
  chromatic: { disableSnapshot: false },
};

export default HDCompact;
