import React, { useEffect, useState } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import columnSpanningExampleColumns from "../dependencies/columnSpanningExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@salt-ds/lab";

const ColumnSpanning = (props: AgGridReactProps) => {
  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
  };

  const { api, isGridReady, agGridProps, containerProps } = useAgGridHelpers(
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
        style={{ marginTop: 25, height: 800, width: 800 }}
        {...containerProps}
      >
        <AgGridReact
          {...agGridProps}
          {...props}
          columnDefs={columnSpanningExampleColumns}
          rowData={dataGridExampleData}
        />
      </div>
    </div>
  );
};

export default ColumnSpanning;
