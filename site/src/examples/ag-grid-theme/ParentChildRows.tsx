import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { parentChildColumns, parentChildData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const ParentChildRows = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        animateRows
        treeData
        {...agGridProps}
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
