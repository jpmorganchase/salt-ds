import { Checkbox, StackLayout, useDensity } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { ChangeEvent, useState } from "react";
import dataGridExampleColumnsWrap from "../dependencies/dataGridExampleColumnsWrap";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

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
      <Checkbox
        checked={compact && density === "high"}
        label="Compact (for high density only)"
        onChange={handleCompactChange}
        disabled={density !== "high"}
      />
      <div {...containerProps}>
        <AgGridReact
          {...restAgGridProps}
          {...props}
          columnDefs={dataGridExampleColumnsWrap}
          rowData={dataGridExampleData}
          statusBar={statusBar}
          rowSelection="multiple"
          defaultColDef={{
            ...propsColDefs,
            autoHeaderHeight: true,
            wrapHeaderText: true,
          }}
        />
      </div>
    </StackLayout>
  );
};

export default WrappedHeader;
