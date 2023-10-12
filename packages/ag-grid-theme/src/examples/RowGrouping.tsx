import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGrouping from "../dependencies/dataGridExampleRowGrouping";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const RowGrouping = (props: AgGridReactProps) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <div {...containerProps}>
      <AgGridReact
        columnDefs={dataGridExampleRowGrouping}
        rowData={dataGridExampleData}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

RowGrouping.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default RowGrouping;
