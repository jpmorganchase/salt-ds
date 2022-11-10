import React, { useEffect, useState } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@jpmorganchase/uitk-core";

const AggregateValuesExample = function AggregateValuesExample(
  props: AgGridReactProps
) {
  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
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
    isNewTheme ? "ag-theme-odyssey" : undefined
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
          checked={isNewTheme}
          onChange={onThemeChange}
          label="New theme"
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

AggregateValuesExample.defaultProps = {
  rowData: dataGridExampleData,
};

export function AggregateValues(props: AgGridReactProps) {
  return <AggregateValuesExample {...props} />;
}
