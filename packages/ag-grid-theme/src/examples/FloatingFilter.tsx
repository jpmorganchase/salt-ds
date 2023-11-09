import { AgGridReact } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const FloatingFilter = (props: { defaultTheme: string }) => {
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
          defaultColDef={{ floatingFilter: true }}
          columnDefs={customFilterExampleColumns}
          rowData={dataGridExampleData}
          {...agGridProps}
        />
      </div>
    </StackLayout>
  );
};

FloatingFilter.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default FloatingFilter;
