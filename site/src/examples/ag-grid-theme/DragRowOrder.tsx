import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultData, rowDragColumns } from "./data";

export const DragRowOrder = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        animateRows
        rowDragManaged
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
        defaultColDef={{ filter: true }}
        {...props}
        columnDefs={rowDragColumns}
        rowData={defaultData}
      />
    </div>
  );
};
