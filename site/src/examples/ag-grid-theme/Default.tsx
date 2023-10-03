import { AgGridReact } from "ag-grid-react";
import { ReactElement } from "react";
import { StackLayout } from "@salt-ds/core";
import { defaultData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const Default = (): ReactElement => {
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
    <StackLayout gap={4}>
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
          rowData={defaultData}
          rowSelection="single"
          {...agGridProps}
        />
      </div>
    </StackLayout>
  );
};