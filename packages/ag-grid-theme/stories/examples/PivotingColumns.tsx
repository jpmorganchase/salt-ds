import React, { useEffect } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const PivotingColumnsExample = function PivotingColumnsExample(
  props: AgGridReactProps
) {
  const columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name",
      width: 120,
      rowGroup: true,
      enableRowGroup: true,
    },
    {
      headerName: "Code",
      field: "code",
      width: 90,
      pivot: true,
      enablePivot: true,
    },
    {
      headerName: "Capital",
      field: "capital",
      width: 110,
      enablePivot: true,
      enableRowGroup: true,
    },
    {
      headerName: "Population",
      field: "population",
      width: 110,
      enablePivot: true,
      enableRowGroup: true,
    },
  ];
  const defaultColDef: ColDef = {
    resizable: true,
    filter: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    sortable: true,
  };

  const { isGridReady, api, agGridProps, containerProps } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div style={{ marginTop: 25, height: 800, width: 800 }} {...containerProps}>
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        // enablePivot
        rowData={dataGridExampleData}
        sideBar
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

PivotingColumnsExample.defaultProps = {
  columnDefs: dataGridExampleColumns,
  rowData: dataGridExampleData,
};

export default function PivotingColumns(props: AgGridReactProps) {
  return <PivotingColumnsExample {...props} />;
}
