import { Checkbox, FlexItem, StackLayout, useDensity } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { type ChangeEvent, useState } from "react";
import dataGridExampleData from "../dependencies/dataGridExampleData";

const longNamesData = dataGridExampleData.map((d) => ({
  ...d,
  name: Array(10).fill(d.name).join(" "),
}));

const WrappedCell = (props: AgGridReactProps) => {
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
      <FlexItem>
        <Checkbox
          checked={compact && density === "high"}
          label="Compact (for high density only)"
          onChange={handleCompactChange}
          disabled={density !== "high"}
        />
      </FlexItem>
      <div className={className} style={{ height: 500, width: 800 }}>
        <AgGridReact
          {...props}
          columnDefs={[
            {
              headerName: "Repeated Name",
              field: "name",
              wrapText: true,
              autoHeight: true,
            },
            {
              headerName: "Code",
              field: "code",
            },
            {
              headerName: "Capital",
              field: "capital",
            },
          ]}
          rowData={longNamesData}
        />
      </div>
    </StackLayout>
  );
};

export default WrappedCell;
