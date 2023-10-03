import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import { defaultData, groupedColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const ColumnGroup = (props: AgGridReactProps) => {
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
    <StackLayout gap={4}>
      <div {...containerProps}>
        <AgGridReact
          {...agGridProps}
          {...props}
          rowData={defaultData}
          columnDefs={groupedColumns("US States")}
        />
      </div>
    </StackLayout>
  );
};
