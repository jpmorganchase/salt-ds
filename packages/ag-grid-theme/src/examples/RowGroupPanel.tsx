import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGroupPanel from "../dependencies/dataGridExampleRowGroupPanel";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const RowGroupPanel = (props: AgGridReactProps) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
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
  );
};

RowGroupPanel.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default RowGroupPanel;
