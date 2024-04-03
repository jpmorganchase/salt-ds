import { Checkbox, StackLayout, useDensity } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { ChangeEvent, useEffect, useState } from "react";
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
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers({
    compact,
  });
  const { defaultColDef: propsColDefs, ...restAgGridProps } = agGridProps;

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [api, isGridReady]);

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
      <div {...containerProps} style={{ height: "400px", width: "500px" }}>
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
