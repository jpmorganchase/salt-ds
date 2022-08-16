import React, { useEffect } from "react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import "../../uitk-ag-theme.css";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const FloatingFilterExample = function FloatingFilterExample(
  props: AgGridReactProps
) {
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div style={{ marginTop: 25, height: 800, width: 800 }} {...containerProps}>
      <AgGridReact
        defaultColDef={{ floatingFilter: true }}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

FloatingFilterExample.defaultProps = {
  columnDefs: customFilterExampleColumns,
  rowData: dataGridExampleData,
};

export default function FloatingFilter(props: AgGridReactProps) {
  return <FloatingFilterExample {...props} />;
}
