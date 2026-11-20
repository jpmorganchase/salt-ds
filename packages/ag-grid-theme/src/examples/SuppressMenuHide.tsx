import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import dataGridExampleData from "../dependencies/dataGridExampleData";

export const SuppressMenuHide = ({
  containerClassName,
  ...agProps
}: AgGridReactProps & { containerClassName?: string }) => {
  return (
    <div
      className={clsx("ag-theme-salt", containerClassName)}
      style={{ height: 500, width: 800 }}
    >
      <AgGridReact
        {...agProps}
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
            tooltipField: "capital",
            headerTooltip: "Capital",
          },
        ]}
        rowData={dataGridExampleData}
        rowSelection="single"
        cellSelection={true}
        // Default value changed in v32
        suppressMenuHide={false}
      />
    </div>
  );
};
