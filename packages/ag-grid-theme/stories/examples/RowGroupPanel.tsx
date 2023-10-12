import { StackLayout } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGroupPanel from "../dependencies/dataGridExampleRowGroupPanel";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const RowGroupPanel = (props: AgGridReactProps) => {
  const { switcher, themeName } = useAgGridThemeSwitcher();
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
          {...props}
        />
      </div>
    </StackLayout>
  );
};

RowGroupPanel.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default RowGroupPanel;
