import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const ColumnGroup = (props: AgGridReactProps) => {
  const { themeName, switcher } = useAgGridThemeSwitcher();
  const { containerProps, agGridProps } = useAgGridHelpers(
    `ag-theme-${themeName}`
  );

  return (
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          {...agGridProps}
          {...props}
          rowData={dataGridExampleData}
          columnDefs={columnsWithGrouping("US States")}
        />
      </div>
    </StackLayout>
  );
};

const columnsWithGrouping = (groupName: string) => [
  {
    headerName: groupName,
    children: dataGridExampleColumns,
  },
];

export default ColumnGroup;
