import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { parentChildColumns, parentChildData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

const ParentChildRows = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
      <div {...containerProps}>
        <AgGridReact
          animateRows
          treeData
          {...agGridProps}
          {...props}
          columnDefs={parentChildColumns}
          getDataPath={(data: any) => {
            return data.orgHierarchy;
          }}
          groupDefaultExpanded={-1}
          rowData={parentChildData}
        />
      </div>
  );
};

export default ParentChildRows;
