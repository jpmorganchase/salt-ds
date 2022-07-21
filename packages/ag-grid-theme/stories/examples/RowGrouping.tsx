import React, { useEffect } from "react";
import { LicenseManager } from "ag-grid-enterprise";

/**
 * Example data can be found here
 * https://bitbucketdc.jpmchase.net/projects/JPMUITK/repos/jpm-ui-toolkit/browse/packages/data-grid/examples/dependencies
 */
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGrouping from "../dependencies/dataGridExampleRowGrouping";

// ideally these css files would be loaded from a link tag
// pointing to static asset directory for caching
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

LicenseManager.setLicenseKey("your license key");

const RowGroupingExample = function RowGroupingExample(
  props: AgGridReactProps
) {
  const { agGridProps, containerProps, isGridReady, api } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div style={{ height: 800, width: 800 }} {...containerProps}>
      <AgGridReact
        columnDefs={dataGridExampleRowGrouping}
        rowData={dataGridExampleData}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

export default function RowGrouping(props: AgGridReactProps) {
  return <RowGroupingExample {...props} />;
}
