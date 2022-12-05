import React, { useEffect } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const ColumnGroup = (props: AgGridReactProps) => {
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
        columnDefs={columnsWithGrouping("US States")}
      />
    </div>
  );
};

const columnsWithGrouping = (groupName: string) => [
  {
    headerName: groupName,
    children: dataGridExampleColumns,
  },
];

export default ColumnGroup;
