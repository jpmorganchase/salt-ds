import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const Default = ({
  containerClassName,
  ...agProps
}: AgGridReactProps & { containerClassName?: string }) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
    containerClassName,
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
        {...agProps}
      />
    </div>
  );
};

Default.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default Default;
