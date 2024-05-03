import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const Default = (props: AgGridReactProps) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
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
        {...props}
      />
    </div>
  );
};

Default.parameters = {
  chromatic: { disableSnapshot: false },
};

export default Default;
