import React, { useEffect, useState } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumnsColoration from "../dependencies/dataGridExampleColumnsColoration";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@salt-ds/lab";

const Coloration = (props: AgGridReactProps) => {
  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
  };

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
        style={{ height: 800, width: 800, marginTop: 25 }}
        {...containerProps}
      >
        <AgGridReact
          {...agGridProps}
          {...props}
          columnDefs={dataGridExampleColumnsColoration}
          rowData={dataGridExampleData}
        />
      </div>
    </div>
  );
};

export default Coloration;
