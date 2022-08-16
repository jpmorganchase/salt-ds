import React, { useEffect } from "react";
import { LicenseManager } from "ag-grid-enterprise";

/**
 * Example data can be found here
 * https://bitbucketdc.jpmchase.net/projects/JPMUITK/repos/jpm-ui-toolkit/browse/packages/data-grid/examples/dependencies
 */
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGroupPanel from "../dependencies/dataGridExampleRowGroupPanel";

// ideally these css files would be loaded from a link tag
// pointing to static asset directory for caching
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

LicenseManager.setLicenseKey("your license key");

const RowGroupPanelExample = function RowGroupPanelExample(
  props: AgGridReactProps
) {
  const { agGridProps, containerProps, api, isGridReady } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div style={{ height: 800, width: 800 }} {...containerProps}>
      <AgGridReact
        columnDefs={dataGridExampleRowGroupPanel}
        defaultColDef={{
          enableRowGroup: true,
        }}
        rowData={dataGridExampleData}
        rowGroupPanelShow="always"
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

export default function RowGroupPanel(props: AgGridReactProps) {
  return <RowGroupPanelExample {...props} />;
}
