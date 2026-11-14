import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import dataGridExampleData from "../dependencies/dataGridExampleData";

const Default = ({
  containerClassName,
  ...agProps
}: AgGridReactProps & { containerClassName?: string }) => {
  const statusBar = {
    statusPanels: [
      {
        statusPanel: "agTotalRowCountComponent",
        align: "right",
      },
    ],
  };

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
        statusBar={statusBar}
        cellSelection={true}
      />
    </div>
  );
};

export default Default;
