import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import { dataGridExampleData, groupedColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

const ColumnGroup = (props: AgGridReactProps) => {
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
    <StackLayout gap={4}>
      <div {...containerProps}>
        <AgGridReact
          {...agGridProps}
          {...props}
          rowData={dataGridExampleData}
          columnDefs={groupedColumns("US States")}
        />
      </div>
    </StackLayout>
  );
};

export default ColumnGroup;
