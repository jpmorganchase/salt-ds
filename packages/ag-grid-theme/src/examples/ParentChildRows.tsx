import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import parentChildExampleColumns from "../dependencies/parentChildExampleColumns";
import parentChildExampleData from "../dependencies/parentChildExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const ParentChildRows = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
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
