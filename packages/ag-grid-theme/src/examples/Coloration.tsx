import { StackLayout } from "@salt-ds/core";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumnsColoration from "../dependencies/dataGridExampleColumnsColoration";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const Coloration = (props: { defaultTheme: string }) => {
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
          columnDefs={dataGridExampleColumnsColoration}
          rowData={dataGridExampleData}
        />
      </div>
    </StackLayout>
  );
};

Coloration.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default Coloration;
