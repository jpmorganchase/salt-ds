import React, { useEffect } from "react";
import { LicenseManager } from "ag-grid-enterprise";
import "../../uitk-ag-theme.css";
import columnDefs from "../dependencies/masterDetailExampleData";
import rowData from "../dependencies/dataGridExampleData";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

LicenseManager.setLicenseKey("your license key");

const MasterDetailExample = function MasterDetailExample(
  props: AgGridReactProps
) {
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers();
  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
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
  );
};

export default function MasterDetail(props: AgGridReactProps) {
  return <MasterDetailExample {...props} />;
}
