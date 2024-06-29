import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGrouping from "../dependencies/dataGridExampleRowGrouping";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const RowGrouping = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers({ compact: true });

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={dataGridExampleRowGrouping}
        rowData={dataGridExampleData}
        // Make sure all groups expanded by default
        groupDefaultExpanded={-1}
        // Show value in group leaf node
        autoGroupColumnDef={{
          field: "name",
        }}
      />
    </div>
  );
};

export default RowGrouping;
