import React, { useEffect, useState } from "react";

import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";

// ideally these css files would be loaded from a link tag
// pointing to static asset directory for caching
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@salt-ds/lab";

const SingleClickEdit = (props: AgGridReactProps) => {
  const [isSaltTheme, setSaltTheme] = useState(false);

  const onThemeChange = () => {
    setSaltTheme(!isSaltTheme);
  };

  const { containerProps, agGridProps, api, isGridReady } = useAgGridHelpers(
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
      <div style={{ marginTop: 25, height: 800, width: 800 }}>
        <AgGridReact
          {...props}
          singleClickEdit
          {...agGridProps}
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
        />
      </div>
    </div>
  );
};

export default SingleClickEdit;
