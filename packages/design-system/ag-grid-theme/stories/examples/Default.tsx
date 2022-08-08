import React from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const Default = (props: AgGridReactProps) => {
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
    <div style={{ height: 500, width: 900 }} {...containerProps}>
      <AgGridReact
        columnDefs={dataGridExampleColumns}
        rowData={dataGridExampleData}
        rowSelection="single"
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

export default Default;
