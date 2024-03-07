import { ChangeEvent, useEffect, useState } from "react";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import {
  StackLayout,
  FlexItem,
  FlexLayout,
  Checkbox,
  useDensity,
} from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const longNamesData = dataGridExampleData.map((d) => ({
  ...d,
  name: Array(10).fill(d.name).join(" "),
}));

const WrappedCell = (props: AgGridReactProps) => {
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
          {...restAgGridProps}
          {...props}
        />
      </div>
    </StackLayout>
  );
};

WrappedCell.parameters = {
  chromatic: { disableSnapshot: false },
};

export default WrappedCell;
