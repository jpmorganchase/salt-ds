import { AgGridReact } from "ag-grid-react";
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

const HDCompact = (props: { defaultTheme: string }) => {
  const { defaultTheme = "salt" } = props;
  const { themeName, switcher } = useAgGridThemeSwitcher(defaultTheme);
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
    compact: true,
    density: "high",
  });

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
      </StackLayout>
    </SaltProvider>
  );
};

HDCompact.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default HDCompact;

export const HDCompactUITK = () => <HDCompact defaultTheme="uitk" />;

HDCompactUITK.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};
