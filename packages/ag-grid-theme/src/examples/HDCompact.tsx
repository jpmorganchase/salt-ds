import { SaltProvider, SaltProviderNext, useTheme } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { DropdownEditor } from "../dependencies/cell-editors/DropdownEditor";
import dataGridExampleColumnsHdCompact from "../dependencies/dataGridExampleColumnsHdCompact";
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

  const Provider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <Provider density="high">
      <div {...containerProps}>
        <AgGridReact
          columnDefs={dataGridExampleColumnsHdCompact}
          rowData={dataGridExampleData}
          statusBar={statusBar}
          rowSelection="multiple"
          {...agGridProps}
          {...props}
          cellSelection={true}
          onFirstDataRendered={(params) => {
            params.api.forEachNode((node, index) => {
              if (node.data && index < 3) {
                node.setSelected(true);
              }
            });
          }}
          components={{
            DropdownEditor,
          }}
        />
      </div>
    </Provider>
  );
};

export default HDCompact;
