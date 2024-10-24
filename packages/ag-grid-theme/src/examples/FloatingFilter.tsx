import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const FloatingFilter = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        defaultColDef={{ floatingFilter: true }}
        columnDefs={customFilterExampleColumns}
        rowData={dataGridExampleData}
        suppressMenuHide={false}
      />
    </div>
  );
};

export default FloatingFilter;
