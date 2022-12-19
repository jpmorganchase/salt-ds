import React, { useEffect, useState } from "react";
import { LicenseManager } from "ag-grid-enterprise";
import "../../uitk-ag-theme.css";
import columnDefs from "../dependencies/masterDetailExampleData";
import rowData from "../dependencies/dataGridExampleData";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { Switch } from "@salt-ds/lab";

LicenseManager.setLicenseKey("your license key");

const MasterDetail = (props: AgGridReactProps) => {
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
      <div style={{ height: 800, width: 800 }} {...containerProps}>
        <AgGridReact
          columnDefs={columnDefs}
          detailCellRendererParams={{
            detailGridOptions: { columnDefs },
            getDetailRowData: (params: any) => params.successCallback(rowData),
          }}
          masterDetail={true}
          detailRowHeight={300}
          rowData={rowData}
          {...agGridProps}
          {...props}
        />
      </div>
    </div>
  );
};

export default MasterDetail;
