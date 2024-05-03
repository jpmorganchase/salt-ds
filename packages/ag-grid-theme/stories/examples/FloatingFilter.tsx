import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const FloatingFilter = (props: AgGridReactProps) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <div {...containerProps}>
      <AgGridReact
        defaultColDef={{ floatingFilter: true }}
        columnDefs={customFilterExampleColumns}
        rowData={dataGridExampleData}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

FloatingFilter.parameters = {
  chromatic: { disableSnapshot: false },
};

export default FloatingFilter;
