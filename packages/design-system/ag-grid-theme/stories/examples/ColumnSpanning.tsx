import React, { useEffect } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import columnSpanningExampleColumns from "../dependencies/columnSpanningExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const ColumnSpanningExample = function ColumnSpanningExample(
  props: AgGridReactProps
) {
  const { api, isGridReady, agGridProps, containerProps } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div style={{ marginTop: 25, height: 800, width: 800 }} {...containerProps}>
      <AgGridReact {...agGridProps} {...props} />
    </div>
  );
};

ColumnSpanningExample.defaultProps = {
  columnDefs: columnSpanningExampleColumns,
  rowData: dataGridExampleData,
};

export default function ColumnSpanning(props: AgGridReactProps) {
  return <ColumnSpanningExample {...props} />;
}
