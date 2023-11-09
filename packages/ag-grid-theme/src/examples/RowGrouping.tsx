import { StackLayout } from "@salt-ds/core";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGrouping from "../dependencies/dataGridExampleRowGrouping";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const RowGrouping = (props: { defaultTheme: string }) => {
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
          columnDefs={dataGridExampleRowGrouping}
          rowData={dataGridExampleData}
          {...agGridProps}
        />
      </div>
    </StackLayout>
  );
};

RowGrouping.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default RowGrouping;
