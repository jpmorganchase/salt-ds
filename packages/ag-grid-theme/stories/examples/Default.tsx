import React, { useState } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@salt-ds/lab";

const Default = (props: AgGridReactProps) => {
  const [isSaltTheme, setSaltTheme] = useState(false);

  const onThemeChange = () => {
    setSaltTheme(!isSaltTheme);
  };

  const { containerProps, agGridProps } = useAgGridHelpers(
    isSaltTheme ? "ag-theme-salt" : undefined
  );

  return (
    <div>
      <div>
        <Switch
          checked={isSaltTheme}
          onChange={onThemeChange}
          label="Salt AG Grid theme"
        />
      </div>
      <div style={{ height: 500, width: 900 }} {...containerProps}>
        <AgGridReact
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
          rowSelection="single"
          {...agGridProps}
          {...props}
        />
      </div>
    </div>
  );
};

export default Default;
