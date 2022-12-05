import React, { useEffect } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumnsColoration from "../dependencies/dataGridExampleColumnsColoration";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const Coloration = (props: AgGridReactProps) => {
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div style={{ height: 800, width: 800, marginTop: 25 }} {...containerProps}>
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
