import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { parentChildColumns, parentChildData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const ParentChildRows = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        animateRows
        treeData
        {...agGridProps}
        {...props}
        columnDefs={parentChildColumns}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getDataPath={(data: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
          return data.orgHierarchy;
        }}
        groupDefaultExpanded={-1}
        rowData={parentChildData}
      />
    </div>
  );
};
