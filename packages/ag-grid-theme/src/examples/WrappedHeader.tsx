import { ChangeEvent, useEffect, useState } from "react";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import {
  StackLayout,
  FlexItem,
  FlexLayout,
  Checkbox,
  useDensity,
} from "@salt-ds/core";
import dataGridExampleColumnsWrap from "../dependencies/dataGridExampleColumnsWrap";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
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
  const { switcher, themeName } = useAgGridThemeSwitcher();
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
      <FlexLayout direction="row">
        {switcher}
        <FlexItem>
          <Checkbox
            checked={compact && density === "high"}
            label="Compact (for high density only)"
            onChange={handleCompactChange}
            disabled={density !== "high"}
          />
        </FlexItem>
      </FlexLayout>
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
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default WrappedHeader;
