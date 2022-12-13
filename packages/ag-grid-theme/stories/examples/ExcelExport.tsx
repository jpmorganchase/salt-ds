import React, { useEffect, useState } from "react";
import { LicenseManager } from "ag-grid-enterprise";
import { Button, Switch } from "@jpmorganchase/uitk-core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import "../../uitk-ag-theme.css";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

LicenseManager.setLicenseKey("your license key");

const ExcelExport = (props: AgGridReactProps) => {
  const [isNewTheme, setNewTheme] = useState(false);

  const onThemeChange = () => {
    setNewTheme(!isNewTheme);
  };

  const { api, containerProps, agGridProps, isGridReady } = useAgGridHelpers(
    isNewTheme ? "ag-theme-odyssey" : undefined
  );

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  const handleButtonClick = () => {
    if (isGridReady) {
      api!.exportDataAsExcel();
    }
  };

  return (
    <div>
      <div>
        <Switch
          checked={isNewTheme}
          onChange={onThemeChange}
          label="New theme"
        />
      </div>
      <div>
        <Button
          disabled={!isGridReady}
          onClick={handleButtonClick}
          style={{ marginBottom: "20px" }}
        >
          Export as Excel
        </Button>
        <div style={{ width: 800, height: 800 }} {...containerProps}>
          <AgGridReact
            columnDefs={dataGridExampleColumns}
            rowData={dataGridExampleData}
            {...agGridProps}
            {...props}
          />
        </div>
      </div>
    </div>
  );
};

export default ExcelExport;
