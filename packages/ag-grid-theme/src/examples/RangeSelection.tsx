import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useEffect } from "react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

export const RangeSelection = (props: AgGridReactProps) => {
  const { agGridProps, containerProps, isGridReady, api } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api?.addCellRange({
        rowStartIndex: 1,
        rowEndIndex: 10,
        columnStart: "code",
        columnEnd: "population",
      });
    }
  }, [isGridReady]);

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        rowData={dataGridExampleData}
        columnDefs={dataGridExampleColumns}
        rowSelection="multiple"
        enableRangeSelection
        onFirstDataRendered={(params) => {
          params.api.forEachNode((node, index) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (node.data && index < 7 && index > 2) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              node.setSelected(true);
            }
          });
        }}
      />
    </div>
  );
};

export default RangeSelection;
