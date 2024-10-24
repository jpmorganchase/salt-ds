import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const Default = ({
  containerClassName,
  ...agProps
}: AgGridReactProps & { containerClassName?: string }) => {
  const { agGridProps, containerProps } = useAgGridHelpers({
    containerClassName,
  });

  const statusBar = {
    statusPanels: [
      {
        statusPanel: "agTotalRowCountComponent",
        align: "right",
      },
    ],
  };

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
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
