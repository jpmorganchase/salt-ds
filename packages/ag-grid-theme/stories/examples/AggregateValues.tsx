import React, { useEffect, useState } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@salt-ds/lab";

export const AggregateValues = (props: AgGridReactProps) => {
  const [isSaltTheme, setSaltTheme] = useState(false);

  const onThemeChange = () => {
    setSaltTheme(!isSaltTheme);
  };

  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "Name",
      field: "name",
      width: 100,
      sortable: true,
      filter: true,
      resizable: true,
      aggFunc: "sum",
      enableValue: true,
      allowedAggFuncs: ["sum", "min", "max"],
      rowGroup: true,
    },
    {
      headerName: "Code",
      field: "code",
      width: 100,
      sortable: true,
      filter: true,
      resizable: true,
      aggFunc: "min",
      enableValue: true,
    },
    {
      headerName: "Country",
      field: "country",
      width: 100,
      sortable: true,
      filter: true,
      resizable: true,
      aggFunc: "max",
      enableValue: true,
    },
    {
      headerName: "Capital",
      field: "capital",
      width: 100,
      sortable: true,
      filter: true,
      resizable: true,
      aggFunc: "avg",
      enableValue: true,
    },
    {
      headerName: "Population",
      field: "population",
      width: 90,
    },
  ]);

  const [defaultColDef] = useState({
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    sortable: true,
    filter: true,
  });

  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers(
    isSaltTheme ? "ag-theme-salt" : undefined
  );

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div>
      <div>
        <Switch
          checked={isSaltTheme}
          onChange={onThemeChange}
          label="Salt AG Grid theme"
        />
      </div>
      <div
        style={{ height: 500, width: 900, marginTop: 25 }}
        {...containerProps}
      >
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={dataGridExampleData}
          sideBar
          {...agGridProps}
          {...props}
        />
      </div>
    </div>
  );
};
