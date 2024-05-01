import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import columnSpanningExampleColumns from "../dependencies/columnSpanningExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const ColumnSpanning = (props: AgGridReactProps) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={columnSpanningExampleColumns}
        rowData={dataGridExampleData}
      />
    </div>
  );
};

ColumnSpanning.parameters = {
  chromatic: { disableSnapshot: false },
};

export default ColumnSpanning;
