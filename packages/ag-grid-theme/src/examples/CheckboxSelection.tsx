import { AgGridReact } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

  const CheckboxSelection = (props: { defaultTheme: string }) => {
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
          {...agGridProps}
          rowData={dataGridExampleData}
          columnDefs={dataGridExampleColumns}
          rowSelection="multiple"
        />
      </div>
    </StackLayout>
  );
};

CheckboxSelection.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default CheckboxSelection;
