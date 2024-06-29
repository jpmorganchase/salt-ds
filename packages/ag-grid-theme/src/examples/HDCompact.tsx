import {
  SaltProvider,
  UNSTABLE_SaltProviderNext,
  useTheme,
} from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
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
  const { themeNext } = useTheme();
  const { agGridProps, containerProps } = useAgGridHelpers({
    compact: true,
    density: "high",
  });

  const Provider = themeNext ? UNSTABLE_SaltProviderNext : SaltProvider;

  return (
    <Provider density="high">
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
    </Provider>
  );
};

export default HDCompact;
