import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import parentChildExampleColumns from "../dependencies/parentChildExampleColumns";
import parentChildExampleData from "../dependencies/parentChildExampleData";

const ParentChildRows = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        animateRows
        treeData
        columnDefs={parentChildExampleColumns}
        getDataPath={(data) => {
          return data.orgHierarchy;
        }}
        groupDefaultExpanded={-1}
        rowData={parentChildExampleData}
      />
    </div>
  );
};

export default ParentChildRows;
