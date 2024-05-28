import { Checkbox, FlexItem, StackLayout, useDensity } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { ChangeEvent, useState } from "react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const longNamesData = dataGridExampleData.map((d) => ({
  ...d,
  name: Array(10).fill(d.name).join(" "),
}));

const WrappedCell = (props: AgGridReactProps) => {
  const [compact, setCompact] = useState(false);
  const { agGridProps, containerProps } = useAgGridHelpers({
    compact,
  });
  const { defaultColDef: propsColDefs, ...restAgGridProps } = agGridProps;

  const density = useDensity();

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
      <div {...containerProps}>
        <AgGridReact
          {...restAgGridProps}
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
          defaultColDef={propsColDefs}
        />
      </div>
    </StackLayout>
  );
};

export default WrappedCell;
