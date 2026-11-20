import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { parentChildColumns, parentChildData } from "./data";

export const ParentChildRows = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        animateRows
        treeData
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
        defaultColDef={{ filter: true }}
        {...props}
        columnDefs={parentChildColumns}
        getDataPath={(data) => {
          return data.orgHierarchy;
        }}
        groupDefaultExpanded={-1}
        rowData={parentChildData}
      />
    </div>
  );
};
