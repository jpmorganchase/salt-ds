import React, { useEffect } from "react";
import { LicenseManager } from "ag-grid-enterprise";

/**
 * Example data can be found here
 * https://bitbucketdc.jpmchase.net/projects/JPMUITK/repos/jpm-ui-toolkit/browse/packages/data-grid/examples/dependencies
 */
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";

// ideally these css files would be loaded from a link tag
// pointing to static asset directory for caching
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import { ColDef } from "ag-grid-community";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

LicenseManager.setLicenseKey("your license key");

/*
 * Adds the agSetFilter to the capital column definition
 * filterParams option used to ensure selectAll checkbox and clear button appear in filter GUI
 */
const applyExampleConfig = (columnDefs: ColDef[]) => {
  const [nameColumnDef, codeColumnDef, capitalColumnDef, populationColumnDef] =
    columnDefs;

  capitalColumnDef.filterParams = {
    cellHeight: 34,
    clearButton: true,
    selectAllOnMiniFilter: true,
  };

  return [nameColumnDef, codeColumnDef, capitalColumnDef, populationColumnDef];
};

const SetFilterExample = function SetFilterExample(props: AgGridReactProps) {
  const { containerProps, agGridProps, isGridReady, api } = useAgGridHelpers();
  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  const columnDefs = applyExampleConfig(dataGridExampleColumns);

  return (
    <div style={{ height: 800, width: 800 }} {...containerProps}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={dataGridExampleData}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

export default function SetFilter(props: AgGridReactProps) {
  return <SetFilterExample {...props} />;
}
