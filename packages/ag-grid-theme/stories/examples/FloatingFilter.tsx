import React, { useEffect, useState } from "react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import customFilterExampleColumns from "../dependencies/customFilterExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import "../../uitk-ag-theme.css";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@salt-ds/lab";

const FloatingFilter = (props: AgGridReactProps) => {
  const [isSaltTheme, setSaltTheme] = useState(false);

  const onThemeChange = () => {
    setSaltTheme(!isSaltTheme);
  };

  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers(
    isSaltTheme ? "ag-theme-salt" : undefined
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
          checked={isSaltTheme}
          onChange={onThemeChange}
          label="Salt AG Grid theme"
        />
      </div>
      <div
        style={{ marginTop: 25, height: 800, width: 800 }}
        {...containerProps}
      >
        <AgGridReact
          defaultColDef={{ floatingFilter: true }}
          columnDefs={customFilterExampleColumns}
          rowData={dataGridExampleData}
          {...agGridProps}
          {...props}
        />
      </div>
    </div>
  );
};

export default FloatingFilter;
