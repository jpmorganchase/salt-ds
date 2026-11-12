import { Checkbox, StackLayout, useDensity } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { type ChangeEvent, useState } from "react";
import dataGridExampleColumnsWrap from "../dependencies/dataGridExampleColumnsWrap";
import dataGridExampleData from "../dependencies/dataGridExampleData";

const statusBar = {
  statusPanels: [
    {
      statusPanel: "agTotalRowCountComponent",
      align: "left",
    },
    { statusPanel: "agFilteredRowCountComponent" },
    { statusPanel: "agSelectedRowCountComponent" },
    { statusPanel: "agAggregationComponent" },
  ],
};

const WrappedHeader = (props: AgGridReactProps) => {
  const [compact, setCompact] = useState(false);
  const density = useDensity();
  // Only opt into HD Compact when the nearest provider uses high density.
  const className =
    compact && density === "high" ? "ag-theme-salt-compact" : "ag-theme-salt";

  const handleCompactChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCompact(event.target.checked);
  };

  return (
    <StackLayout gap={4}>
      <Checkbox
        checked={compact && density === "high"}
        label="Compact (for high density only)"
        onChange={handleCompactChange}
        disabled={density !== "high"}
      />
      <div className={className} style={{ height: 500, width: 800 }}>
        <AgGridReact
          {...props}
          columnDefs={dataGridExampleColumnsWrap}
          rowData={dataGridExampleData}
          statusBar={statusBar}
          rowSelection="multiple"
          defaultColDef={{
            filter: true,
            autoHeaderHeight: true,
            wrapHeaderText: true,
          }}
        />
      </div>
    </StackLayout>
  );
};

export default WrappedHeader;
