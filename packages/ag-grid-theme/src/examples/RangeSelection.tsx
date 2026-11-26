import type { GridReadyEvent } from "ag-grid-community";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";

const onGridReady = ({ api }: GridReadyEvent) => {
  api.addCellRange({
    rowStartIndex: 1,
    rowEndIndex: 10,
    columnStart: "code",
    columnEnd: "population",
  });
};

export const RangeSelection = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        onGridReady={onGridReady}
        {...props}
        rowData={dataGridExampleData}
        columnDefs={dataGridExampleColumns}
        rowSelection="multiple"
        cellSelection
        onFirstDataRendered={(params) => {
          params.api.forEachNode((node, index) => {
            if (node.data && index < 7 && index > 2) {
              node.setSelected(true);
            }
          });
        }}
      />
    </div>
  );
};

export default RangeSelection;
