import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumnsColoration from "../dependencies/dataGridExampleColumnsColoration";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const Coloration = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={dataGridExampleColumnsColoration}
        rowData={dataGridExampleData}
      />
    </div>
  );
};

export default Coloration;
