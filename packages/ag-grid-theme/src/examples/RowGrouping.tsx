import { useDensity } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGrouping from "../dependencies/dataGridExampleRowGrouping";

const RowGrouping = (props: AgGridReactProps) => {
  const density = useDensity();
  // Only opt into HD Compact when the nearest provider uses high density.
  const className =
    density === "high" ? "ag-theme-salt-compact" : "ag-theme-salt";

  return (
    <div className={className} style={{ height: 500, width: 800 }}>
      <AgGridReact
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
