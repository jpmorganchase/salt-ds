import React, { useEffect } from "react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import "../../uitk-ag-theme.css";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const headerOn = {
  headerName: "On",
  field: "on",
  checkboxSelection: true,
  headerCheckboxSelection: true,
};

const [headerName, , headerCapital] = dataGridExampleColumns;

const CheckboxSelection = (props: AgGridReactProps) => {
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div style={{ marginTop: 25, height: 800, width: 800 }} {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        rowData={dataGridExampleData}
        columnDefs={[headerOn, headerName, headerCapital]}
      />
    </div>
  );
};

export default CheckboxSelection;
