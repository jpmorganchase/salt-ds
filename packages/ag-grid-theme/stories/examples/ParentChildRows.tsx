import React, { useEffect } from "react";
import parentChildExampleColumns from "../dependencies/parentChildExampleColumns";
import parentChildExampleData from "../dependencies/parentChildExampleData";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import "../../uitk-ag-theme.css";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const ParentChildRows = (props: AgGridReactProps) => {
  const { isGridReady, api, agGridProps, containerProps } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api!.sizeColumnsToFit();
    }
  }, [isGridReady]);

  return (
    <div style={{ marginTop: 25, height: 800, width: 800 }} {...containerProps}>
      <AgGridReact
        animateRows
        treeData
        {...agGridProps}
        {...props}
        columnDefs={parentChildExampleColumns}
        getDataPath={(data: any) => {
          return data.orgHierarchy;
        }}
        groupDefaultExpanded={-1}
        rowData={parentChildExampleData}
      />
    </div>
  );
};

export default ParentChildRows;
