import React, { useEffect, useState } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@jpmorganchase/uitk-core";

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

  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
  };

  const { isGridReady, api, agGridProps, containerProps } = useAgGridHelpers(
    isNewTheme ? "ag-theme-odyssey" : undefined
  );

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div>
      <div>
        <Switch
          checked={isNewTheme}
          onChange={onThemeChange}
          label="New theme"
        />
      </div>
      <div
        style={{ marginTop: 25, height: 800, width: 800 }}
        {...containerProps}
      >
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
