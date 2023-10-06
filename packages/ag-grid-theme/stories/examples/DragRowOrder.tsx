import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import rowDragColumns from "../dependencies/rowDragColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const DragRowOrder = (props: AgGridReactProps) => {
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers(
    `ag-theme-${themeName}`
  );

  return (
    <StackLayout gap={4}>
      {switcher}
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
    </StackLayout>
  );
};

DragRowOrder.parameters = {
  chromatic: { disableSnapshot: false },
};

export default DragRowOrder;
