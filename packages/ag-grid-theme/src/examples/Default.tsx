import { AgGridReact } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const Default = (props: { defaultTheme: string }) => {
  const { defaultTheme = "salt" } = props;
  const { themeName, switcher } = useAgGridThemeSwitcher(defaultTheme);
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          columnDefs={[
            {
              headerName: "Name",
              field: "name",
              filterParams: {
                buttons: ["reset", "apply"],
              },
              editable: false,
            },
            {
              headerName: "Code",
              field: "code",
            },
            {
              headerName: "Capital",
              field: "capital",
            },
          ]}
          rowData={dataGridExampleData}
          rowSelection="single"
          enableRangeSelection={true}
          {...agGridProps}
        />
      </div>
    </StackLayout>
  );
};

Default.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default Default;
