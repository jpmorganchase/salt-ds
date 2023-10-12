import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import rowDragColumns from "../dependencies/rowDragColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const DragRowOrder = (props: AgGridReactProps) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <div {...containerProps}>
      <AgGridReact
        animateRows
        rowDragManaged
        {...agGridProps}
        {...props}
        columnDefs={rowDragColumns}
        rowData={dataGridExampleData}
      />
    </div>
  );
};

DragRowOrder.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default DragRowOrder;
