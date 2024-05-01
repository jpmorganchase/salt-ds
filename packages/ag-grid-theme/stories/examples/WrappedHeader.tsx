import { Checkbox, FlexItem, StackLayout, useDensity } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
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
  const { themeName } = useAgGridThemeSwitcher();
  const { api, agGridProps, containerProps, isGridReady } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
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
      <FlexItem>
        <Checkbox
          checked={compact && density === "high"}
          label="Compact (for high density only)"
          onChange={handleCompactChange}
          disabled={density !== "high"}
        />
      </FlexItem>
      <div {...containerProps} style={{ height: "400px", width: "500px" }}>
        <AgGridReact
          columnDefs={dataGridExampleColumnsWrap}
          rowData={dataGridExampleData}
          statusBar={statusBar}
          rowSelection="multiple"
          defaultColDef={{
            ...propsColDefs,
            autoHeaderHeight: true,
            wrapHeaderText: true,
          }}
          {...restAgGridProps}
          {...props}
        />
      </div>
    </StackLayout>
  );
};

WrappedHeader.parameters = {
  chromatic: { disableSnapshot: false },
};

export default WrappedHeader;
