import { ChangeEvent, useEffect, useState } from "react";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { StackLayout, Checkbox, useDensity } from "@salt-ds/core";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultData } from "./data";
import { wrappedColumns } from "./data/wrappedColumns";

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

export const WrappedHeader = (props: AgGridReactProps) => {
  const [compact, setCompact] = useState(false);
  const { api, agGridProps, containerProps, isGridReady } =
    useAgGridHelpers(compact);
  const { defaultColDef: propsColDefs, ...restAgGridProps } = agGridProps;

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

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
          columnDefs={wrappedColumns}
          rowData={defaultData}
          statusBar={statusBar}
          rowSelection="multiple"
          defaultColDef={{
            ...propsColDefs,
            autoHeaderHeight: true,
          }}
          {...restAgGridProps}
          {...props}
        />
      </div>
    </StackLayout>
  );
};