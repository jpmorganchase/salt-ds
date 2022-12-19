import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const Default = (props: AgGridReactProps) => {
  const { themeName, switcher } = useAgGridThemeSwitcher();
  const { containerProps, agGridProps } = useAgGridHelpers(
    `ag-theme-${themeName}`
  );

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
          {...agGridProps}
          {...props}
        />
      </div>
    </StackLayout>
  );
};

export default Default;
