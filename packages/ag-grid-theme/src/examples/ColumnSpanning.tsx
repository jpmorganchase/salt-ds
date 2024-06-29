import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import columnSpanningExampleColumns from "../dependencies/columnSpanningExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const ColumnSpanning = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={columnSpanningExampleColumns}
        rowData={dataGridExampleData}
      />
    </div>
  );
};

export default ColumnSpanning;
