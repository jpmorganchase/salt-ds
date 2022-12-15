import React, { useEffect, useState } from "react";
import { LicenseManager } from "ag-grid-enterprise";

import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGrouping from "../dependencies/dataGridExampleRowGrouping";

// ideally these css files would be loaded from a link tag
// pointing to static asset directory for caching
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@salt-ds/lab";

LicenseManager.setLicenseKey("your license key");

const RowGrouping = (props: AgGridReactProps) => {
  const [isSaltTheme, setSaltTheme] = useState(false);

  const onThemeChange = () => {
    setSaltTheme(!isSaltTheme);
  };

  const { agGridProps, containerProps, isGridReady, api } = useAgGridHelpers(
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
      <div style={{ height: 800, width: 800 }} {...containerProps}>
        <AgGridReact
          columnDefs={dataGridExampleRowGrouping}
          rowData={dataGridExampleData}
          {...agGridProps}
          {...props}
        />
      </div>
    </div>
  );
};

export default RowGrouping;
