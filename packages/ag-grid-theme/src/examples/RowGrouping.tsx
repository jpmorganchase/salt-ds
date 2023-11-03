import { StackLayout } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGrouping from "../dependencies/dataGridExampleRowGrouping";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const RowGrouping = (props: AgGridReactProps) => {
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          columnDefs={dataGridExampleRowGrouping}
          rowData={dataGridExampleData}
          {...agGridProps}
          {...props}
        />
      </div>
    </StackLayout>
  );
};

RowGrouping.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default RowGrouping;
