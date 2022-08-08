import React, { useEffect } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const DataGridExample = function DataGridExample(props: AgGridReactProps) {
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers();
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

DataGridExample.defaultProps = {
  columnDefs: dataGridExampleColumns,
  rowData: dataGridExampleData,
};

const columnsWithGrouping = (groupName: string) => [
  {
    headerName: groupName,
    children: dataGridExampleColumns,
  },
];

const ColumnGroupExample = (props: AgGridReactProps) => (
  <DataGridExample columnDefs={columnsWithGrouping("US States")} {...props} />
);

export default function ColumnGroup(props: AgGridReactProps) {
  return <ColumnGroupExample {...props} />;
}
