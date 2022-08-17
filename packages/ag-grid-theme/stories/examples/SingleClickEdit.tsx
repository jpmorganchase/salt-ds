import React, { useEffect } from "react";

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
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const SingleClickEditExample = function SingleClickEditExample(
  props: AgGridReactProps
) {
  const { containerProps, agGridProps, api, isGridReady } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div style={{ marginTop: 25, height: 800, width: 800 }}>
      <AgGridReact {...props} singleClickEdit {...agGridProps} />
    </div>
  );
};

SingleClickEditExample.defaultProps = {
  columnDefs: dataGridExampleColumns,
  rowData: dataGridExampleData,
};

export default function SingleClickEdit(props: AgGridReactProps) {
  return <SingleClickEditExample {...props} />;
}
