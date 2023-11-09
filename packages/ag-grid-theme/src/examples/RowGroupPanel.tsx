import { StackLayout } from "@salt-ds/core";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGroupPanel from "../dependencies/dataGridExampleRowGroupPanel";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const RowGroupPanel = (props: { defaultTheme: string }) => {
    const { defaultTheme = "salt" } = props
    const { themeName, switcher } = useAgGridThemeSwitcher(defaultTheme);
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          columnDefs={dataGridExampleRowGroupPanel}
          defaultColDef={{
            enableRowGroup: true,
          }}
          rowData={dataGridExampleData}
          rowGroupPanelShow="always"
          {...agGridProps}
        />
      </div>
    </StackLayout>
  );
};

RowGroupPanel.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default RowGroupPanel;
